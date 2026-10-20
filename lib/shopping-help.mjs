import {inCollection} from './browse.mjs';
import {orderLimit} from './commerce.mjs';

export const giftBudgets=[30,50,100,150,250];
export function giftShortlist(products,kind,budget){
 const collection={extras:'gifts-essentials',handheld:'handhelds',home:'consoles'}[kind];
 if(!collection||!giftBudgets.includes(Number(budget)))return [];
 return products.filter(p=>orderLimit(p)>0&&!p.priceOnRequest&&Number.isSafeInteger(p.pricePence)&&p.pricePence>0&&p.pricePence<=Number(budget)*100&&inCollection(p,collection))
  .sort((a,b)=>a.pricePence-b.pricePence||a.title.localeCompare(b.title)).slice(0,6);
}

/** @param {{goal?:string,budget?:string,setup?:string,message?:string,items?:Array<{title:string}>}} input */
export function shoppingRequestBody({goal,budget,setup,message,items=[]}){
 const pick=(value,choices)=>choices.includes(value)?value:'Not sure yet';
 const clean=v=>String(v||'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim();
 const names=items.slice(0,6).map(p=>clean(p.title).slice(0,120)).filter(Boolean);
 return ['Private shopping-help request',
  'Shopping for: '+pick(goal,['My own setup','A gift','A particular console or game','Not sure yet']),
  'Item budget before delivery: '+pick(budget,['Up to £30','Up to £50','Up to £100','Up to £150','Up to £250','More than £250','Not sure yet']),
  'Preferred setup: '+pick(setup,['A TV / home console','A handheld','Accessories for a known model','Not sure yet']),
  '',clean(message).slice(0,1600),
  ...(names.length?['','Items I chose to include:',...names.map(n=>'- '+n)]:[]),
  '','Please reply about this request. I understand this is not a reservation, purchase or mailing-list subscription.',
 ].join('\n');
}
