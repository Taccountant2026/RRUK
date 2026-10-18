import Stripe from 'stripe';
import { env } from 'cloudflare:workers';
import { db, setting, setSetting, encrypt, decrypt, viewToken } from './server';
import { nextPaymentState, releaseSql, paidUpdateSql, ShopError } from './commerce.mjs';
export type Mode='test'|'live';
export type Merchant={ key:string; accountId:string; accountName:string; mode:Mode; chargesEnabled:boolean; webhookSecret?:string; endpointId?:string; endpointUrl?:string };
export type OrderRow={id:string;request_hash:string;basket_hash:string;status:string;mode:Mode;account_id:string;total_pence:number;shipping_pence:number;items_json:string;policy_version:string;policy_text:string;session_id:string|null;checkout_url:string|null;checkout_params:string|null;expires_at:number;restocked:number;customer_json:string|null;tracking:string|null;carrier:string|null;created_at:number;paid_at:number|null;dispatched_at:number|null};
export function stripeClient(key:string) { return new Stripe(key,{httpClient:Stripe.createFetchHttpClient(),maxNetworkRetries:1,timeout:20000}); }
export async function merchant(mode:Mode):Promise<Merchant|null> { const raw=await setting(`stripe:${mode}`); return raw?decrypt<Merchant>(raw):null; }
export async function paymentMode():Promise<Mode> { return await setting('payment-mode')==='live'?'live':'test'; }
export async function paymentStatus() { const mode=await paymentMode(), m=await merchant(mode), test=await merchant('test'), live=await merchant('live'); const safe=(c:Merchant|null)=>c?{accountId:c.accountId,accountName:c.accountName,mode:c.mode,chargesEnabled:c.chargesEnabled,webhookConfigured:Boolean(c.webhookSecret),endpointUrl:c.endpointUrl||null}:null; return {mode,enabled:await setting('payments-enabled')==='1',test:safe(test),live:safe(live),current:safe(m),webhookSeen:await setting(`webhook-seen:${mode}`),brandingConfirmed:await setting('live-branding-confirmed')==='1',fulfilmentConfirmed:await setting('fulfilment-confirmed')==='1'}; }
export async function saveMerchant(input:{key?:unknown;mode?:unknown;webhookSecret?:unknown}) {
  const mode:Mode=input.mode==='live'?'live':'test', key=typeof input.key==='string'?input.key.trim():'';
  if(!new RegExp(`^(rk|sk)_${mode}_[A-Za-z0-9]+$`).test(key)) throw new ShopError(`Use a ${mode} restricted API key (rk_${mode}_…).`);
  const stripe=stripeClient(key);
  let account:Stripe.Account; try { account=await stripe.accounts.retrieveCurrent(); } catch { throw new ShopError('Stripe could not verify that key. Check its account, mode and account-read permission.'); }
  const previous=await merchant(mode);
  if(previous && previous.accountId!==account.id) { const pending=await db().prepare("SELECT COUNT(*) AS count FROM orders WHERE mode=? AND status NOT IN ('expired','failed','refunded')").bind(mode).first<{count:number}>(); if(pending?.count) throw new ShopError('Resolve outstanding orders before changing the merchant account.',409); }
  const wh=typeof input.webhookSecret==='string'?input.webhookSecret.trim():'';
  if(wh&&!/^whsec_[A-Za-z0-9]+$/.test(wh)) throw new ShopError('Check the webhook signing secret.');
  const value:Merchant={key,mode,accountId:account.id,accountName:account.business_profile?.name||account.settings?.dashboard?.display_name||account.email||account.id,chargesEnabled:Boolean(account.charges_enabled),...(previous?.accountId===account.id?{webhookSecret:previous.webhookSecret,endpointId:previous.endpointId,endpointUrl:previous.endpointUrl}:{}),...(wh?{webhookSecret:wh}:{})};
  await setSetting(`stripe:${mode}`,await encrypt(value)); await setSetting('payments-enabled','0');
  return {accountId:value.accountId,accountName:value.accountName,mode,chargesEnabled:value.chargesEnabled};
}
export const checkoutEvents:Stripe.WebhookEndpointCreateParams.EnabledEvent[]=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'];
export async function configureWebhook(mode:Mode,origin:string) { const m=await merchant(mode);if(!m)throw new ShopError('Connect the API key first.'); const url=`${origin}/api/stripe/webhook`, stripe=stripeClient(m.key);
  if(m.endpointId) { await stripe.webhookEndpoints.update(m.endpointId,{url,enabled_events:checkoutEvents,description:'RRUK storefront order verification'}); m.endpointUrl=url; }
  else { const endpoint=await stripe.webhookEndpoints.create({url,enabled_events:checkoutEvents,description:'RRUK storefront order verification',metadata:{project:'RRUK'}}); if(!endpoint.secret) throw new ShopError('Stripe did not return a signing secret.');m.endpointId=endpoint.id;m.endpointUrl=url;m.webhookSecret=endpoint.secret; }
  await setSetting(`stripe:${mode}`,await encrypt(m)); return {endpointUrl:url};
}
export async function setPaymentOptions(input:{mode?:unknown;enabled?:unknown;brandingConfirmed?:unknown;fulfilmentConfirmed?:unknown}) { const mode:Mode=input.mode==='live'?'live':'test',m=await merchant(mode);if(!m)throw new ShopError('Connect this payment mode first.');if(input.enabled===true){if(!m.webhookSecret)throw new ShopError('Configure a webhook signing secret first.');if(mode==='live'&&(!m.chargesEnabled||input.brandingConfirmed!==true||input.fulfilmentConfirmed!==true||!await setting('webhook-seen:live')))throw new ShopError('Live checkout needs a verified live webhook, an enabled merchant, confirmed customer-facing branding and the fulfilment checklist.');}
  await setSetting('payment-mode',mode);await setSetting('payments-enabled',input.enabled===true?'1':'0');await setSetting('live-branding-confirmed',input.brandingConfirmed===true?'1':'0');await setSetting('fulfilment-confirmed',input.fulfilmentConfirmed===true?'1':'0');return {mode,enabled:input.enabled===true}; }
export async function getOrder(id:string) { return db().prepare('SELECT * FROM orders WHERE id=?').bind(id).first<OrderRow>(); }
export async function releaseReservation(order:OrderRow,status:'expired'|'failed') { const lines=JSON.parse(order.items_json) as {product:{id:string};quantity:number}[]; await db().batch([...lines.map(l=>db().prepare(releaseSql()).bind(l.quantity,l.product.id,order.id)),db().prepare("UPDATE orders SET status=?,restocked=1 WHERE id=? AND restocked=0 AND status IN ('creating','open','processing')").bind(status,order.id)]); }
export async function syncSession(order:OrderRow,session:Stripe.Checkout.Session,eventType='reconcile') { const next=nextPaymentState(order,session,eventType);
  if(next==='expired'||next==='failed') {await releaseReservation(order,next);return next;}
  const customer=session.customer_details, shipping=session.collected_information?.shipping_details;
  if(next==='paid'||next==='review') { if(!shipping?.address||shipping.address.country!=='GB') { await db().prepare("UPDATE orders SET status='review' WHERE id=? AND status!='dispatched'").bind(order.id).run(); return 'review'; }
    const data={name:shipping.name,email:customer?.email||null,phone:customer?.phone||null,address:shipping.address};
    await db().prepare(paidUpdateSql()).bind(next,Date.now(),JSON.stringify(data),order.id).run();
  } else if(next==='processing') await db().prepare("UPDATE orders SET status='processing' WHERE id=? AND status IN ('open','creating')").bind(order.id).run();
  return (await getOrder(order.id))?.status || next;
}
export async function reconcileOrder(order:OrderRow) { const m=await merchant(order.mode);if(!m||m.accountId!==order.account_id)throw new ShopError('The order merchant connection is unavailable.'); const stripe=stripeClient(m.key);
  if(!order.session_id){let cursor:string|undefined,scanned=0,found:Stripe.Checkout.Session|undefined,complete=false;do{const page=await stripe.checkout.sessions.list({limit:100,created:{gte:Math.floor(order.created_at/1000)-60,lte:Math.floor(order.expires_at/1000)+60},...(cursor?{starting_after:cursor}:{})});found=page.data.find(s=>s.metadata?.rruk_order===order.id);scanned+=page.data.length;if(found||!page.has_more){complete=!page.has_more;break;}cursor=page.data.at(-1)?.id;}while(scanned<1000&&cursor);
    if(found){await db().prepare("UPDATE orders SET session_id=?,checkout_url=?,status=CASE WHEN status='creating' THEN 'open' ELSE status END WHERE id=?").bind(found.id,found.url||null,order.id).run();order={...order,session_id:found.id};}
    else if(complete&&Date.now()>order.expires_at+120000){await releaseReservation(order,'expired');return 'expired';}
    else return 'creating';
  }
  return syncSession(order,await stripe.checkout.sessions.retrieve(order.session_id!));
}
export async function ensureCheckout(order:OrderRow,m:Merchant) { if(order.account_id!==m.accountId||order.mode!==m.mode)throw new ShopError('This checkout belongs to a different payment mode. Please start again.',409);
  if(['failed','expired','review'].includes(order.status))throw new ShopError('This checkout has closed. Change your basket quantity to start a new checkout, or contact us.',409);
  if(order.checkout_url)return order.checkout_url;
  if(Date.now()>order.expires_at-1800000)throw new ShopError('This checkout needs a stock check. Contact us or try again after the reservation is reconciled.',409);
  if(!order.checkout_params)throw new ShopError('Checkout could not be prepared.',503);
  try {const session=await stripeClient(m.key).checkout.sessions.create(JSON.parse(order.checkout_params),{idempotencyKey:`rruk-${order.id}`});if(!session.url||session.livemode!==(order.mode==='live'))throw new Error('Checkout mode verification failed');await db().prepare("UPDATE orders SET session_id=?,checkout_url=?,status=CASE WHEN status='creating' THEN 'open' ELSE status END WHERE id=?").bind(session.id,session.url,order.id).run();return session.url;}
  catch {throw new ShopError('Stripe could not open checkout just now. Your request is saved to prevent duplicate payment. Please retry shortly; contact us if it persists.',503);}
}
export function checkoutOrigin(request:Request) { const configured=env.PUBLIC_ORIGIN; const origin=configured||new URL(request.url).origin; if(!origin.startsWith('https://'))throw new ShopError('Secure checkout requires HTTPS.',503);return origin.replace(/\/$/,''); }
export async function orderDocument(order:OrderRow) { const lines=JSON.parse(order.items_json) as {product:{title:string;condition:string;conditionNotes:string;compatibility:string;includes:string[];description:string;pricePence:number;deliveryEstimate:string;warrantyMonths:number};quantity:number}[]; return `RETROREPLAY UK — ${order.mode==='test'?'TEST ORDER — NO REAL PURCHASE':'ORDER COPY'}\nReference: ${order.id}\nOrder date: ${new Date(order.created_at).toISOString()}\nPayment status: ${order.status}\nCurrency: GBP\n\n${lines.map(l=>`${l.quantity} × ${l.product.title} — £${(l.product.pricePence/100).toFixed(2)} each\nCondition: ${l.product.condition}\n${l.product.description}\n${l.product.conditionNotes}\nIncludes: ${l.product.includes.join(', ')}\nCompatibility: ${l.product.compatibility}\nDelivery estimate: ${l.product.deliveryEstimate}\nAdditional hardware warranty: ${l.product.warrantyMonths} months`).join('\n\n')}\n\nDelivery: £${(order.shipping_pence/100).toFixed(2)}\nTotal: £${(order.total_pence/100).toFixed(2)}\nPolicy version: ${order.policy_version}\n\n${order.policy_text}\n`; }
