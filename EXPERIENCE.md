# RetroReplay UK — shopping, journal and community

The public experience uses “The classics. Back in play.” and “There's always room for player two.” Preserve the approved pixel television and navy, blue, coral, gold and mint palette.

## Shopping
The homepage leads directly to platform collections, featured offers, the Replay Room and the journal. The shop renders products with the page. Search, collection, budget, sort, ready-to-order filtering and pagination use ordinary GET navigation. Familiar PS2/N64/Gameboy searches work.

Nine collections cover all 65 imported choices. Overlap is deliberate. No invented games fill a missing category. Product pages show model, condition, written contents, compatibility and the complete delivery period. Controller colours link to separate offers. Source artwork is labelled representative.

Saved items stay on the device; they do not reserve an item or fix its price. The basket persists through document navigation using the necessary rruk_cart cookie, with migration of existing local storage. Server prices and availability still control Checkout.

The owner enabled live checkout at 13:23 BST on 19 October. Preserve its saved runtime settings. Six unclear packs/game bundles retain free details requests. No eBay quantity is treated as held stock.

## Journal and community
The blog has eight original complete articles with topic filters, contents menus, relevant collections and related reading. Manufacturer-specific examples link to primary references. The RSS feed at /feed.xml has eight items. New articles are maintained in lib/journal.mjs through source control; no no-code editor is claimed.

The Replay Room at /community has a real moderated story wall. The empty state is honest until a contribution is approved. Guidelines explain permissions, privacy, respect and removal/reporting.

Console Hunt and Contact create private requests in the protected owner queue. They cannot become public stories. Console Checker prepares a local setup checklist and an optional email draft; it neither diagnoses faults nor guarantees compatibility.

Order Help explains private confirmation links, payment verification, recorded tracking and personal support. It has no public lookup by email or order ID.

## Owner moderation
Open /admin#community. Check each story for private details, permissions and the guidelines before approving. Only stories with explicit publication permission can pass the SQL constraint. Public queries select only ID, display name, title, text and creation date. Email and request metadata stay private.

Approve publishes. Close unpublishes a story or closes a private request. Reopen returns it privately to the queue. Revision checks prevent lost updates. Email buttons open drafts; they do not send. Check this queue and Orders regularly; automatic email alerts are not configured.

A schema-only migration adds community_submissions. No posts, people, reviews, orders or stock are seeded. Owner maintenance removes closed submissions after twelve months.

## Reliability and verification
Native document links replace the failed client transitions. Mobile navigation uses details/summary. Catalogue and product content appear in the initial HTML. Cart IDs and quantities survive document navigation.

Recognised old Shopify paths redirect to exact current destinations. Unknown products retain a real 404 with useful shop links. Canonicals, Product/BlogPosting/WebSite structured data, RSS and sitemap cover the current experience. No ratings, reviews, members or social links are fabricated.

Run npm test for payment/inventory checks plus collection coverage, search, bounded cart parsing, privacy/consent, retry identity and actual migrated SQLite moderation checks.

Run python3 scripts/audit-store.py https://retroreplay.uk for bounded read-only HTTP DOM checks, all 65 product paths, assets, search, cookie basket persistence, old links, RSS and sitemap. This never creates a Checkout Session.

Managed browser rendering, hydration, viewport, keyboard and screen-reader interaction QA is unavailable in this session. HTTP checks do not replace it.
