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
- Thirteen automated tests passed, including actual migrated SQLite concurrency and rollback tests, Stripe SDK signature verification, connection-bound webhook evidence and verified refund states.
- Production Worker/client build passed. The native Sites saved version/deployment records verify the published source and URL.
- Browser QA is unavailable in this managed session; responsive layout and keyboard/screen-reader behaviour have not been browser-verified.
- The owner completed the private £1 hosted test checkout. The saved RRUK order was verified as paid in test mode, and Stripe independently returned a completed, paid GBP100p session.
- The same simulated payment was fully refunded through the connected Stripe test account. Stripe returned a succeeded GBP100p refund. The application's strengthened refund verifier accepted the provider's actual session, payment and refund objects. The deployed RRUK order still needs owner reconciliation to record that refund in its database.
- No live customer charge was made. No live merchant key is saved in this runtime. A connected Stripe MCP account is not the storefront's server key.

## Remaining secure merchant setup

The owner has saved the test key in the private `/admin` Payments form, configured the test webhook and enabled owner-only test checkout. The test merchant is `acct_1UPePCDMYd1hK6hb`, displayed as Bytova. Test records remain RRUK-labelled and separate from live Bytova changes.

Successful hosted test purchase and provider test refund are verified. Remaining provider/browser workflows: declined payment, cancellation, duplicate external delivery, delayed success/failure, expiry and owner recording of the refund. Local fixtures cover payment mismatches, duplicate/out-of-order states, stock release and refund safety; they do not replace actual provider/browser verification.

The live account was inspected read-only on 18 October: charges and payouts are enabled with no currently due requirements, but its business profile, website and statement descriptor still identify Bytova. Do not rename that working account as part of RRUK setup. Save an intended RRUK live restricted key through the owner form, after confirming the RRUK merchant, customer-facing legal/support details, receipts and bank statement wording. No live key is currently saved and real checkout remains disabled.

The site is still owner-private. Its configured test webhook exists and is enabled in Stripe, but Stripe cannot cross the platform sign-in wall. Public access requires the owner's explicit audience instruction. After public access/domain setup, verify actual signed delivery to the current endpoint. Webhook evidence is now bound to account, test/live mode, endpoint URL and signing-secret fingerprint; an old timestamp or a previous connection cannot unlock live checkout. Merchant charges-enabled status is checked directly with Stripe when enabling live mode.

Payment reconciliation now checks provider refund objects and distinguishes succeeded full refunds from pending/partial refunds. Dispatch performs a fresh payment/refund check before marking an order sent. Test orders no longer count as ready to pack. A refund does not automatically return stock to sale.

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

On 18 October the owner saved the Bytova parent account test key, created the test webhook and enabled test checkout. Read-only checks confirmed payment-mode=test, payments-enabled=1, live-branding-confirmed=0 and fulfilment-confirmed=0. The hosted purchase and provider refund have now succeeded; no real payment was authorised. Test order: `434c26d4-b457-4823-be35-f0edb0e991fd`. Succeeded simulated refund: `re_3URxFIDMYd1hK6hb1oYLqB4u`. Refresh Orders and use Verify payment to record the refund through the protected owner route.
