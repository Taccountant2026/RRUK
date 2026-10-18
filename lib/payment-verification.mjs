import { nextPaymentState, ShopError } from './commerce.mjs';

export function verifiedWebhookTime(raw, connection) {
  if (!raw || !connection?.accountId || !connection.endpointUrl || !connection.secretFingerprint) return null;
  try {
    const evidence = JSON.parse(raw);
    if (evidence.accountId !== connection.accountId || evidence.mode !== connection.mode ||
        evidence.endpointUrl !== connection.endpointUrl || evidence.secretFingerprint !== connection.secretFingerprint ||
        !Number.isSafeInteger(evidence.receivedAt) || evidence.receivedAt <= 0) return null;
    return String(evidence.receivedAt);
  } catch { return null; }
}

const objectId = value => typeof value === 'string' ? value : value?.id;

export function verifiedRefundState(order, session, intent) {
  nextPaymentState(order, session, 'reconcile');
  if (!intent || intent.id !== objectId(session.payment_intent) || intent.livemode !== (order.mode === 'live') ||
      intent.currency !== 'gbp' || intent.amount !== order.total_pence) throw new ShopError('Refund payment verification failed.', 409);
  const charge = intent.latest_charge;
  if (!charge || typeof charge === 'string' || charge.livemode !== intent.livemode || charge.currency !== 'gbp' ||
      charge.amount !== order.total_pence || objectId(charge.payment_intent) !== intent.id ||
      !Number.isSafeInteger(charge.amount_refunded) || charge.amount_refunded < 0 || charge.amount_refunded > charge.amount)
    throw new ShopError('Refund charge verification failed.', 409);
  const refunds = charge.refunds;
  if (!refunds || !Array.isArray(refunds.data)) throw new ShopError('Refund details are not available. Please verify again.', 409);
  let succeeded = 0, pending = false;
  const ids = new Set();
  for (const refund of refunds.data) {
    if (!refund.id || ids.has(refund.id) || objectId(refund.charge) !== charge.id ||
        objectId(refund.payment_intent) !== intent.id || refund.currency !== 'gbp' ||
        !Number.isSafeInteger(refund.amount) || refund.amount <= 0)
      throw new ShopError('Refund details do not match this order.', 409);
    ids.add(refund.id);
    if (refund.status === 'succeeded') succeeded += refund.amount;
    else if (!['failed', 'canceled'].includes(refund.status)) pending = true;
  }
  if (succeeded > order.total_pence || succeeded > charge.amount_refunded) throw new ShopError('Refund totals could not be verified.', 409);
  if (succeeded === order.total_pence) return 'refunded';
  if (succeeded > 0 || pending || charge.amount_refunded > 0 || refunds.has_more) return 'refund_review';
  return null;
}
