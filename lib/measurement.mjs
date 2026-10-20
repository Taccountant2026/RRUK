import {ShopError} from './commerce.mjs';
import publicPages from './measurement-pages.json' with {type:'json'};
export const measurementBrands={rruk:'RetroReplay UK',bytova:'Bytova',garden:'The Outdoor Living Co.'};
export const measurementEvents=['page_view','start_tool','complete_tool','save_item','begin_checkout','open_booking','enquiry_receipt'];
export const measurementCampaigns=['bytova-remote-autumn26','bytova-repairs-autumn26','bytova-websites-autumn26','bytova-shop-autumn26','bytova-content-autumn26','bytova-automation-autumn26','rruk-start-autumn26','rruk-gifts-autumn26','rruk-collectors-autumn26','rruk-setup-autumn26','rruk-community-autumn26','rruk-shop-autumn26','outdoor-projects-autumn26','outdoor-planner-autumn26','outdoor-pots-autumn26','outdoor-wildlife-autumn26','outdoor-journal-autumn26','outdoor-range-autumn26'];
export function statisticsOrigin(origin,requestOrigin){return [requestOrigin,'https://retroreplay.uk','https://bytova.co.uk','https://www.bytova.co.uk','https://taccountant2026.github.io'].includes(origin);}
export function statisticsPage(brand,path){
 if(typeof path!=='string'||path.length>180||/[?#%\\\s]/.test(path))return null;
 if(brand==='rruk'){
  if(publicPages.rruk.includes(path))return path;
  if(/^\/product\/[a-z0-9-]{1,80}$/.test(path))return '/product/*';
  if(/^\/collections\/[a-z0-9-]{1,80}$/.test(path))return '/collections/*';
  if(/^\/blog\/[a-z0-9-]{1,80}$/.test(path))return '/blog/*';
  return null;
 }
 return Object.hasOwn(publicPages,brand)&&publicPages[brand].includes(path)?path:null;
}
export function parseStatistic(input,origin,requestOrigin){
 if(!input||!Object.hasOwn(measurementBrands,input.brand)||input.consent!==true||!measurementEvents.includes(input.event))throw new ShopError('Invalid statistics event.');
 const expected=input.brand==='garden'?['https://taccountant2026.github.io']:input.brand==='bytova'?['https://bytova.co.uk','https://www.bytova.co.uk']:['https://retroreplay.uk',requestOrigin];
 if(!expected.includes(origin))throw new ShopError('Invalid statistics origin.',403);
 const page=statisticsPage(input.brand,input.page);if(!page)throw new ShopError('This page is excluded from statistics.');
 return {brand:input.brand,page,event:input.event,campaign:measurementCampaigns.includes(input.campaign)?input.campaign:''};
}
export function statisticRecord(event,at=Date.now()){
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
 const record={...event,day,count:1};return {key:'traffic:'+day+':'+event.brand+':'+event.page+':'+event.event+':'+event.campaign,value:JSON.stringify(record)};
}
export function statisticSql(){return "INSERT INTO settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=json_set(settings.value,'$.count',MIN(1000000000,CAST(json_extract(settings.value,'$.count') AS INTEGER)+1)),updated_at=excluded.updated_at";}
export function statisticsSince(days,now=Date.now()){
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 const utc=new Date(today+'T00:00:00Z');utc.setUTCDate(utc.getUTCDate()-days+1);
 const offset=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',hourCycle:'h23'}).format(utc));
 return utc.getTime()-offset*3600000;
}
export function statisticsSummary(rows,brand='all'){
 const clean=[];for(const raw of rows){try{const row=typeof raw.value==='string'?JSON.parse(raw.value):raw;if(!Object.hasOwn(measurementBrands,row.brand)||!measurementEvents.includes(row.event)||!Number.isSafeInteger(row.count)||row.count<1||!/^\d{4}-\d{2}-\d{2}$/.test(row.day))continue;if(brand!=='all'&&row.brand!==brand)continue;clean.push(row);}catch{}}
 const count=(event)=>clean.filter(r=>r.event===event).reduce((n,r)=>n+r.count,0);
 const pages=new Map(),days=new Map(),campaigns=new Map();for(const r of clean){if(r.event==='page_view'){pages.set(r.brand+'|'+r.page,(pages.get(r.brand+'|'+r.page)||0)+r.count);days.set(r.day,(days.get(r.day)||0)+r.count);if(r.campaign)campaigns.set(r.brand+'|'+r.campaign,(campaigns.get(r.brand+'|'+r.campaign)||0)+r.count);}}
 const ranked=m=>[...m].map(([key,count])=>({key,count})).sort((a,b)=>b.count-a.count).slice(0,30);
 return {pageViews:count('page_view'),toolStarts:count('start_tool'),toolCompletions:count('complete_tool'),itemSaves:count('save_item'),checkoutStarts:count('begin_checkout'),bookingOpens:count('open_booking'),receiptViews:count('enquiry_receipt'),pages:ranked(pages),campaigns:ranked(campaigns),days:[...days].sort(([a],[b])=>a.localeCompare(b)).map(([day,count])=>({day,count}))};
}
