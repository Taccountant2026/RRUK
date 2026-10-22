import {actor} from './operations-server';
import {callAgentTool} from './agent-server';
import {agentName,agentSlug,agentBusiness} from './agent-info.mjs';
import {businessBrand,statusLabels} from './operations.mjs';
import {ownerIntent,normalise,money} from './assistant-core.mjs';
import {ShopError} from './commerce.mjs';
type Data=Record<string,any>;
const call=(name:string,args:Data={})=>callAgentTool(agentSlug+'_'+name,args) as Promise<Data>;
const rowView=(r:Data)=>({id:r.id,title:r.title,customer:r.customerName,status:statusLabels[r.status as keyof typeof statusLabels]||r.status,kind:r.kind,scheduledAt:r.scheduledAt||'',preferredAt:r.preferredAt||''});
const proposal=(suffix:string,args:Data,title:string,preview:string)=>({tool:agentSlug+'_'+suffix,arguments:args,title,preview});
export async function ownerAssistant(input:unknown){
 const identity=await actor();if(!identity.owner)throw new ShopError('Only the business owner can use the private assistant.',403);
 if(!input||typeof input!=='object'||Array.isArray(input))throw new ShopError('Check the assistant request.');
 const p=input as Data;
 if(p.mode==='execute'){
  const action=p.proposal;if(!action||typeof action!=='object'||!['add_note','set_work_status','draft_quote'].some(s=>action.tool===agentSlug+'_'+s))throw new ShopError('That action is not available from this assistant.',403);
  const result=await callAgentTool(action.tool,action.arguments);return {message:'Saved in '+agentBusiness+' with '+agentName+'’s audit identity. Private drafts remain visible only to you.',saved:true,result};
 }
 if(p.mode!==undefined&&p.mode!=='chat')throw new ShopError('Choose chat or a reviewed assistant action.');
 if(typeof p.message!=='string'||p.message.length>1500||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(p.message))throw new ShopError('Use a message of up to 1,500 characters.');
 const intent=ownerIntent(p.message),reply=(message:string,extra:Data={})=>({message,agent:agentName,business:agentBusiness,records:[],...extra});
 if(intent.kind==='restricted')return reply('I can help prepare and review that work here. External email sending, payment or refund changes, account permissions and provider booking confirmations remain outside this assistant’s current tools. Tell me a record reference to prepare a private reply or the next action.');
 if(intent.kind==='customers'){const data=await call('list_customers');return reply('These are this business’s existing customer accounts. Accounts are never shared or linked just because their email addresses match.',{customers:data.customers});}
 if(intent.kind==='orders'){
  if(businessBrand!=='rruk')return reply('This assistant manages '+agentBusiness+' only. I can help with this business’s work, enquiries, quotes and appointments.');
  const data=await call('list_orders'),orders=data.orders.filter((o:Data)=>!intent.reference||o.id.startsWith(intent.reference));return reply(orders.length?'Here are the matching RRUK order summaries. Payment state and fulfilment changes stay in Store & payments.':'No matching order appears in the latest order window.',{orders,openStore:true});
 }
 const data=await call('list_work'),records=data.cases as Data[];
 if(intent.kind==='overview'){
  const active=records.filter(r=>!['completed','closed','cancelled'].includes(r.status)),cancellations=active.filter(r=>r.status==='cancel_requested'),fresh=active.filter(r=>r.status==='new'),bookings=active.filter(r=>r.kind==='booking'||r.scheduledAt),priority=[...cancellations,...fresh,...active.filter(r=>!['new','cancel_requested'].includes(r.status))].slice(0,8);
  return reply(active.length?`${active.length} active work records; ${fresh.length} new and ${cancellations.length} awaiting a cancellation decision. Start with the records below. Preferred times are requests until an appointment is agreed.`:'There are no active work records yet. New customer enquiries and work you create will appear here.',{records:priority.map(rowView),stats:{active:active.length,new:fresh.length,cancellations:cancellations.length,appointments:bookings.length}});
 }
 if(intent.kind==='bookings')return reply('Here are appointments and preferred-time requests from this business’s work records. External calendar synchronisation is not connected to this workspace.',{records:records.filter(r=>r.kind==='booking'||r.scheduledAt).sort((a,b)=>(a.scheduledAt||a.preferredAt||'9999').localeCompare(b.scheduledAt||b.preferredAt||'9999')).slice(0,30).map(rowView)});
 if(intent.kind==='help')return reply(`Try “What needs attention today?”, “Show appointments”, “Show customers”${businessBrand==='rruk'?', “Show orders”':''}, “Draft a reply for [reference]”, “Mark [reference] in progress”, or “Draft a quote £150 for [reference]: [scope]”. I read live business records; changes appear for your review before they are saved.`);
 const requested=intent.reference||(/^[-a-f0-9]{36}$/.test(p.contextId||'')?p.contextId:'');
 if(!requested)return reply('Choose a work record below or include its first eight reference characters. Then tell me what you want drafted or changed.',{records:records.slice(0,8).map(rowView)});
 const matching=records.filter(r=>r.id.startsWith(requested));
 if(matching.length!==1)return reply(matching.length?'More than one reference matches. Use the full record reference.':'I cannot find that record in the latest 200 records. Open the record from the work queue and use its full reference.',{records:matching.slice(0,8).map(rowView)});
 const record=(await call('get_work',{id:matching[0].id})).record as Data;
 if(intent.kind==='record')return reply('Selected '+record.title+'. You can open it or ask me to draft a reply, quote or progress change.',{records:[rowView(record)],focusId:record.id});
 if(intent.kind==='status')return reply('Review this progress change before saving. Existing appointment details are preserved; no provider booking or payment is changed.',{records:[rowView(record)],focusId:record.id,proposal:proposal('set_work_status',{id:record.id,revision:record.revision,status:intent.status},'Change work status',record.title+'\n'+record.status+' → '+intent.status)});
 if(intent.kind==='quote'){
  const scope=p.message.includes(':')?p.message.slice(p.message.indexOf(':')+1).trim():'';
  if(intent.amount===null||!scope)return reply('Include the total and checked scope, for example: “Draft a quote £150 for '+record.id.slice(0,8)+': [inclusions, exclusions, timing and terms]”. I will save a private draft for your review.',{focusId:record.id,records:[rowView(record)]});
  if(scope.length>8000)throw new ShopError('Shorten the quote scope.');
  return reply('Review the total and scope. This saves a private draft and does not send the quote or take payment.',{focusId:record.id,proposal:proposal('draft_quote',{id:record.id,revision:record.revision,quotePence:intent.amount,quoteTerms:scope},'Save private quote draft',money(intent.amount)+' total\n\n'+scope)});
 }
 if(intent.kind==='draft'){
  const instruction=p.message.includes(':')?p.message.slice(p.message.indexOf(':')+1).trim():'',name=String(record.customerName||'there').replace(/[\r\n]/g,' ').slice(0,200),body=`Hello ${name},\n\nThank you for your ${agentBusiness} enquiry about “${record.title}”.\n\n${instruction||'[Review the request, add your checked answer, the proposed scope and any questions before sending.]'}\n\nReference: ${record.id}\n\nLeighton\n${agentBusiness}`;
  return reply('Here is a private reply draft. Review the facts and wording before you send it. Saving it creates an internal note; opening the email draft leaves the final send with you.',{focusId:record.id,records:[rowView(record)],proposal:proposal('add_note',{id:record.id,body:'Draft customer reply\n\n'+body,requestKey:crypto.randomUUID()},'Save private reply draft',body),emailDraft:record.customerEmail?{to:record.customerEmail,subject:agentBusiness+' · '+record.title,body}:undefined});
 }
 return reply('Open the record to continue.',{records:[rowView(record)],focusId:record.id});
}
