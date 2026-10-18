import type Stripe from 'stripe';
import { business } from '@/lib/shop';
import { contractPolicyText } from '@/lib/policies';
import { parseBasket, priceBasket, reservationSql, ShopError } from '@/lib/commerce.mjs';
import { getProducts } from '@/lib/catalogue-server';
import { db, respond, json, sameOrigin, bodyJson, hash, rateLimit, setting, isAdmin, viewToken } from '@/lib/server';
import { merchant, paymentMode, ensureCheckout, checkoutOrigin, type OrderRow } from '@/lib/payments';
export const dynamic='force-dynamic';
export async function POST(request:Request) { return respond(async()=>{
  sameOrigin(request);const input=parseBasket(await bodyJson(request)), mode=await paymentMode();
  if(await setting('payments-enabled')!=='1'||mode==='test'&&!await isAdmin())throw new ShopError('Checkout is not open yet. Please contact us about availability.',503);
  const m=await merchant(mode);if(!m?.webhookSecret)throw new ShopError('Checkout is temporarily unavailable.',503);
  const requestHash=await hash(input.requestKey),basketHash=await hash(JSON.stringify(input.items));
  let order=await db().prepare('SELECT * FROM orders WHERE request_hash=?').bind(requestHash).first<OrderRow>();
  if(order){if(order.basket_hash!==basketHash)throw new ShopError('Your basket changed. Refresh it and try again.',409);return json({url:await ensureCheckout(order,m)});}
  await rateLimit(request);const basket=priceBasket(input.items,await getProducts()),id=crypto.randomUUID(),now=Date.now(),expiresAt=(Math.floor(now/1000)+1860)*1000,origin=checkoutOrigin(request),token=await viewToken(id);
  const params:Stripe.Checkout.SessionCreateParams={mode:'payment',integration_identifier:'rruk-store-qmztrpkl',client_reference_id:id,metadata:{rruk_order:id,project:'RRUK',policy_version:business.policyVersion},branding_settings:{display_name:'RetroReplay UK',background_color:'#faf8f1',button_color:'#000c32'},line_items:basket.lines.map((l: {product: import('@/lib/shop').Product & {revision:number};quantity:number})=>({quantity:l.quantity,price_data:{currency:'gbp',unit_amount:l.product.pricePence,product_data:{name:l.product.title,description:`${l.product.condition}. ${l.product.includes.join(', ')}`.slice(0,500),metadata:{rruk_product:l.product.id}}}})),shipping_address_collection:{allowed_countries:['GB']},shipping_options:[{shipping_rate_data:{type:'fixed_amount',fixed_amount:{amount:basket.shipping,currency:'gbp'},display_name:'Tracked UK delivery'}}],expires_at:Math.floor(expiresAt/1000),success_url:`${origin}/order/${id}?token=${token}`,cancel_url:`${origin}/basket?cancelled=1`,custom_text:{submit:{message:'Sold by Leighton Hepworth trading as RetroReplay UK. See the sale terms accepted in your basket.'}},payment_intent_data:{metadata:{rruk_order:id,project:'RRUK'}}};
  try{await db().batch([db().prepare("INSERT INTO orders(id,request_hash,basket_hash,status,mode,account_id,total_pence,shipping_pence,items_json,policy_version,policy_text,expires_at,created_at,checkout_params) VALUES(?,?,?,'creating',?,?,?,?,?,?,?,?,?,?)").bind(id,requestHash,basketHash,mode,m.accountId,basket.total,basket.shipping,JSON.stringify(basket.lines),business.policyVersion,contractPolicyText(),expiresAt,now,JSON.stringify(params)),...basket.lines.map((l: {product: import('@/lib/shop').Product & {revision:number};quantity:number})=>db().prepare(reservationSql()).bind(l.product.revision,l.quantity,l.quantity,l.product.id))]);}
  catch{order=await db().prepare('SELECT * FROM orders WHERE request_hash=?').bind(requestHash).first<OrderRow>();if(order&&order.basket_hash===basketHash)return json({url:await ensureCheckout(order,m)});throw new ShopError('An item’s stock or details changed while you checked out. Please review your basket.',409);}
  order=await db().prepare('SELECT * FROM orders WHERE id=?').bind(id).first<OrderRow>();if(!order)throw new ShopError('Checkout could not be saved.',503);return json({url:await ensureCheckout(order,m)});
}); }
