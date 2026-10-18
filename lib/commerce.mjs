export class ShopError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export function parseBasket(body) {
  if (!body || body.termsAccepted !== true || body.policyVersion !== '2026-10-18') throw new ShopError('Please read and accept the current sale terms.');
  if (typeof body.requestKey !== 'string' || !/^[a-f0-9-]{36}$/.test(body.requestKey)) throw new ShopError('Please refresh your basket and try again.');
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) throw new ShopError('Your basket must contain between 1 and 20 different items.');
  const ids = new Set();
  const items = body.items.map(x => {
    if (!x || typeof x.id !== 'string' || !/^[a-zA-Z0-9-]{1,60}$/.test(x.id) || !Number.isInteger(x.quantity) || x.quantity < 1 || x.quantity > 10 || ids.has(x.id)) throw new ShopError('Please check the item quantities in your basket.');
    ids.add(x.id); return { id: x.id, quantity: x.quantity };
  }).sort((a, b) => a.id.localeCompare(b.id));
  return { items, requestKey: body.requestKey };
}
export function priceBasket(items, products) {
  const lines = items.map(item => { const p = products.find(p => p.id === item.id && p.active); if (!p || p.stock < item.quantity) throw new ShopError('An item has sold or its available stock has changed. Please review your basket.', 409); return { product: p, quantity: item.quantity }; });
  const subtotal = lines.reduce((n, l) => n + l.product.pricePence * l.quantity, 0), shipping = Math.max(0, ...lines.map(l => l.product.shippingPence));
  if (!Number.isSafeInteger(subtotal + shipping) || subtotal < 50 || subtotal + shipping > 1000000) throw new ShopError('Please contact us about this order.');
  return { lines, subtotal, shipping, total: subtotal + shipping };
}
export function nextPaymentState(order, session, eventType) {
  if (session.id !== order.session_id || session.metadata?.rruk_order !== order.id || session.currency !== 'gbp' || session.amount_total !== order.total_pence || session.livemode !== (order.mode === 'live')) throw new ShopError('Payment verification failed.', 409);
  if (['refunded','refund_review'].includes(order.status)) return order.status;
  if (session.payment_status === 'paid') return order.restocked ? 'review' : ['dispatched', 'paid'].includes(order.status) ? order.status : 'paid';
  if (['paid', 'dispatched', 'review', 'refunded', 'refund_review'].includes(order.status)) return order.status;
  if (session.status === 'expired') return 'expired';
  if (eventType === 'checkout.session.async_payment_failed' && session.status === 'complete') return 'failed';
  if (session.status === 'complete') return 'processing';
  return order.status;
}
export function reservationSql() { return 'UPDATE products SET stock=CASE WHEN active=1 AND revision=? AND stock>=? THEN stock-? ELSE -1 END, revision=revision+1 WHERE id=?'; }
export function releaseSql() { return "UPDATE products SET stock=stock+?, revision=revision+1 WHERE id=? AND EXISTS (SELECT 1 FROM orders WHERE id=? AND restocked=0 AND status IN ('creating','open','processing'))"; }
export function paidUpdateSql() { return "UPDATE orders SET status=CASE WHEN status IN ('dispatched','refunded','refund_review') THEN status WHEN restocked=1 THEN 'review' ELSE ? END,paid_at=COALESCE(paid_at,?),customer_json=? WHERE id=?"; }
export function parseProduct(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ShopError('Please check the item information.');
  const required = (key, max = 500) => { const v = typeof input[key] === 'string' ? input[key].trim() : ''; if (!v || v.length > max) throw new ShopError(`Please check ${key}.`); return v; };
  const title = required('title', 180), slug = required('slug', 150), category = required('category', 30);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !['consoles','games','accessories'].includes(category)) throw new ShopError('Choose a category and a lowercase URL slug with hyphens.');
  const integer = (key, min, max) => { const v = input[key]; if (!Number.isInteger(v) || v < min || v > max) throw new ShopError(`Please check ${key}.`); return v; };
  const pricePence = integer('pricePence', 50, 1000000), shippingPence = integer('shippingPence', 0, 50000), stock = integer('stock', 0, 9999);
  const images = Array.isArray(input.images) ? input.images : [];
  if (images.length > 8 || images.some(x => typeof x !== 'string' || !/^\/api\/media\/[a-f0-9-]+\.(jpg|png|webp)$/.test(x))) throw new ShopError('Please upload up to eight item photos.');
  const includes = Array.isArray(input.includes) ? input.includes.map(x => String(x).trim()).filter(Boolean) : [];
  if (!includes.length || includes.length > 20 || includes.some(x => x.length > 250)) throw new ShopError('List what is included, one item per line.');
  const active = input.active === true;
  if (active && (!images.length || input.readyForSale !== true)) throw new ShopError('Before publishing, add an actual item photo and confirm its checks, stock and sale details.');
  const condition = required('condition', 30); if (!['Excellent','Good','Fair','New'].includes(condition)) throw new ShopError('Choose an item condition.');
  return { title, slug, category, description: required('description', 8000), condition, conditionNotes: required('conditionNotes', 5000), pricePence, stock, active, images, includes, compatibility: required('compatibility', 2000), shippingPence, deliveryEstimate: required('deliveryEstimate', 300), warrantyMonths: category === 'consoles' ? 6 : 0 };
}
