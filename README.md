# RRUK — RetroReplay UK

A separate RetroReplay UK store built around the owner's pixel CRT branding. The source, product database, image storage, runtime configuration and checkout are independent of Shopify and the Bytova site.

The public sourcing catalogue has 65 choices from the owner-supplied eBay export (67 source options, with two duplicate lots combined). Entries show approved brand illustrations, indicative guide prices or Price on request, and Available to order subject to sourcing. They collect free availability requests; they do not invent in-stock quantities or accept upfront payment for an unconfirmed unit.

## Stack and hosting

React / Vinext, TypeScript, Cloudflare Worker runtime, D1 via schema migrations, R2 product photos and server-side Stripe hosted Checkout. Sites provisions the declared DB and BUCKET bindings. Site project identity is retained in `.openai/hosting.json`. The separate source repository is `Taccountant2026/RRUK`.

A static GitHub Pages upload alone cannot run the checkout, database, private owner area or uploads. GitHub holds the source; the Worker deployment runs the shop. The source can be moved to compatible hosting with D1/R2 and a supported authentication boundary.

## Development and checks

Use the Sites installation/build helpers in the managed workspace. Dependencies are pinned by `pnpm-lock.yaml` (pnpm 11.25.0).

```
npm run typecheck
npm test
npm run db:generate
npm run build
```

The tests also exercise catalogue source counts, unconfirmed-item checkout rejection, bounded enquiry validation, same-payload retries and the migrated enquiry SQL. The tests exercise basket tampering, delivery totals, payment matching, delayed payment transitions, forged webhook signatures, sale readiness and the actual SQLite migrations/reservation SQL under concurrent last-item attempts. Python 3 is used for SQLite concurrency tests.

Do not run `db:generate` unless the schema has changed. Commit generated SQL and metadata; never change an applied migration. Source helpers handle managed build packaging and publication. Production secrets belong in runtime configuration, not source or client bundles.

## Owner area

`/admin` requires dispatch-authenticated ChatGPT identity and a server-side `ADMIN_EMAIL` allowlist. Account sign-in alone does not grant administration. Mutations additionally require same-origin requests.

- Check Requests for customer enquiries. Reply personally, mark contacted/closed, and use Prepare sale item to prefill the title, category and URL of a confirmed item. The same published URL replaces the sourcing entry. No automatic email notifications are configured.
- Overview shows the current launch steps. Products also lets the owner start directly from a sourcing-catalogue choice without waiting for a request. Only the title, category and URL are carried across; actual photos, stock, selling price and delivery details still come from the owner.
- A ready published item with enough stock and enabled live checkout unlocks a purchase-invitation email draft in Requests. Its totals and link use the actual sale listing. Opening a draft does not send it or reserve stock.
- Add drafts, upload actual item photos, and record condition, included items, compatibility, quantity, GBP price and tracked delivery cost/estimate.
- Publish only after confirming item checks and sale details. Consoles/handhelds have the established six-month hardware warranty.
- Product edits use a revision check so checkout reservations cannot be silently overwritten by a stale stock form.
- Orders show verified payment state, shipping details and packing documents. A test order cannot be dispatched.
- Refunds are processed in the correct Stripe Dashboard account. The owner can verify and record the resulting refund through the site. Returned items are inspected and restocked manually.

## Payment configuration

1. Open `/admin` → Payments. Enter a test restricted Stripe API key through that private HTTPS form. Never send secrets in chat.
2. Use a restricted key with own account Read, Checkout Sessions Write, Payment Intents Read, Charges Read, Refunds Read and Webhook Endpoints Write. Keep other permissions unset. The endpoint setup button saves its signing secret securely; an existing endpoint's secret can also be entered through the private form.
3. API keys and signing secrets are encrypted with AES-GCM in D1. The master `STORE_SECRET` remains a Sites runtime secret. Back it up securely using the platform's secret management; rotating it without migrating encrypted records invalidates their decryption and existing order view tokens.
4. Configure the four Checkout events listed in `LAUNCH.md`. Dynamic payment methods are used; do not add a method-type allowlist. The latest installed SDK (23.0.0) uses API version 2026-09-30.endive.
5. Test checkout is owner-only; the customer storefront is public and administration remains protected. The final domain is https://retroreplay.uk. Both saved endpoint configurations were updated through the owner area. Genuine signed live delivery to the final domain was verified on 19 October 2026; the test receipt still records the earlier native origin. Receipts use the actual request origin and are bound to merchant, mode, endpoint and signing secret. A locally signed fixture does not prove hosted delivery.
6. Live sales use the separate RetroReplay UK merchant. Its customer-facing identity, receipts, support information and statement wording must identify RRUK. The existing Bytova standard-test connection is used only for simulated integration tests; Bytova's working live settings remain separate.
7. Live activation requires an enabled merchant, a signing secret, a matching signed live webhook and the owner's branding/fulfilment confirmations. Checkout is currently paused in live mode. Finish the applicable checkout tests before sales; use Stripe's simulated test data rather than real card details for testing.

The saved test and live connections already exist for this deployment; do not repeat key setup. **Run £1 test payment** in Overview or Payments uses only the saved test merchant, checks its webhook is bound to the current HTTPS origin, and creates a stock-free internal test order. It works while live checkout is paused or enabled, without changing the customer payment mode or enable flag. Same-origin owner authorization, rejection of live keys and mode verification of the resulting Stripe Session remain enforced. The final-domain external test is still an owner action; publishing this button does not complete that test. See `FIRST_SALE.md` for the shortest current operating route.

Customer totals and item data come from the server. Stock is reserved in an atomic D1 batch before the provider request. A stable order idempotency key and saved immutable Checkout parameters prevent duplicate sessions on retries. Ambiguous provider failures hold inventory until safely reconciled. Signed webhooks and an owner-initiated API reconciliation verify amount, currency, mode, account and payment status. A success URL does not mark an order paid.

The admin reconciliation action checks open/processing/creating orders, restores expired stock only once, and cleans obsolete rate-limit records old failed checkout records, and enquiries closed more than twelve months ago. Processing delayed payments keep their stock. An unexpected paid event after stock was released goes to manual review.

## Customer policies and operations

The business details and six-month console warranty reflect owner-supplied RRUK information. Policy text is versioned and saved with each checkout. Customers can download the saved order and terms; the owner includes that durable copy with the parcel. Shipping tracking is recorded and shared through normal support email. Automated customer email sending is not configured or claimed.

See `LAUNCH.md` for outstanding connection/testing work and `POLICY_SOURCES.md` for the official guidance consulted. Policies support the business; fulfilment practices, safe genuine stock and legal obligations still matter.
