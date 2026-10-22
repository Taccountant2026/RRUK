import businessConfig from '../operations-brand.json' with {type:'json'};
import {ShopError} from './commerce.mjs';

export const brands={
  rruk:{name:'RetroReplay UK',short:'RRUK',home:'https://retroreplay.uk',email:'info@retroreplay.uk',accent:'#ef6956',logo:'/assets/rruk-logo.jpg',description:'Your orders, repairs and retro gaming requests.'},
  bytova:{name:'Bytova',short:'Bytova',home:'https://bytova.co.uk',email:'hello@bytova.co.uk',accent:'#00b5da',logo:'/assets/Bytova_Logo.png',description:'Your appointments, technical jobs and support records.'},
  garden:{name:'Stone & Sprig',short:'Stone & Sprig',home:'https://stoneandsprig.co.uk',email:'',accent:'#668064',logo:'/assets/stone-sprig-logo.png',description:'Your garden projects, enquiries and agreed work.'},
};
export const businessBrand=businessConfig.id;
export const kindSets={rruk:['enquiry','booking','repair','job'],bytova:['enquiry','booking','quote','job','incident'],garden:['enquiry','quote','booking','job']};
export const kinds=kindSets[businessBrand];
export const statuses=['new','awaiting_customer','in_progress','scheduled','completed','cancel_requested','cancelled','closed'];
export const statusLabels={new:'New request',awaiting_customer:'Waiting for your reply',in_progress:'In progress',scheduled:'Scheduled',completed:'Completed',cancel_requested:'Cancellation requested',cancelled:'Cancelled',closed:'Closed'};
export const bookingServices=[
  {id:'remote-help',name:'Remote Tech Help',price:'£25 · 30 minutes',url:'https://calendly.com/leighton-hepworth22/bytova-remote-computer-help'},
  {id:'setup',name:'Setup & Getting Started',price:'£35 · 60 minutes',url:'https://calendly.com/leighton-hepworth22/bytova-pc-speed-up'},
  {id:'care',name:'Computer Care & Safety Check',price:'£29 · 60 minutes',url:'https://calendly.com/leighton-hepworth22/bytova-windows-security-check'},
];
export function brandId(value=businessBrand){const v=value==='stone-sprig'?'garden':value;if(v!==businessBrand||!Object.hasOwn(brands,v))throw new ShopError('This request belongs to a different business.');return v;}
export function text(value,max,label,required=false){if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new ShopError(`Please check ${label}.`);const v=value.trim();if(required&&!v)throw new ShopError(`Enter ${label}.`);return v;}
export function reference(value){if(typeof value!=='string'||!/^[a-f0-9-]{36}$/.test(value))throw new ShopError('Check the record reference.');return value;}
export function revision(value){if(!Number.isSafeInteger(value)||value<0)throw new ShopError('Refresh the record before saving.',409);return value;}
export function parseRequest(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new ShopError('Check the request.');
  const brand=brandId(input.brand),kind=input.kind;if(!kinds.includes(kind))throw new ShopError('Choose a request type.');
  const title=text(input.title,140,'a short title',true),description=text(input.description,8000,'the details',true),requestKey=reference(input.requestKey);
  const preferredAt=text(input.preferredAt||'',64,'the preferred date');const preferredInstant=preferredAt?londonInstant(preferredAt):'';
  const serviceId=text(input.serviceId||'',80,'the service');if(serviceId&&!(brand==='bytova'&&bookingServices.some(s=>s.id===serviceId)))throw new ShopError('Choose a recognised service.');
  if(input.privacy!==true)throw new ShopError('Please acknowledge how this request will be used.');
  // Ownership, roles, payment states and external booking confirmation never come from this payload.
  return {brand,kind,title,description,preferredAt:preferredInstant,serviceId,requestKey};
}
export function canCancel(status){return !['completed','closed','cancelled','cancel_requested'].includes(status);}
export function cancellationStatus(status){if(!canCancel(status))throw new ShopError('This record cannot receive another cancellation request.',409);return 'cancel_requested';}
export function canReadCase(record,userId,owner=false){return !!record&&(owner||(!!userId&&record.user_id===userId));}
export function publicCase(row,owner=false){const quoteVisible=owner||row.quote_status!=='draft';return {quotePence:quoteVisible?row.quote_pence:null,quoteStatus:quoteVisible?(row.quote_status||'none'):'none',quoteTerms:quoteVisible?(row.quote_terms||''):'',quoteReplyAt:row.quote_reply_at||null,id:row.id,brand:row.brand,kind:row.kind,title:row.title,description:row.description,status:row.status,revision:row.revision,preferredAt:row.preferred_at||'',scheduledAt:row.scheduled_at||'',serviceId:row.service_id||'',providerRef:row.provider_ref||'',createdAt:row.created_at,updatedAt:row.updated_at,customerName:row.customer_name,customerEmail:row.customer_email,userId:row.user_id||null};}
export function safeProviderUrl(value){if(!value)return '';let u;try{u=new URL(value);}catch{throw new ShopError('Check the booking management link.');}if(u.protocol!=='https:'||u.username||u.password||!['calendly.com','bytova.co.uk','retroreplay.uk','stoneandsprig.co.uk'].includes(u.hostname))throw new ShopError('Use an official business or Calendly booking link.');return u.href;}
export function orderProof(input,origin='https://retroreplay.uk'){
  let u;try{u=new URL(text(input.url,1000,'the private order link',true));}catch{throw new ShopError('Paste the complete private order link from your order confirmation.');}
  if(!['https://retroreplay.uk',origin].includes(u.origin)||u.username||u.password)throw new ShopError('Use your private RetroReplay UK order link.');
  const m=u.pathname.match(/^\/order\/([a-f0-9-]{36})$/),token=u.searchParams.get('token')||'';
  if(!m||!/^[a-f0-9]{64}$/.test(token))throw new ShopError('Use the complete private order link, including its token.');return {id:m[1],token};
}
export function attachmentType(bytes,type){
  const b=new Uint8Array(bytes);if(type==='application/pdf'&&new TextDecoder().decode(b.slice(0,5))==='%PDF-')return type;
  if(type==='image/png'&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return type;
  if(type==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255)return type;
  if(type==='text/plain'){try{if(!new TextDecoder('utf-8',{fatal:true}).decode(b).includes('\0'))return type;}catch{}}
  throw new ShopError('Upload a PDF, PNG, JPEG or plain-text file.');
}
export const customerListSql='SELECT * FROM ops_cases WHERE user_id=? AND brand=? ORDER BY updated_at DESC LIMIT 200';
export const customerDetailSql='SELECT * FROM ops_cases WHERE id=? AND user_id=?';
export const sharedMessagesSql="SELECT id,body,sender_role,created_at FROM ops_messages WHERE case_id=? AND visibility='shared' ORDER BY created_at,id LIMIT 300";

export function londonInput(value){if(!value)return '';const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;}
export function londonInstant(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw new ShopError('Enter a valid date and time in London time.');
 const assumed=Date.parse(value+'Z');if(!Number.isFinite(assumed))throw new ShopError('Check the date and time.');let n=assumed;
 for(let i=0;i<4;i++){const represented=Date.parse(londonInput(new Date(n).toISOString())+'Z'),delta=assumed-represented;if(!delta)break;n+=delta;}
 if(londonInput(new Date(n).toISOString())!==value)throw new ShopError('That London time does not exist because the clocks change. Choose a different time.');return new Date(n).toISOString();
}
export function quoteInput(input){const amount=input.quotePence;if(!Number.isSafeInteger(amount)||amount<0||amount>10000000)throw new ShopError('Enter a quote total from £0 to £100,000.');const terms=text(input.quoteTerms,8000,'the quote scope and terms',true);if(!['draft','sent'].includes(input.quoteStatus))throw new ShopError('Choose draft or send to customer.');return {amount,terms,status:input.quoteStatus};}
