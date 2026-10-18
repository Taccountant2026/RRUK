import { respond, json, validViewToken, isAdmin } from '@/lib/server';
import { getOrder, orderDocument, reconcileOrder } from '@/lib/payments';
import { ShopError } from '@/lib/commerce.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return respond(async()=>{const {id}=await params,url=new URL(request.url);if(!await validViewToken(id,url.searchParams.get('token')||''))throw new ShopError('Order not found.',404);let order=await getOrder(id);if(!order)throw new ShopError('Order not found.',404);
  if(order.mode==='test'&&['creating','open','processing'].includes(order.status)&&await isAdmin()){await reconcileOrder(order);order=(await getOrder(id))!;}
  if(url.searchParams.get('download')==='1')return new Response(await orderDocument(order),{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="RRUK-order-${order.id}.txt"`,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
  return json({id:order.id,status:order.status,mode:order.mode,totalPence:order.total_pence,shippingPence:order.shipping_pence,createdAt:order.created_at,paidAt:order.paid_at,items:JSON.parse(order.items_json),policyVersion:order.policy_version,tracking:order.tracking,carrier:order.carrier,requestHash:order.request_hash});
});}
