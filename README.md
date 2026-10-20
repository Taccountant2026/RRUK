# RRUK — RetroReplay UK

The complete shopping and Replay Room release adds nine collections, server-rendered search, a persistent basket, saved items, eight journal articles, RSS, Console Hunt/Checker and reviewed community stories. See EXPERIENCE.md for routes and owner workflow. The owner enabled live checkout on 19 October 2026; preserve the saved payment settings.

A separate RetroReplay UK store built around the owner's pixel CRT branding. The source, product database, image storage, runtime configuration and checkout are independent of Shopify and the Bytova site.

The owner requested a sourced-to-order sales model using the supplied Shopify/eBay range, approved generated illustrations and Active switches without public stock amounts. The 65 choices contain 59 fixed-price orderable offers and six details requests for unresolved pack/game/model contents. The model does not treat eBay quantities as held stock. See `CATALOGUE.md` for the full mapping and operating model.

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

- Catalogue manages sourced-offer Active switches, fixed prices, delivery charge and complete sourcing/delivery period. Owner-only updates use an expected-version check.
- The defaults use eBay prices with tracked UK delivery included and delivery within30 calendar days unless otherwise agreed. Delivery included is the stated implementation assumption, editable in Catalogue.
- Requests handles ambiguous packs/bundles and existing enquiries. Purchase-invitation drafts use the actual orderable offer and never send automatically.
- Products optionally manages individual stock items with actual photos and finite quantities. Publishing one replaces the source offer at the same URL. Revision checks protect its inventory.
- Orders show verified payment, shipping details, saved terms and tracking. Check regularly: no automatic order alerts or customer email is configured. Test orders cannot be dispatched.
- Refunds are processed in the correct Stripe account, verified here and handled without automatic relisting of returned stock.

## Payment configuration

1. Open `/admin` → Payments. Enter a test restricted Stripe API key through that private HTTPS form. Never send secrets in chat.
2. Use a restricted key with own account Read, Checkout Sessions Write, Payment Intents Read, Charges Read, Refunds Read and Webhook Endpoints Write. Keep other permissions unset. The endpoint setup button saves its signing secret securely; an existing endpoint's secret can also be entered through the private form.
3. API keys and signing secrets are encrypted with AES-GCM in D1. The master `STORE_SECRET` remains a Sites runtime secret. Back it up securely using the platform's secret management; rotating it without migrating encrypted records invalidates their decryption and existing order view tokens.
4. Configure the four Checkout events listed in `LAUNCH.md`. Dynamic payment methods are used; do not add a method-type allowlist. The latest installed SDK (23.0.0) uses API version 2026-09-30.endive.
5. Test checkout is owner-only; the customer storefront is public and administration remains protected. The final domain is https://retroreplay.uk. Both saved endpoint configurations were updated through the owner area. Genuine signed live delivery to the final domain was verified on 19 October 2026; a new GBP1 test card purchase and signed test delivery to the final domain were independently verified at12:42 BST on19 October2026. Receipts use the actual request origin and are bound to merchant, mode, endpoint and signing secret. A locally signed fixture does not prove hosted delivery.
6. Live sales use the separate RetroReplay UK merchant. Its customer-facing identity, receipts, support information and statement wording must identify RRUK. The existing Bytova standard-test connection is used only for simulated integration tests; Bytova's working live settings remain separate.
7. Live activation requires an enabled merchant, a signing secret, a matching signed live webhook and the owner's branding/fulfilment confirmations. Checkout is currently paused in live mode. Finish the applicable checkout tests before sales; use Stripe's simulated test data rather than real card details for testing.

The saved test and live connections already exist for this deployment; do not repeat key setup. **Run £1 test payment** in Overview or Payments uses only the saved test merchant, checks its webhook is bound to the current HTTPS origin, and creates a stock-free internal test order. It works while live checkout is paused or enabled, without changing the customer payment mode or enable flag. Same-origin owner authorization, rejection of live keys and mode verification of the resulting Stripe Session remain enforced. The final-domain card purchase and genuine signed test delivery are complete. No repeated first-success test is needed. Method-specific external delayed-payment coverage remains separate. See `FIRST_SALE.md` for the shortest current operating route.

Customer totals and item data come from the server. Finite physical stock is reserved in an atomic D1 batch before the provider request. Sourced lines have no invented stock count and are excluded from decrement/restoration; mixed baskets reserve only physical lines. A stable order idempotency key and saved immutable Checkout parameters prevent duplicate sessions on retries. Ambiguous provider failures hold inventory until safely reconciled. Signed webhooks and an owner-initiated API reconciliation verify amount, currency, mode, account and payment status. A success URL does not mark an order paid.

The admin reconciliation action checks open/processing/creating orders, restores expired stock only once, and cleans obsolete rate-limit records old failed checkout records, and enquiries closed more than twelve months ago. Processing delayed payments keep their stock. An unexpected paid event after stock was released goes to manual review.

## Customer policies and operations

The business details and six-month console warranty reflect owner-supplied RRUK information. Policy text is versioned and saved with each checkout. Customers can download the saved order and terms; the owner includes that durable copy with the parcel. Shipping tracking is recorded and shared through normal support email. Automated customer email sending is not configured or claimed.

See `LAUNCH.md` for outstanding connection/testing work and `POLICY_SOURCES.md` for the official guidance consulted. Policies support the business; fulfilment practices, safe genuine stock and legal obligations still matter.

## Final store and community revamp — 19 October 2026
Start Here, quick Add to basket, complete basket item details, budget/ready-to-order shortcuts, community prompts and public share controls are included. Keep the approved imagery, live merchant and source-order model. The six unclear entries remain free enquiries by the owner's choice.

The protected Emails tab prepares transactional email with Resend, encrypted credentials and a durable D1 outbox. A verified sender, sending-only API key and received test are still needed to enable it. Email remains disabled until that setup; no provider account, billable plan or customer message was created by this release. See EMAILS.md.

## Interactive visitor tools

- `/console-finder` builds a three-question shortlist from the current shop context. It enforces item budgets, excludes enquiry-only/unavailable choices, and shows the cheapest matching variant from up to three different console families. Purchases use the existing product cards and basket.
- `/community#play` contains a six-pair memory game. A round is page-local, uses accessible native buttons, and has no account, stored score or public leaderboard.
- The existing Console Checker remains available for gathering model and display details. Finder choices are not a compatibility guarantee.

## Shopping journeys and private help — 20 October 2026

The homepage routes visitors to ready-to-order products, Console Finder, gifts or optional personal help. `/gifts` filters current orderable items by category and item budget, without relaxing price limits or implying guaranteed compatibility/delivery dates. `/why-rruk` explains the shop's existing ordering and community approach.

`/personal-shopper` uses the existing private question submission flow and owner alert queue. Shopping purpose, budget, setup and the visitor's message are stored only after they submit with the privacy acknowledgement. Optional saved item inclusion is off by default. A product link can supply public product context; unknown IDs are ignored. There is no mailing-list enrolment or automatic customer acknowledgement. Replies remain personal owner work.
