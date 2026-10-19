export function canInviteToPurchase(enquiry, sale, payments) {
  return Boolean(sale && !sale.catalogueOnly && sale.active && Number.isInteger(enquiry.quantity)
    && enquiry.quantity > 0 && enquiry.quantity <= 10 && sale.stock >= enquiry.quantity
    && payments?.mode === 'live' && payments.enabled);
}

export function requestReply(enquiry, sale, payments, origin) {
  if (!canInviteToPurchase(enquiry, sale, payments)) {
    return `Hello ${enquiry.name},\n\nThank you for your request for ${enquiry.product_title} (quantity ${enquiry.quantity}).\n\n[Confirm availability, the exact item and its photos, condition, included items, compatibility, final GBP price and tracked UK delivery cost and timing here before requesting payment.]\n\nYour request reference: ${enquiry.id}\n\nLeighton\nRetroReplay UK`;
  }
  const money = value => new Intl.NumberFormat('en-GB', {style:'currency', currency:'GBP'}).format(value / 100);
  const itemTotal = sale.pricePence * enquiry.quantity;
  const url = new URL(`/product/${encodeURIComponent(sale.slug)}`, origin).href;
  return `Hello ${enquiry.name},\n\nThank you for your RetroReplay UK request. This item is now listed for purchase:\n\n${sale.title}\nQuantity requested: ${enquiry.quantity}\nItem price: ${money(sale.pricePence)} each\nItems: ${money(itemTotal)}\nTracked UK delivery: ${money(sale.shippingPence)}\nTotal for this item and quantity: ${money(itemTotal + sale.shippingPence)}\n\nView the actual photos, condition, included items, compatibility and sale terms, then add the quantity you want to your basket and pay securely:\n${url}\n\nNormally dispatched within 1–3 working days. Estimated transit: ${sale.deliveryEstimate}.\n\nThe listing is public, so availability is checked again at Checkout. Your request and this email do not reserve the item or take payment.\n\nYour request reference: ${enquiry.id}\n\nLeighton\nRetroReplay UK`;
}
