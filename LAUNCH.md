# RRUK sales status — 19 October 2026

## Current model

See EXPERIENCE.md for the complete shop, Replay Room and journal. Nine collections and server-rendered search cover all 65 choices. Eight original articles, RSS, Console Hunt/Checker and protected moderation are implemented. Navigation uses native document links. No community activity is fabricated.

The owner's latest instruction is to use the old Shopify/eBay buy-after-sale model, the approved generated images, and Active availability without public stock amounts. The new source-order release implements65 active choices:59 fixed-price offers and six details requests. It supersedes the earlier all-enquiry-only catalogue. No eBay quantity is treated as held inventory and no physical stock is invented.

Public store: https://retroreplay.uk
Owner controls: https://retroreplay.uk/admin#catalogue
Payments: https://retroreplay.uk/admin#payments

- The domain and valid HTTPS are active on root and www; public audience and indexing are preserved.
- Live merchant configuration, owner branding/fulfilment declarations and genuine signed live delivery at the final domain are saved. The owner enabled live customer checkout at 13:23 BST on 19 October. Read-only production verification confirmed live mode and payments-enabled=1. Preserve this state; do not ask for activation again.
- Defined source offers use the supplied eBay prices, including colour Start prices. Generated images are labelled illustrations; the ordered model, condition and written contents define the purchase. The lower-priced purple GameCube lot is the standard offer.
- Delivery is included by default as a stated implementation assumption; the optional delivery preference received no answer. The complete default sourced delivery period is within30 calendar days of order unless otherwise agreed before ordering. Both fields are editable in Catalogue. Physical stock retains its separate1–3 working day dispatch aim.
- Master System II game bundle, white GBA game bundle, silver DS model/game bundle and three unclear empty-case packs remain details requests. Their contents must be defined before payment.
- Source items have an Active switch, not a finite inventory quantity. Basket quantities are customer order quantities, with a ten-per-line order cap. Source lines are skipped by stock decrement/restoration; mixed orders reserve only physical stock.
- Source-offer prices, availability and delivery use protected version-checked owner settings. Product data, totals and contract terms are derived and saved server-side. Caller stock/prices are ignored.
- Policies use version2026-10-19-source-orders. Existing orders keep their original snapshots. Cancellation, faulty-goods rights and the six-month console/handheld warranty remain.
- No real charge, refund, customer message, stock import or business-data schema seed was created during this release. No automatic order alerts or customer email is configured.

## Completed payment evidence

The first native-origin GBP1 test order434c26d4-b457-4823-be35-f0edb0e991fd was paid and fully refunded in test mode. Generic decline and cancellation return were observed by the owner. The abandoned order4dae40eb-8146-4857-abc6-aed31f6f61fd automatically expired through real provider delivery. A repeat of the earlier completed event returned200 and left exactly one processed record, preserving the refunded order.

Live event evt_1USA28D8x9830lXtXzSb6fHc delivered to https://retroreplay.uk/api/stripe/webhook, with saved merchant/mode/endpoint/signing-secret-bound evidence at1792391217284. The temporary account.updated subscription was removed; all four Checkout event types remain on the live endpoint.

At12:42 BST on19 October, the owner completed the NEW final-domain GBP1 test checkout. D1 independently confirms order3a090633-1c82-4975-bef4-5fee083d5264 is paid, test,100pence, paid_at1792410153821. Its saved success/cancel URLs use retroreplay.uk. Genuine signed test receipt at1792410152984 matches the saved test merchant and final endpoint; processed checkout.session.completed event evt_1USExXDMYd1hK6hbwLVWg0dY is saved for this order at1792410154308. This is actual final-domain card transport and paid-state evidence. No real money moved. Do not recreate accounts/keys/endpoints or repeat the first successful card/webhook tests.

These provider checks predate the sourced-basket release. They are not a claim that every newly defined offer or payment method has been externally purchased. The current37 automated tests include source/mixed baskets, no fictitious stock reservations, active/price/delivery validation, source purchase invitations and new-policy consent, alongside the existing SQLite concurrency, signature, refund and payment-state checks. TypeScript and the managed production build are required before this release is published. Full browser/keyboard/screen-reader QA is unavailable in this managed session.

## Opening sales and daily operation

1. Review Catalogue Active switches, prices and sourcing/delivery terms. The approved illustration assets are already included; actual unit photos and a physical count are not prerequisites for the source offers.
2. In Payments, retain the saved Live connection and declarations. Complete applicable external tests for any additional delayed/payment methods intended for sale. Live checkout is already enabled by the owner and verified; preserve this setting. Do not repeat activation. The server continues to verify the saved live merchant and bound signed delivery.
3. Check paid LIVE Orders regularly. Source and check the written model/colour/contents; never dispatch test, pending or review orders. Include the downloaded saved order/terms with the parcel, record tracking and email the customer.
4. Keep within the displayed complete delivery period. Resolve a sourcing failure or material difference promptly by agreement or refund. Ordinary source-after-order goods are not automatically personalised goods with no cancellation right.
5. Requests handles unresolved pack/game/model choices and existing enquiries; purchase invitations are drafts opened in the owner's email app. Products optionally manages individual items with actual photos and finite stock. Refunds are processed in the correct Stripe account and verified here; physical returned stock is inspected before relisting.

Source/runtime credentials, customer data and the separate Bytova live business remain unchanged. See CATALOGUE.md, FIRST_SALE.md and the durable development checkpoint for mapping and exact deployment evidence.
