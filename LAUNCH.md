# RRUK launch status

18 October 2026. This is a separate project from Bytova. Keep Bytova's paused domain/HTTPS checkpoint intact.

## Implemented

- Original RRUK logo, responsive navy/blue/coral/yellow storefront, native illustrated collection cards, story and help pages.
- Empty catalogue ready for real researched products, category/search filters, product photos and details, local basket and GBP delivery totals.
- Protected owner area for products, photo uploads, stock, Stripe configuration, payment reconciliation, packing/tracking and verified refund records.
- Server-derived Checkout amounts, atomic stock reservation, idempotent requests and guarded stock restoration.
- Signature-checked webhooks for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`.
- Versioned terms, delivery, returns, cancellation form, six-month console warranty, privacy/cookies, condition guide, complaints and accessibility pages. Saved order/terms downloads and print styling.
- Search indexing remains off until the final domain is live.

## Verification

- TypeScript check passed.
- Ten automated tests passed, including actual migrated SQLite concurrency and rollback tests and Stripe SDK signature verification.
- Production Worker/client build passed. The native Sites saved version/deployment records verify the published source and URL.
- Browser QA is unavailable in this managed session; responsive layout and keyboard/screen-reader behaviour have not been browser-verified.
- No real merchant key was supplied to this runtime, no hosted Stripe payment was completed, and no live customer charge was made. A connected Stripe MCP account is not the storefront's server key.

## Remaining secure merchant setup

Enter the intended test key in the private `/admin` Payments form and verify the account/mode. The user's new test context currently displays the parent name Bytova. Test records must remain RRUK-labelled and separate from live Bytova changes.

Complete provider tests: successful payment, declined payment, cancellation, duplicate delivery, delayed success/failure, expiry, amount mismatch and refund verification. Local fixtures prove the application's checks; they do not replace actual provider/browser verification. Confirm the live merchant's legal/customer-facing details, receipts and statement descriptor before live activation. Keep checkout paused until complete.

## Domain connection (later, without transferring registrar unnecessarily)

1. Add `retroreplay.uk` and the chosen `www` arrangement to this same Sites project. Inspect the returned DNS requirements; do not reuse Bytova's GitHub Pages IP records for this Worker app.
2. Preserve RRUK email MX/TXT/DKIM and other working records. Save the old website records for rollback. Change only the website/verification records required by the hosting platform.
3. Verify domain ownership, DNS, TLS and the root/www redirect. The registrar can stay where it is.
4. Set the runtime `PUBLIC_ORIGIN` to the chosen final HTTPS origin, then redeploy the exact saved source. Update the Stripe webhook URL through the owner form. Verify success/cancel redirects and private order links use the final origin.
5. Make the customer storefront public through Sites access controls. The `/admin` server allowlist stays in force. External Stripe callbacks must reach the public webhook without sign-in.
6. Deliver and verify an actual signed event in each configured mode. Check that malformed/unsigned events are rejected. Reconcile any old reservations before changing merchant or origin settings.
7. Set `SITE_INDEXABLE=true` only after the final domain and real catalogue are ready. Verify canonical/OG URLs, robots, sitemap and 404 behaviour.

## Catalogue (later)

Research genuine available stock, realistic prices, delivery service/cost and product-specific legal/safety/age requirements. Photograph and check each item. Add real included-item lists, wear and known limitations, region and compatibility. Do not add ROM libraries or assume old licences/accounts transfer. Publish only when the item is ready for sale.

## Daily order operation

Check orders and reconcile open checkouts. Pack only verified paid **live** orders. Download and include the saved order/terms copy, use tracked delivery, record tracking and send the customer an update through the business email. Check support and returns. Review data-retention cleanup and preserve accounting records. Process refunds in the correct Stripe account and verify them here; restock only after inspecting the return.

## Owner test checkout added

The private Payments screen has a Run £1 test payment action. Its server route requires the authenticated owner, same-origin POST, an enabled test connection and a test-prefixed key. It stores a clearly labelled test order without adding a catalogue item or touching physical stock. The signed-in owner’s return page reconciles the session directly with Stripe; this verifies payment independently of the redirect while external webhook delivery remains unverified until public access. Real keys/live mode are rejected by the test action.

On 18 October the owner saved the Bytova parent account test key, created the test webhook and enabled test checkout. Read-only checks confirmed payment-mode=test, payments-enabled=1, live-branding-confirmed=0 and fulfilment-confirmed=0. No real payment was authorised. Provider/browser test completion is still pending the owner’s test purchase.
