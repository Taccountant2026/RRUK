import {respond,json,bodyJson,sameOrigin} from '@/lib/server';
import {actor,listCases,caseDetail,createCase,addMessage,updateCase,customers,ownedOrders,linkOrder,downloadOrder,uploadFile,downloadFile,saveQuote,replyQuote,assignCustomer} from '@/lib/operations-server';
import {ShopError} from '@/lib/commerce.mjs';
export const dynamic='force-dynamic';
type Ctx={params:Promise<{action:string}>};
export async function GET(request:Request,ctx:Ctx){return respond(async()=>{const a=await actor(),{action}=await ctx.params,u=new URL(request.url);
 if(action==='cases')return json(await listCases(a));
 if(action==='case')return json(await caseDetail(u.searchParams.get('id')||'',a));
 if(action==='customers')return json(await customers(a));
 if(action==='orders')return json(await ownedOrders(a));
 if(action==='order-document')return downloadOrder(u.searchParams.get('id')||'',a);
 if(action==='file')return downloadFile(u.searchParams.get('id')||'',a);
 throw new ShopError('Page not found.',404);
});}
export async function POST(request:Request,ctx:Ctx){return respond(async()=>{sameOrigin(request);const a=await actor(),{action}=await ctx.params;if(action==='file')return json(await uploadFile(request,a));const input=await bodyJson(request,20000);if(!input||typeof input!=='object'||Array.isArray(input))throw new ShopError('Check the submitted information.');
 if(action==='create')return json(await createCase(input,a));
 if(action==='message')return json(await addMessage(input,a));
 if(action==='update')return json(await updateCase(input,a));
 if(action==='assign')return json(await assignCustomer(input,a));
 if(action==='quote')return json(await saveQuote(input,a));
 if(action==='quote-reply')return json(await replyQuote(input,a));
 if(action==='link-order')return json(await linkOrder(input,a,new URL(request.url).origin));
 throw new ShopError('Page not found.',404);
});}
