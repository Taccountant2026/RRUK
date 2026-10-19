import { ShopError } from './commerce.mjs';

export const RETRY_WINDOW = 23 * 60 * 60 * 1000;
export const MAX_ATTEMPTS = 8;
export function canNotifyOrder(order, config) {
  return Boolean(config?.enabled && config.startedAt && order.mode === 'live' && order.paid_at && order.paid_at >= config.startedAt);
}
export function emailAddress(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(email)) throw new ShopError('Enter a valid email address.');
  return email;
}
export function emailIdentity(input) {
  const from = emailAddress(input.from), owner = emailAddress(input.owner);
  if (!/(?:^|\.)retroreplay\.uk$/.test(from.split('@')[1])) throw new ShopError('Use a verified sender on retroreplay.uk or one of its subdomains.');
  return { from, owner };
}
export function notificationPayload(config, recipient, subject, text) {
  if (typeof subject !== 'string' || /[\r\n]/.test(subject) || subject.length > 180) throw new ShopError('Invalid email subject.');
  if (typeof text !== 'string' || !text || text.length > 1000000) throw new ShopError('Invalid email message.');
  return { from: `RetroReplay UK <${emailAddress(config.from)}>`, to: [emailAddress(recipient)], reply_to: 'info@retroreplay.uk', subject, text };
}
export function insertEmailSql(guard = '') {
  const guards = { paid: "orders WHERE id=? AND status IN ('paid','dispatched')", dispatched: "orders WHERE id=? AND status='dispatched'", refunded: "orders WHERE id=? AND status='refunded'", review: "orders WHERE id=? AND status IN ('review','refund_review')", submission: 'community_submissions WHERE id=?', enquiry: 'enquiries WHERE id=?' };
  if (guard && !guards[guard]) throw new ShopError('Invalid notification guard.');
  return "INSERT INTO email_outbox(id,dedupe_key,kind,reference_id,recipient,payload_json,status,attempts,created_at,updated_at,next_attempt_at) SELECT ?,?,?,?,?,?,'pending',0,?,?,?" + (guard ? ` WHERE EXISTS (SELECT 1 FROM ${guards[guard]})` : '') + ' ON CONFLICT(dedupe_key) DO NOTHING';
}
export function claimEmailSql() {
  return "UPDATE email_outbox SET status='sending',attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,?),updated_at=?,lease_token=?,lease_expires_at=? WHERE id=? AND attempts<? AND created_at>? AND ((status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_expires_at<=?)) RETURNING *";
}
export function nextEmailAttempt(attempts, createdAt, now, retryable) {
  const next = now + Math.min(3600000, 60000 * 2 ** Math.max(0, attempts - 1));
  return retryable && attempts < MAX_ATTEMPTS && next < createdAt + RETRY_WINDOW ? { status: 'pending', next } : { status: 'review', next: now };
}
export class EmailProviderError extends Error {
  constructor(message, retryable = true) { super(message); this.name = 'EmailProviderError'; this.retryable = retryable; }
}
export async function sendEmail(apiKey, payload, dedupeKey, fetcher = fetch) {
  let response;
  try {
    response = await fetcher('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': dedupeKey }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
  } catch { throw new EmailProviderError('The sending service did not confirm the request.'); }
  let data;
  try { data = await response.json(); } catch { throw new EmailProviderError('The sending service returned an unreadable response.'); }
  if (!response.ok) throw new EmailProviderError(`The sending service returned HTTP ${response.status}.`, response.status >= 500 || [408,429].includes(response.status) || response.status === 409 && data.name === 'concurrent_idempotent_requests');
  if (typeof data.id !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(data.id)) throw new EmailProviderError('The sending service did not return a message reference.');
  return data.id;
}
export function orderEmailText(order, document, privateUrl) {
  if (order.mode !== 'live' || !['paid','dispatched'].includes(order.status)) throw new ShopError('Only a verified paid live order can receive a purchase confirmation.');
  return `Thank you for your order with RetroReplay UK. Your payment is confirmed.\n\nWe will check the described items and arrange tracked UK delivery within the complete period shown in your saved order. Sourced-to-order items are sourced after purchase. We will contact you if a material detail or the delivery plan needs your agreement.\n\nYour private order record:\n${privateUrl}\nKeep this link private.\n\nThe full item details and terms saved with your purchase follow. Keep this email for your records.\n\n${document}\n\nQuestions, returns or cancellations: reply to info@retroreplay.uk and include your order reference. We aim to reply within two working days.\n\nRetroReplay UK — The classics. Back in play.`;
}
