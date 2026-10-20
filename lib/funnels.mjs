import {ShopError} from './commerce.mjs';
import {parseSubmission} from './community.mjs';

export const funnelRoutes={
 bytova:[
  {id:'remote',label:'Everyday computer help',service:'',path:'find-support.html'},
  {id:'repairs',label:'Repairs & upgrades',service:'repairs',path:'computer-hardware-repairs.html'},
  {id:'websites',label:'A business website',service:'websites',path:'website-design-build.html'},
  {id:'ecommerce',label:'An online shop',service:'ecommerce',path:'ecommerce-websites.html'},
  {id:'marketing',label:'Content & online presence',service:'marketing',path:'marketing-online-presence.html'},
  {id:'automation',label:'Less repetitive admin',service:'automation',path:'automation-business-systems.html'},
  {id:'business-it',label:'Small-business IT',service:'business-it',path:'small-business-it-support.html'},
  {id:'general',label:'Help choosing',service:'',path:'services.html'},
 ],
 rruk:[
  {id:'returning-player',label:'Returning to retro',path:'/console-finder'},
  {id:'gifts',label:'Buying a gift',path:'/gifts'},
  {id:'collector',label:'A particular find',path:'/console-hunt'},
  {id:'setup',label:'Connections & setup',path:'/console-checker'},
  {id:'shortlist',label:'Saved-item shortlist',path:'/saved'},
  {id:'ready-buyer',label:'Ready to buy',path:'/shop?orderable=1'},
  {id:'community',label:'Replay Room visitors',path:'/community'},
  {id:'general',label:'Personal shopping help',path:'/personal-shopper'},
 ],
 garden:[
  {id:'project',label:'A garden project',path:'garden-projects.html'},
  {id:'products',label:'The planned garden range',path:'shop.html'},
  {id:'community',label:'The Potting Bench',path:'community.html'},
  {id:'privacy',label:'A privacy question',path:'privacy.html'},
  {id:'general',label:'A garden enquiry',path:'contact.html'},
 ],
};
export function funnelBrand(brand){return brand==='bytova'?'Bytova':brand==='garden'?'The Garden Company':'RetroReplay UK';}
export const funnelStages=[['new','New enquiry'],['contacted','Reply sent'],['proposal','Quote / options sent'],['won','Converted'],['closed','Closed']];
export function funnelRoute(brand,id){return Object.hasOwn(funnelRoutes,brand)?funnelRoutes[brand].find(r=>r.id===id)||null:null;}
export function campaignValue(value){return typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,59}$/.test(value)?value:'';}
export function campaignHref(href,value){
 const campaign=campaignValue(value);
 if(!campaign||typeof href!=='string'||!href.startsWith('/')||href.startsWith('//')||/^\/(?:admin|api|order|basket)(?:[/?#]|$)/.test(href))return href;
 const url=new URL(href,'https://retroreplay.uk');url.searchParams.set('utm_campaign',campaign);return url.pathname+url.search+url.hash;
}
export function leadOrigin(origin,requestOrigin){return origin===requestOrigin||['https://bytova.co.uk','https://www.bytova.co.uk','https://taccountant2026.github.io'].includes(origin);}
export function parseFunnelLead(input){
 const brand=input?.brand,route=funnelRoute(brand,input?.route);
 if(!['bytova','rruk','garden'].includes(brand)||!route)throw new ShopError('Please choose a valid enquiry route.');
 const submission=parseSubmission({...input,kind:'question',publishConsent:false});
 return {...submission,brand,route:route.id,campaign:campaignValue(input.campaign)};
}
export function leadPayload(input){return JSON.stringify([input.brand,input.route,input.campaign,input.kind,input.name,input.email,input.title,input.body,input.consent]);}
export function initialFunnelMeta(brand,route,campaign=''){return {brand,route:funnelRoute(brand,route)?.id||'general',campaign:campaignValue(campaign),stage:'new',nextAction:'',due:'',note:''};}
export function funnelMetaSql(){return "INSERT INTO settings(key,value,updated_at) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM community_submissions WHERE id=?) ON CONFLICT(key) DO NOTHING";}
export function progressSourceSql(source){
 if(source==='enquiry')return 'UPDATE enquiries SET status=?,updated_at=?,closed_at=? WHERE id=? AND changes()=1 AND EXISTS(SELECT 1 FROM settings WHERE key=? AND updated_at=?)';
 if(source==='submission')return 'UPDATE community_submissions SET status=?,updated_at=?,revision=revision+1 WHERE id=? AND kind!=\'story\' AND changes()=1 AND EXISTS(SELECT 1 FROM settings WHERE key=? AND updated_at=?)';
 throw new ShopError('Invalid enquiry source.');
}
export function parseProgress(input){
 if(!input||!['submission','enquiry'].includes(input.source)||typeof input.id!=='string'||!/^[a-f0-9-]{36}$/.test(input.id)||!Number.isSafeInteger(input.revision)||input.revision<0)throw new ShopError('Refresh the enquiry before updating it.',409);
 if(!funnelStages.some(([id])=>id===input.stage))throw new ShopError('Choose a valid stage.');
 const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
 const due=text(input.due,10);
 if(due&&(!/^\d{4}-\d{2}-\d{2}$/.test(due)||!Number.isFinite(Date.parse(due+'T12:00:00Z'))||new Date(due+'T12:00:00Z').toISOString().slice(0,10)!==due))throw new ShopError('Choose a valid follow-up date.');
 return {id:input.id,source:input.source,revision:input.revision,stage:input.stage,nextAction:text(input.nextAction,240),due,note:text(input.note,1200)};
}
/** @param {any} row @param {any} meta */
export function funnelRecord(row,meta){
 const brand=['bytova','garden'].includes(meta?.brand)?meta.brand:'rruk',route=funnelRoute(brand,meta?.route)?.id||(row.source==='enquiry'?'ready-buyer':row.kind==='hunt'?'collector':'general');
 const stage=row.status==='closed'&&meta?.stage!=='won'?'closed':funnelStages.some(([id])=>id===meta?.stage)?meta.stage:row.status==='contacted'?'contacted':'new';
 return {...row,brand,route,routeLabel:funnelRoute(brand,route)?.label||'General enquiry',campaign:campaignValue(meta?.campaign),stage,due:meta?.due||'',nextAction:meta?.nextAction||'',note:meta?.note||'',revision:meta?.revision||0};
}
/** @param {any} lead @param {string} kind */
export function followUpDraft(lead,kind='reply'){
 const brand=funnelBrand(lead.brand),name=String(lead.name||'there').replace(/[\r\n]/g,' ').slice(0,50),route=funnelRoute(lead.brand,lead.route),base=lead.brand==='bytova'?'https://bytova.co.uk/':lead.brand==='garden'?'https://taccountant2026.github.io/Turf-Right/':'https://retroreplay.uk';
 const url=route?base+route.path:base;
 const message=kind==='follow-up'?'I’m following up on the enquiry you sent. If you still need help, reply with any questions or changes. If your plans have changed, there is no need to proceed.':kind==='options'?'I’m putting the next step together for your enquiry.\n\n[Add the checked recommendation or written quote, total price, delivery / timing, what is included and anything still to confirm before sending.]':'Thank you for your enquiry.\n\n[Answer the customer’s question and add any details needed to agree a useful next step before sending.]';
 return {subject:`Your ${brand} enquiry — ${String(lead.title||'next steps').replace(/[\r\n]/g,' ').slice(0,100)}`,body:`Hello ${name},\n\n${message}\n\nYour starting point: ${url}\nReference: ${lead.id}\n\nNo purchase, reservation or extra work is agreed by this message alone.\n\nLeighton\n${brand}`};
}
