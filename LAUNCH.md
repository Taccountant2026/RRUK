# RRUK launch status

18 October 2026, after the owner's 23:25 BST confirmation. RRUK is separate from Bytova; retain Bytova's domain/HTTPS checkpoint and working merchant settings.

## Current state

- Public storefront: https://rruk.taccountant.chatgpt.site
- Protected owner area: https://rruk.taccountant.chatgpt.site/admin
- Payment mode: live. Checkout: paused. Both branding and fulfilment confirmations were saved by the owner and independently read back.
- The separate RetroReplay UK Stripe account has charges and payouts enabled. Customer-facing name and statement descriptor identify RRUK; support email and the working support-page URL are saved.
- Restricted live credentials and signing secrets are encrypted on the server. Signed test and live deliveries have been verified at the native HTTPS origin.
- The catalogue is empty, search indexing is disabled and the final domain is not connected. No real customer charge has been made.

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

Current processing baseline: refunded test order 434c26d4-b457-4823-be35-f0edb0e991fd; single completed-event record evt_1URxFJDMYd1hK6hbsB7NApl2. The abandoned test order 4dae40eb-8146-4857-abc6-aed31f6f61fd is due to expire at 23:37:14 BST. Verify the actual expiry event and saved state after that time. It did not reserve physical stock.

## Remaining checkout checks

1. Verify the abandoned provider session expires and the handler records its state correctly. Local SQLite tests cover stock release; this stock-free internal checkout does not prove actual-item inventory restoration.
2. Test delayed success/failure for any payment methods intended for sale. Fixture coverage is not external provider coverage. RRUK's default live configuration includes methods beyond cards; eligibility depends on customer, currency and basket.
3. Repeat signed delivery verification after moving each configured endpoint to the final HTTPS domain.
4. Complete relevant product/payment-method checks before opening real sales. Keep checkout paused until ready.

The live key, endpoint, first signed delivery, owner declarations, first successful test payment and full simulated refund are already complete. Do not ask the owner to create keys or repeat those first checks.

## Domain connection

Root and www are already attached to this same Site in pending state. DOMAIN_CONNECTION.md contains the returned records and rollback procedure.

1. Preserve existing email MX/TXT/DKIM and other working records; retain the current website records for rollback. Use this Site's A/CNAME/TXT values, rather than Bytova's GitHub Pages addresses.
2. Verify ownership, DNS, TLS and the root/www routing. Registrar transfer is unnecessary for a hosting change.
3. Set runtime PUBLIC_ORIGIN to the selected final HTTPS origin and redeploy. Update the test and live webhook addresses through the owner form. Check success/cancel redirects and private order links.
4. Preserve public customer access and server-side owner protection. Verify genuine signed delivery for both configured modes at the final address.
5. Set SITE_INDEXABLE=true only when the final domain and real catalogue are ready, then check canonical/OG URLs, robots, sitemap and missing-page behaviour.

## Catalogue and daily operation

Research genuine available stock, prices, delivery service/cost, provenance, compatibility, region, safety and any age restrictions. Add actual photos, condition, included items and limitations. Publish only confirmed physical stock; do not include ROM libraries or assume old licences/accounts transfer.

Reconcile orders, pack only verified paid live orders and include the downloaded order/terms copy. Use tracked delivery, record tracking and update the customer by email. Handle support and returns. Process refunds in the correct Stripe account, verify them here and inspect returns before manually relisting stock.

The private GBP1 test action uses the authenticated owner, enabled test mode and a test key. It creates a labelled internal order without a catalogue item or physical stock reservation. It rejects live mode and live keys.
