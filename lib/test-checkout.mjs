import { ShopError } from './commerce.mjs';
export function assertOwnerTestConnection({ merchantMode, key, signingSecret, endpointUrl, origin }) {
  if (merchantMode !== 'test' || !/^(rk|sk)_test_[A-Za-z0-9]+$/.test(key || '') || !signingSecret) {
    throw new ShopError('A saved test connection and webhook are required for a simulated payment.', 409);
  }
  if (typeof origin !== 'string' || !origin.startsWith('https://') || endpointUrl !== `${origin}/api/stripe/webhook`) {
    throw new ShopError('Update the saved test webhook to this store address before running the final test.', 409);
  }
}
export function testCheckoutPlan({ origin, id, token, expiresAt, policyVersion }) {
  const product = { id: 'rruk-internal-test', slug: 'rruk-internal-test', title: 'RRUK TEST ONLY — simulated purchase', category: 'test', description: 'Internal £1 test. No money moves and no product is shipped.', condition: 'Test fixture', conditionNotes: 'Internal payment verification only.', pricePence: 100, shippingPence: 0, deliveryEstimate: 'No delivery — test only', stock: 0, active: false, images: [], includes: ['Simulated payment only'], compatibility: 'Stripe test mode', warrantyMonths: 0 };
  const params = { mode: 'payment', integration_identifier: 'rruk-test-lhzqmpvr', client_reference_id: id,
    metadata: { rruk_order: id, project: 'RRUK', rruk_test: 'true', policy_version: policyVersion },
    branding_settings: { display_name: 'RetroReplay UK — TEST', background_color: '#faf8f1', button_color: '#000c32' },
    line_items: [{ quantity: 1, price_data: { currency: 'gbp', unit_amount: 100, product_data: { name: product.title, description: product.description } } }],
    shipping_address_collection: { allowed_countries: ['GB'] },
    shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 0, currency: 'gbp' }, display_name: 'Test only — no parcel' } }],
    expires_at: Math.floor(expiresAt / 1000), success_url: `${origin}/order/${id}?token=${token}`, cancel_url: `${origin}/admin?test_cancelled=1`,
    custom_text: { submit: { message: 'Internal simulated payment. Use Stripe test card details. No real purchase or delivery.' } },
    payment_intent_data: { metadata: { rruk_order: id, project: 'RRUK', rruk_test: 'true' } },
  };
  return { product, params };
}
