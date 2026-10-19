import { env } from 'cloudflare:workers';
import { db, setting, setSetting, encrypt, decrypt, hash, viewToken } from './server';
import { business } from './shop';
import { ShopError } from './commerce.mjs';
import { emailIdentity, notificationPayload, insertEmailSql, claimEmailSql, sendEmail, nextEmailAttempt, RETRY_WINDOW, MAX_ATTEMPTS, EmailProviderError, orderEmailText, canNotifyOrder } from './notifications.mjs';
import type { OrderRow } from './payments';

type EmailConfig = { apiKey:string; from:string; owner:string; enabled:boolean; testedAt:number|null; testIdentity:string|null; startedAt:number|null };
type EmailRow = { id:string; dedupe_key:string; kind:string; reference_id:string; recipient:string; payload_json:string; status:string; attempts:number; created_at:number; updated_at:number; next_attempt_at:number; first_attempt_at:number|null; provider_id:string|null; lease_token:string|null; last_error:string|null };
async function configuration():Promise<EmailConfig|null> { const value=await setting('transactional-email'); return value?decrypt<EmailConfig>(value):null; }
export async function emailStatus() {
  const c=await configuration(),rows=await db().prepare('SELECT id,kind,reference_id,recipient,status,attempts,created_at,updated_at,last_error,provider_id FROM email_outbox ORDER BY created_at DESC LIMIT 100').all();
  return { configured:!!c,enabled:!!c?.enabled,from:c?.from||'info@retroreplay.uk',owner:c?.owner||env.ADMIN_EMAIL||business.email,testedAt:c?.testedAt||null,startedAt:c?.startedAt||null,jobs:rows.results };
}
export async function saveEmailConfiguration(input:Record<string,unknown>) {
  const previous=await configuration(),identity=emailIdentity(input),apiKey=typeof input.apiKey==='string'&&input.apiKey.trim()?input.apiKey.trim():previous?.apiKey||'';
  if(!/^re_[A-Za-z0-9_-]{12,200}$/.test(apiKey))throw new ShopError('Enter a Resend sending API key. Keep this key out of chat.');
  const same=!!previous&&previous.apiKey===apiKey&&previous.from===identity.from&&previous.owner===identity.owner;
  const value=await encrypt({apiKey,...identity,enabled:false,testedAt:same?previous.testedAt:null,testIdentity:same?previous.testIdentity:null,startedAt:previous?.startedAt||null});
  if(previous&&!same){
    const active=await db().prepare("SELECT id FROM email_outbox WHERE status='sending' AND lease_expires_at>? LIMIT 1").bind(Date.now()).first();
    if(active)throw new ShopError('An email attempt is in progress. Wait two minutes before changing the connection.',409);
    await db().batch([db().prepare('INSERT INTO settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at').bind('transactional-email',value,Date.now()),db().prepare("UPDATE email_outbox SET status='review',last_error='Connection changed. Check the previous provider log before any manual resend.',updated_at=? WHERE status IN ('pending','sending')").bind(Date.now())]);
  }else await setSetting('transactional-email',value);
  return {saved:true,enabled:false};
}
export async function testEmailConfiguration() {
  const c=await configuration();if(!c)throw new ShopError('Save the email connection first.');
  const key='rruk-email-test-'+crypto.randomUUID();
  let id:string;try{id=await sendEmail(c.apiKey,notificationPayload(c,c.owner,'RetroReplay UK — email connection test','This is the email connection test requested from your protected RetroReplay UK owner area.\n\nIf this reaches your inbox, return to Emails and confirm receipt before enabling automatic messages. No customer order or payment was created.\n\nReply address: info@retroreplay.uk'),key);}catch(error){throw new ShopError(error instanceof EmailProviderError?error.message+' Check the key, verified sender and provider limits.':'The test email could not be confirmed.',503);}
  c.testedAt=Date.now();c.testIdentity=await hash([c.apiKey,c.from,c.owner].join('|'));await setSetting('transactional-email',await encrypt(c));
  return {accepted:true,providerId:id};
}
export async function setEmailEnabled(input:Record<string,unknown>) {
  const c=await configuration();if(!c)throw new ShopError('Save the email connection first.');
  if(input.enabled===true){if(input.receivedTest!==true||!c.testedAt||c.testIdentity!==await hash([c.apiKey,c.from,c.owner].join('|')))throw new ShopError('Send a test and confirm it reached your inbox first.');c.startedAt=c.startedAt||Date.now();}
  c.enabled=input.enabled===true;await setSetting('transactional-email',await encrypt(c));return {enabled:c.enabled};
}
function queued(c:EmailConfig,kind:string,reference:string,to:string,subject:string,text:string,guard='') {
  guard=guard||(kind==='paid-owner'?'paid':kind==='dispatch'?'dispatched':kind==='refund'?'refunded':kind==='review-owner'?'review':'');
  const id=crypto.randomUUID(),now=Date.now(),payload=notificationPayload(c,to,subject,text);
  return db().prepare(insertEmailSql(guard)).bind(id,`rruk-${kind}-${reference}`,kind,reference,to,JSON.stringify(payload),now,now,now,...(guard?[reference]:[]));
}
export async function orderEmailStatements(order:OrderRow,document:string,status=order.status) {
  const c=await configuration();if(!c||!canNotifyOrder(order,c))return [];
  const customer=order.customer_json?JSON.parse(order.customer_json) as {email?:string}:null;
  const privateUrl=`${(env.PUBLIC_ORIGIN||'https://retroreplay.uk').replace(/\/$/,'')}/order/${order.id}?token=${await viewToken(order.id)}`;
  const ref=order.id.slice(0,8),jobs=[];
  if(['paid','dispatched'].includes(status)){
    if(customer?.email)jobs.push(queued(c,'order-copy',order.id,customer.email,`Your RetroReplay UK order ${ref}`,orderEmailText({...order,status},document,privateUrl),'paid'));
    jobs.push(queued(c,'paid-owner',order.id,c.owner,`RRUK: paid order ${ref}`,`A live order is verified paid.\nReference: ${order.id}\nTotal: GBP ${(order.total_pence/100).toFixed(2)}\n\nOpen your protected owner area to review the saved contents and fulfil the order:\nhttps://retroreplay.uk/admin#orders\n\nDo not dispatch test, pending or review orders.`));
  }
  if(status==='dispatched'&&customer?.email)jobs.push(queued(c,'dispatch',order.id,customer.email,`Your RetroReplay UK order ${ref} has been dispatched`,`Your order ${order.id} has been recorded as dispatched.\n\nCarrier: ${order.carrier}\nTracking reference: ${order.tracking}\n\nYour private order record: ${privateUrl}\n\nReply to info@retroreplay.uk if you need help. Keep your tracking reference and private link safe.`));
  if(status==='refunded'&&customer?.email)jobs.push(queued(c,'refund',order.id,customer.email,`Refund confirmed for RetroReplay UK order ${ref}`,`Stripe has confirmed a full refund of the payment for order ${order.id}. Your bank or card provider may need additional time to display it.\n\nYour private order record: ${privateUrl}\n\nQuestions: info@retroreplay.uk`));
  if(['review','refund_review'].includes(status))jobs.push(queued(c,'review-owner',order.id,c.owner,`RRUK: order ${ref} needs review`,`Order ${order.id} needs a personal payment/refund check.\nStatus: ${status}\n\nReview the provider record and saved order before fulfilment:\nhttps://retroreplay.uk/admin#orders`));
  return jobs;
}
export async function requestAlertStatements(kind:string,reference:string,title:string) {
  const c=await configuration();if(!c?.enabled)return [];
  return [queued(c,'request-owner',reference,c.owner,'RRUK: a new '+(kind==='story'?'community story':'customer request'),`A ${kind} has been saved.\nReference: ${reference}\nSubject: ${title}\n\nReview and reply from your protected owner area:\nhttps://retroreplay.uk/admin#${kind==='enquiry'?'requests':'community'}\n\nPrivate requests never become public stories. Review stories and permissions before publication.`,kind==='enquiry'?'enquiry':'submission')];
}
export async function drainEmailOutbox(limit=2) {
  const now=Date.now();await db().prepare("UPDATE email_outbox SET payload_json='{}',recipient='' WHERE status='accepted' AND updated_at<? AND payload_json!='{}'").bind(now-30*86400000).run();
  const c=await configuration();if(!c?.enabled)return {checked:0,accepted:0};
  await db().prepare("UPDATE email_outbox SET status='review',last_error='Automatic retry window ended; check the provider log before any manual resend.',updated_at=? WHERE status IN ('pending','sending') AND created_at<=? AND (lease_expires_at IS NULL OR lease_expires_at<=?)").bind(now,now-RETRY_WINDOW,now).run();
  const candidates=await db().prepare("SELECT id FROM email_outbox WHERE (status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_expires_at<=?) ORDER BY created_at LIMIT ?").bind(now,now,Math.max(1,Math.min(3,limit))).all<{id:string}>();let accepted=0,checked=0;
  for(const candidate of candidates.results){
    const at=Date.now(),lease=crypto.randomUUID(),row=await db().prepare(claimEmailSql()).bind(at,at,lease,at+120000,candidate.id,MAX_ATTEMPTS,at-RETRY_WINDOW,at,at).first<EmailRow>();if(!row)continue;checked++;
    try{const providerId=await sendEmail(c.apiKey,JSON.parse(row.payload_json),row.dedupe_key);await db().prepare("UPDATE email_outbox SET status='accepted',provider_id=?,updated_at=?,last_error=NULL,lease_token=NULL,lease_expires_at=NULL WHERE id=? AND status='sending' AND lease_token=?").bind(providerId,Date.now(),row.id,lease).run();accepted++;}
    catch(error){const outcome=nextEmailAttempt(row.attempts,row.created_at,Date.now(),error instanceof EmailProviderError&&error.retryable),message=error instanceof EmailProviderError?error.message:'The send result needs review.';await db().prepare('UPDATE email_outbox SET status=?,next_attempt_at=?,updated_at=?,last_error=?,lease_token=NULL,lease_expires_at=NULL WHERE id=? AND status=\'sending\' AND lease_token=?').bind(outcome.status,outcome.next,Date.now(),message,row.id,lease).run();}
  }
  // Accepted-row identifiers remain after content is cleared, preventing late duplicates.
  return {checked,accepted};
}
