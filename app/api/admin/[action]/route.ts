import { env } from 'cloudflare:workers';
import { requireAdmin, respond, json, db, bodyJson } from '@/lib/server';
import { getProducts } from '@/lib/catalogue-server';
import { parseProduct, ShopError } from '@/lib/commerce.mjs';
import { ownerTestCheckout } from '@/lib/test-payments';
import { paymentStatus, saveMerchant, configureWebhook, setPaymentOptions, checkoutOrigin, getOrder, reconcileOrder, orderDocument, verifyRefund, type OrderRow } from '@/lib/payments';
export const dynamic='force-dynamic';
type Ctx={params:Promise<{action:string}>};
export async function GET(request:Request,ctx:Ctx){return respond(async()=>{await requireAdmin();const {action}=await ctx.params;
  if(action==='status')return json({payments:await paymentStatus(checkoutOrigin(request)),origin:checkoutOrigin(request)});
  if(action==='products')return json({products:await getProducts(true)});
  if(action==='orders'){const rows=await db().prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100").all<OrderRow>();return json({orders:rows.results.map(o=>({id:o.id,status:o.status,mode:o.mode,totalPence:o.total_pence,shippingPence:o.shipping_pence,createdAt:o.created_at,paidAt:o.paid_at,tracking:o.tracking,carrier:o.carrier,items:JSON.parse(o.items_json),customer:o.customer_json?JSON.parse(o.customer_json):null}))});}
  if(action==='document'){const id=new URL(request.url).searchParams.get('id')||'',order=await getOrder(id);if(!order)throw new ShopError('Order not found.',404);return new Response(await orderDocument(order),{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="RRUK-order-${order.id}.txt"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
  throw new ShopError('Page not found.',404);
});}
export async function POST(request:Request,ctx:Ctx){return respond(async()=>{await requireAdmin(request);const {action}=await ctx.params,input=await bodyJson(request,100000);
  if(action==='test-checkout')return json(await ownerTestCheckout(request,input));
  if(action==='product'){
    const p=parseProduct(input),id=typeof input.id==='string'?input.id:crypto.randomUUID();if(!/^[a-f0-9-]{36}$/.test(id))throw new ShopError('Invalid item reference.');
    if(p.active){for(const image of p.images){if(!env.BUCKET||!await env.BUCKET.head(image.replace('/api/media/','')))throw new ShopError('An item photo is missing. Please upload it again.');}}
    const values=[p.slug,p.title,p.category,p.description,p.condition,p.conditionNotes,p.pricePence,p.stock,p.active?1:0,JSON.stringify(p.images),JSON.stringify(p.includes),p.compatibility,p.shippingPence,p.deliveryEstimate,p.warrantyMonths,Date.now()];
    if(input.id){if(!Number.isInteger(input.revision))throw new ShopError('Refresh the item before editing.',409);const result=await db().prepare('UPDATE products SET slug=?,title=?,category=?,description=?,condition=?,condition_notes=?,price_pence=?,stock=?,active=?,images_json=?,includes_json=?,compatibility=?,shipping_pence=?,delivery_estimate=?,warranty_months=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(...values,id,input.revision).run();if(!result.meta.changes)throw new ShopError('Stock or item details changed while you were editing. Refresh the list and check the current stock before saving.',409);}
    else{try{await db().prepare('INSERT INTO products(slug,title,category,description,condition,condition_notes,price_pence,stock,active,images_json,includes_json,compatibility,shipping_pence,delivery_estimate,warranty_months,updated_at,id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...values,id).run();}catch{throw new ShopError('That item URL is already in use. Choose another slug.');}}
    return json({saved:true,id});
  }
  if(action==='archive'){await db().prepare('UPDATE products SET active=0,revision=revision+1,updated_at=? WHERE id=?').bind(Date.now(),String(input.id||'')).run();return json({saved:true});}
  if(action==='payment-key')return json(await saveMerchant(input,checkoutOrigin(request)));
  if(action==='payment-webhook')return json(await configureWebhook(input.mode==='live'?'live':'test',checkoutOrigin(request)));
  if(action==='payment-options')return json(await setPaymentOptions(input,checkoutOrigin(request)));
  if(action==='reconcile'){const order=await getOrder(String(input.id||''));if(!order)throw new ShopError('Order not found.',404);return json({status:await reconcileOrder(order)});}
  if(action==='dispatch'){let order=await getOrder(String(input.id||''));if(order?.status==='paid'&&order.mode==='live'){await reconcileOrder(order);order=await getOrder(order.id);}if(!order||order.status!=='paid'||order.mode!=='live')throw new ShopError('Only a verified paid live order can be dispatched. Reconcile its payment first.',409);const tracking=String(input.tracking||'').trim(),carrier=String(input.carrier||'').trim();if(!tracking||tracking.length>180||!carrier||carrier.length>80||input.contractIncluded!==true)throw new ShopError('Add the carrier and tracking reference, and confirm the order terms are included with the parcel.');const result=await db().prepare("UPDATE orders SET status='dispatched',tracking=?,carrier=?,dispatched_at=? WHERE id=? AND status='paid' AND restocked=0").bind(tracking,carrier,Date.now(),order.id).run();if(!result.meta.changes)throw new ShopError('The order status changed. Refresh it before dispatching.',409);return json({saved:true});}
  if(action==='record-refund'){const order=await getOrder(String(input.id||''));if(!order?.session_id)throw new ShopError('A verified Checkout Session is required.');const result=await verifyRefund(order);if(!result.status)throw new ShopError('Stripe has not confirmed a refund. Process the refund in the correct Stripe account first.');return json({saved:true,...result});}
  if(action==='maintenance'){const result=await db().prepare("SELECT * FROM orders WHERE status IN ('open','creating','processing') ORDER BY created_at ASC LIMIT 20").all<OrderRow>();const outcomes=[];for(const o of result.results)outcomes.push({id:o.id,status:await reconcileOrder(o)});await db().prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(Date.now()).run();await db().prepare("DELETE FROM orders WHERE created_at<? AND status IN ('expired','failed') AND restocked=1").bind(Date.now()-90*86400000).run();await db().prepare('DELETE FROM webhook_events WHERE received_at<?').bind(Date.now()-90*86400000).run();return json({checked:outcomes.length,outcomes});}
  throw new ShopError('Action not found.',404);
});}
