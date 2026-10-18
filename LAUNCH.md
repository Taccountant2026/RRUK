# RRUK launch status

19 October 2026, after final-domain activation shortly after midnight BST. RRUK is separate from Bytova; retain Bytova's domain/HTTPS checkpoint and working merchant settings.

## Current state

- Public storefront: https://retroreplay.uk (www also serves the store with the root canonical).
- Protected owner area: https://retroreplay.uk/admin (native owner access is also retained).
- Payment mode: live. Checkout: paused. Both branding and fulfilment confirmations were saved by the owner and independently read back.
- The separate RetroReplay UK Stripe account has charges and payouts enabled. Customer-facing name and statement descriptor identify RRUK; support email and the working support-page URL are saved.
- Restricted live credentials and signing secrets are encrypted on the server. Signed test and live deliveries have been verified at the native HTTPS origin.
- Both final-domain hostnames and HTTPS certificates are active. PUBLIC_ORIGIN=https://retroreplay.uk is applied in runtime environment revision2. The catalogue is empty and search indexing stays disabled. No real customer charge has been made.

## Implemented

The original CRT branding, responsive storefront, catalogue search/filters, product details and basket are built. Owner tools manage actual product photos, item checks, condition, compatibility, stock, prices, delivery costs, orders, packing documents, tracking and refund verification.

Server-derived Checkout amounts, atomic stock reservations, provider idempotency and guarded stock restoration protect orders. The endpoint listens for checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed and checkout.session.expired. Merchant, mode, amount, currency and provider payment status are checked before payment is accepted. A success URL does not mark an order paid.

Delivery, returns, cancellation form, six-month console/handheld warranty, terms, privacy/cookies, condition, complaints and accessibility pages are implemented. Sale terms are versioned and saved with orders. Customer updates are sent manually through the business email; automatic transactional email is not configured.

## Verification

- Thirteen automated tests cover migrated SQLite reservation/concurrency/rollback behaviour, duplicate expiry, delayed and out-of-order payment states, Stripe signatures, connection-bound delivery evidence and refund verification. TypeScript and the production build passed.
- The owner completed the hosted GBP1 test payment. Its provider session was independently verified paid, its simulated full refund succeeded, and the saved order is now refunded.
- The owner observed the generic-decline card response and confirmed the cancellation return to the owner area. The latest test order remains unpaid; returning from Checkout does not itself expire a provider session.
- A second delivery of the earlier checkout.session.completed event returned 200 OK. Its new signed receipt was saved; there is still one processed-event record and the refunded order stayed unchanged.
- A genuine live account.updated event reached the public endpoint and passed signature verification. Its receipt matches the current RRUK merchant, live mode, endpoint and signing-secret fingerprint. The temporary account.updated subscription was removed afterward. This proves live transport, rather than a completed live purchase.
- Anonymous checks verified public storefront/catalogue access, paused customer checkout, unsigned-webhook rejection and protected owner routes. Browser rendering and keyboard/screen-reader QA remain unavailable in this managed session.

Current processing baseline: refunded test order 434c26d4-b457-4823-be35-f0edb0e991fd; single completed-event record evt_1URxFJDMYd1hK6hbsB7NApl2. The abandoned test order 4dae40eb-8146-4857-abc6-aed31f6f61fd automatically expired. Genuine checkout.session.expired event evt_1US2hbDMYd1hK6hbg9Z0yfoR was processed at 1792363036877, and the saved order is expired/unpaid with restocked=1. It did not reserve physical stock; this verifies provider expiry handling, while actual-item release is covered by the SQLite tests.

## Remaining checkout checks

1. Provider expiry and saved order transition are verified. Local SQLite tests cover actual reservation release; the stock-free internal provider checkout does not prove real-item inventory restoration.
2. Test delayed success/failure for any payment methods intended for sale. Fixture coverage is not external provider coverage. RRUK's default live configuration includes methods beyond cards; eligibility depends on customer, currency and basket.
3. Use the owner's secure Payments buttons to update test and live endpoints to https://retroreplay.uk/api/stripe/webhook, then verify signed delivery for both. Earlier native-origin proof is insufficient; the handler now records the actual incoming request origin rather than the configured public origin.
4. Complete relevant product/payment-method checks before opening real sales. Keep checkout paused until ready.

The live key, endpoint, first signed delivery, owner declarations, first successful test payment and full simulated refund are already complete. Do not ask the owner to create keys or repeat those first checks.

## Domain connection

Root and www are active with active HTTPS certificates. The owner saved the website/verification records in Squarespace. Public DNS matched all seven records and preserved Zoho mail and unrelated verification. Final-origin deployment succeeded. DOMAIN_CONNECTION.md records the exact mappings, observed routing and rollback.

1. The website DNS cutover is complete. Preserve all email/preset/verification records and the saved old website mappings for rollback.
2. Ownership, DNS, valid TLS and serving the RRUK site on both hostnames are verified. Root canonical metadata is correct; www serves 200 rather than redirecting to root.
3. PUBLIC_ORIGIN is applied as https://retroreplay.uk. Update the test/live webhook addresses through the owner form, verify final-domain signed delivery and check a new test session's success/cancel/order URLs.
4. Public customer access and owner protection are verified at the final origin. Update Stripe's public support website to https://retroreplay.uk/contact and verify both final-domain callbacks.
5. Set SITE_INDEXABLE=true only when the final domain and real catalogue are ready, then check canonical/OG URLs, robots, sitemap and missing-page behaviour.

## Catalogue and daily operation

Research genuine available stock, prices, delivery service/cost, provenance, compatibility, region, safety and any age restrictions. Add actual photos, condition, included items and limitations. Publish only confirmed physical stock; do not include ROM libraries or assume old licences/accounts transfer.

Reconcile orders, pack only verified paid live orders and include the downloaded order/terms copy. Use tracked delivery, record tracking and update the customer by email. Handle support and returns. Process refunds in the correct Stripe account, verify them here and inspect returns before manually relisting stock.

The private GBP1 test action uses the authenticated owner, enabled test mode and a test key. It creates a labelled internal order without a catalogue item or physical stock reservation. It rejects live mode and live keys.
