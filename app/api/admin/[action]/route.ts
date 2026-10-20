import {getFunnelLeads,saveFunnelProgress} from '@/lib/funnel-server';
import { emailStatus, saveEmailConfiguration, testEmailConfiguration, setEmailEnabled, drainEmailOutbox, orderEmailStatements } from '@/lib/notification-server';
import { env } from 'cloudflare:workers';
import { requireAdmin, respond, json, db, bodyJson } from '@/lib/server';
import { getProducts, getSourceProducts, sourceOptions } from '@/lib/catalogue-server';
import sourceBase from '@/lib/sourcing-catalogue.json';
import { parseSourceOptions } from '@/lib/source-orders.mjs';
import { parseProduct, ShopError } from '@/lib/commerce.mjs';
import { canPublish } from '@/lib/community.mjs';
import { ownerTestCheckout } from '@/lib/test-payments';
import { paymentStatus, saveMerchant, configureWebhook, setPaymentOptions, checkoutOrigin, getOrder, reconcileOrder, orderDocument, verifyRefund, type OrderRow } from '@/lib/payments';
export const dynamic='force-dynamic';
type Ctx={params:Promise<{action:string}>};
export async function GET(request:Request,ctx:Ctx){return respond(async()=>{await requireAdmin();const {action}=await ctx.params;
  if(action==='funnels')return json({leads:await getFunnelLeads()});
  if(action==='emails')return json(await emailStatus());
  if(action==='community'){const rows=await db().prepare("SELECT id,kind,name,email,title,body,consent,status,revision,created_at FROM community_submissions WHERE NOT EXISTS(SELECT 1 FROM settings WHERE key='funnel:'||community_submissions.id AND json_extract(value,'$.brand') IN ('bytova','garden')) ORDER BY CASE status WHEN 'new' THEN 0 ELSE 1 END,created_at DESC LIMIT 200").all();return json({submissions:rows.results});}
  if(action==='status')return json({payments:await paymentStatus(checkoutOrigin(request)),origin:checkoutOrigin(request)});
  if(action==='products')return json({products:await getProducts(true)});
  if(action==='source-catalogue'){const row=await db().prepare('SELECT updated_at FROM settings WHERE key=?').bind('source-order-options').first<{updated_at:number}>();return json({...await sourceOptions(),products:await getSourceProducts(),revision:row?.updated_at||0});}
  if(action==='enquiries'){const rows=await db().prepare("SELECT id,product_id,product_slug,product_title,name,email,quantity,notes,status,created_at,updated_at,closed_at FROM enquiries ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 ELSE 2 END,created_at DESC LIMIT 200").all();return json({enquiries:rows.results});}
  if(action==='orders'){const rows=await db().prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100").all<OrderRow>();return json({orders:rows.results.map(o=>({id:o.id,status:o.status,mode:o.mode,totalPence:o.total_pence,shippingPence:o.shipping_pence,createdAt:o.created_at,paidAt:o.paid_at,tracking:o.tracking,carrier:o.carrier,items:JSON.parse(o.items_json),customer:o.customer_json?JSON.parse(o.customer_json):null}))});}
  if(action==='document'){const id=new URL(request.url).searchParams.get('id')||'',order=await getOrder(id);if(!order)throw new ShopError('Order not found.',404);return new Response(await orderDocument(order),{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="RRUK-order-${order.id}.txt"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
  throw new ShopError('Page not found.',404);
});}
export async function POST(request:Request,ctx:Ctx){return respond(async()=>{await requireAdmin(request);const {action}=await ctx.params,input=await bodyJson(request,100000);
  if(action==='funnel-progress')return json(await saveFunnelProgress(input));
  if(action==='email-settings')return json(await saveEmailConfiguration(input));
  if(action==='email-test')return json(await testEmailConfiguration());
  if(action==='email-enabled')return json(await setEmailEnabled(input));
  if(action==='email-process')return json(await drainEmailOutbox(3));
  if(action==='community'){
    if(typeof input.id!=='string'||!/^[a-f0-9-]{36}$/.test(input.id)||!Number.isInteger(input.revision)||!['new','published','closed'].includes(input.status))throw new ShopError('Refresh and check the submission.',409);
    const row=await db().prepare('SELECT kind,consent FROM community_submissions WHERE id=?').bind(input.id).first();
    if(!row)throw new ShopError('Submission not found.',404);
    if(input.status==='published'&&!canPublish(row))throw new ShopError('Only a story with publication permission can be published.');
    const result=await db().prepare('UPDATE community_submissions SET status=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(input.status,Date.now(),input.id,input.revision).run();
    if(!result.meta.changes)throw new ShopError('This submission changed. Refresh before reviewing it again.',409);
    return json({saved:true});
  }
  if(action==='test-checkout')return json(await ownerTestCheckout(request,input));
  if(action==='source-catalogue'){
    if(!Number.isSafeInteger(input.revision)||input.revision<0)throw new ShopError('Refresh the catalogue before saving.',409);
    const options=parseSourceOptions(input,sourceBase),now=Math.max(Date.now(),input.revision+1);
    const result=input.revision===0
      ?await db().prepare('INSERT INTO settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO NOTHING').bind('source-order-options',JSON.stringify(options),now).run()
      :await db().prepare('UPDATE settings SET value=?,updated_at=? WHERE key=? AND updated_at=?').bind(JSON.stringify(options),now,'source-order-options',input.revision).run();
    if(!result.meta.changes)throw new ShopError('The catalogue settings changed. Refresh and review the current prices before saving.',409);
    return json({saved:true});
  }
  if(action==='enquiry'){
    if(typeof input.id!=='string'||!/^[a-f0-9-]{36}$/.test(input.id)||!['new','contacted','closed'].includes(input.status))throw new ShopError('Please check the request reference and status.');
    const now=Date.now(),result=await db().prepare('UPDATE enquiries SET status=?,updated_at=?,closed_at=? WHERE id=?').bind(input.status,now,input.status==='closed'?now:null,input.id).run();
    if(!result.meta.changes)throw new ShopError('Request not found.',404);
    return json({saved:true});
  }
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
  if(action==='dispatch'){let order=await getOrder(String(input.id||''));if(order?.status==='paid'&&order.mode==='live'){await reconcileOrder(order);order=await getOrder(order.id);}if(!order||order.status!=='paid'||order.mode!=='live')throw new ShopError('Only a verified paid live order can be dispatched. Reconcile its payment first.',409);const tracking=String(input.tracking||'').trim(),carrier=String(input.carrier||'').trim();if(!tracking||tracking.length>180||!carrier||carrier.length>80||input.contractIncluded!==true)throw new ShopError('Add the carrier and tracking reference, and confirm the order terms are included with the parcel.');const at=Date.now(),snapshot={...order,status:'dispatched',tracking,carrier,dispatched_at:at},messages=await orderEmailStatements(snapshot,await orderDocument(snapshot),'dispatched');const results=await db().batch([db().prepare("UPDATE orders SET status='dispatched',tracking=?,carrier=?,dispatched_at=? WHERE id=? AND status='paid' AND restocked=0").bind(tracking,carrier,at,order.id),...messages]);if(!results[0].meta.changes)throw new ShopError('The order status changed. Refresh it before dispatching.',409);return json({saved:true});}
  if(action==='record-refund'){const order=await getOrder(String(input.id||''));if(!order?.session_id)throw new ShopError('A verified Checkout Session is required.');const result=await verifyRefund(order);if(!result.status)throw new ShopError('Stripe has not confirmed a refund. Process the refund in the correct Stripe account first.');return json({saved:true,...result});}
  if(action==='maintenance'){const result=await db().prepare("SELECT * FROM orders WHERE status IN ('open','creating','processing') ORDER BY created_at ASC LIMIT 20").all<OrderRow>();const outcomes=[];for(const o of result.results)outcomes.push({id:o.id,status:await reconcileOrder(o)});await db().prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(Date.now()).run();await db().prepare("DELETE FROM orders WHERE created_at<? AND status IN ('expired','failed') AND restocked=1").bind(Date.now()-90*86400000).run();await db().prepare('DELETE FROM webhook_events WHERE received_at<?').bind(Date.now()-90*86400000).run();await db().prepare("DELETE FROM community_submissions WHERE status='closed' AND updated_at<?").bind(Date.now()-365*86400000).run();const cutoff=new Date();cutoff.setUTCFullYear(cutoff.getUTCFullYear()-1);await db().prepare("DELETE FROM enquiries WHERE status='closed' AND closed_at<?").bind(cutoff.getTime()).run();await db().prepare("DELETE FROM settings WHERE key LIKE 'funnel:%' AND NOT EXISTS(SELECT 1 FROM community_submissions WHERE 'funnel:'||id=settings.key) AND NOT EXISTS(SELECT 1 FROM enquiries WHERE 'funnel:'||id=settings.key)").run();return json({checked:outcomes.length,outcomes});}
  throw new ShopError('Action not found.',404);
});}
