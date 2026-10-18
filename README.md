# RRUK — RetroReplay UK

A separate RetroReplay UK store built around the owner's pixel CRT branding. The source, product database, image storage, runtime configuration and checkout are independent of Shopify and the Bytova site.

The first catalogue is deliberately empty. No sample products, invented reviews, stock counts or guessed prices are published.

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

The tests exercise basket tampering, delivery totals, payment matching, delayed payment transitions, forged webhook signatures, sale readiness and the actual SQLite migrations/reservation SQL under concurrent last-item attempts. Python 3 is used for SQLite concurrency tests.

Do not run `db:generate` unless the schema has changed. Commit generated SQL and metadata; never change an applied migration. Source helpers handle managed build packaging and publication. Production secrets belong in runtime configuration, not source or client bundles.

## Owner area

`/admin` requires dispatch-authenticated ChatGPT identity and a server-side `ADMIN_EMAIL` allowlist. Account sign-in alone does not grant administration. Mutations additionally require same-origin requests.

- Add drafts, upload actual item photos, and record condition, included items, compatibility, quantity, GBP price and tracked delivery cost/estimate.
- Publish only after confirming item checks and sale details. Consoles/handhelds have the established six-month hardware warranty.
- Product edits use a revision check so checkout reservations cannot be silently overwritten by a stale stock form.
- Orders show verified payment state, shipping details and packing documents. A test order cannot be dispatched.
- Refunds are processed in the correct Stripe Dashboard account. The owner can verify and record the resulting refund through the site. Returned items are inspected and restocked manually.

## Payment configuration

1. Open `/admin` → Payments. Enter a test restricted Stripe API key through that private HTTPS form. Never send secrets in chat.
2. Required permissions: own account read; Checkout Sessions read/write. Refund verification additionally reads PaymentIntents/Charges. Webhook endpoint write access supports the automatic endpoint setup; alternatively configure the endpoint in Stripe and enter its signing secret.
3. API keys and signing secrets are encrypted with AES-GCM in D1. The master `STORE_SECRET` remains a Sites runtime secret. Back it up securely using the platform's secret management; rotating it without migrating encrypted records invalidates their decryption and existing order view tokens.
4. Configure the four Checkout events listed in `LAUNCH.md`. Dynamic payment methods are used; do not add a method-type allowlist. The latest installed SDK (23.0.0) uses API version 2026-09-30.endive.
5. Test mode checkout is owner-only. An owner-private site blocks external Stripe webhook delivery at the platform sign-in wall. Do not interpret a locally signed fixture as a verified hosted delivery. Verify actual delivery when the site becomes public during domain connection.
6. Connect the intended live merchant and verify its customer-facing identity, receipts, support information and statement wording. The Checkout header is overridden to RetroReplay UK without changing shared Bytova account settings. A shared parent label does not prove the rest of the merchant branding is correct.
7. Live activation requires an enabled merchant, a signing secret, a received signed live webhook and the owner's branding/fulfilment confirmations. Real charges must not be made just to test without authorisation.

Customer totals and item data come from the server. Stock is reserved in an atomic D1 batch before the provider request. A stable order idempotency key and saved immutable Checkout parameters prevent duplicate sessions on retries. Ambiguous provider failures hold inventory until safely reconciled. Signed webhooks and an owner-initiated API reconciliation verify amount, currency, mode, account and payment status. A success URL does not mark an order paid.

The admin reconciliation action checks open/processing/creating orders, restores expired stock only once, and cleans obsolete rate-limit records and old failed checkout records. Processing delayed payments keep their stock. An unexpected paid event after stock was released goes to manual review.

## Customer policies and operations

The business details and six-month console warranty reflect owner-supplied RRUK information. Policy text is versioned and saved with each checkout. Customers can download the saved order and terms; the owner includes that durable copy with the parcel. Shipping tracking is recorded and shared through normal support email. Automated customer email sending is not configured or claimed.

See `LAUNCH.md` for outstanding connection/testing work and `POLICY_SOURCES.md` for the official guidance consulted. Policies support the business; fulfilment practices, safe genuine stock and legal obligations still matter.
