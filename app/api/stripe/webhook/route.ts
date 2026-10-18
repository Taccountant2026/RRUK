import Stripe from 'stripe';
import { db, json, respond, limitedBytes } from '@/lib/server';
import { merchant, stripeClient, getOrder, syncSession, recordWebhookSeen, checkoutOrigin, type Mode, type Merchant } from '@/lib/payments';
import { ShopError } from '@/lib/commerce.mjs';
export const dynamic='force-dynamic';
export async function POST(request:Request){return respond(async()=>{const signature=request.headers.get('stripe-signature');if(!signature)throw new ShopError('Missing signature.',400);const body=new TextDecoder().decode(await limitedBytes(request,1000000));let event:Stripe.Event|undefined,mode:Mode|undefined,verifiedMerchant:Merchant|undefined;for(const candidate of ['test','live'] as Mode[]){const m=await merchant(candidate);if(!m?.webhookSecret)continue;try{const verified=await stripeClient(m.key).webhooks.constructEventAsync(body,signature,m.webhookSecret,300,Stripe.createSubtleCryptoProvider());if(verified.livemode===(candidate==='live')){event=verified;mode=candidate;verifiedMerchant=m;break;}}catch{}}
  if(!event||!mode||!verifiedMerchant)throw new ShopError('Invalid signature.',400);
  await recordWebhookSeen(verifiedMerchant,checkoutOrigin(request));
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type))return json({received:true});
  if(await db().prepare('SELECT id FROM webhook_events WHERE id=?').bind(event.id).first())return json({received:true});
  const sessionId=(event.data.object as Stripe.Checkout.Session).id,m=await merchant(mode);if(!m)throw new ShopError('Merchant unavailable.',503);const session=await stripeClient(m.key).checkout.sessions.retrieve(sessionId),id=session.metadata?.rruk_order;
  if(!id||session.metadata?.project!=='RRUK')return json({received:true});
  let order=await getOrder(id);if(!order||order.account_id!==m.accountId||order.mode!==mode)throw new ShopError('Order verification failed.',409);
  if(!order.session_id){await db().prepare('UPDATE orders SET session_id=?,checkout_url=COALESCE(checkout_url,?) WHERE id=? AND session_id IS NULL').bind(session.id,session.url||null,id).run();order=(await getOrder(id))!;}
  await syncSession(order,session,event.type);
  await db().prepare('INSERT OR IGNORE INTO webhook_events(id,type,order_id,mode,received_at) VALUES(?,?,?,?,?)').bind(event.id,event.type,id,mode,Date.now()).run();return json({received:true});});}
