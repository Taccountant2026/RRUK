# RRUK sourced-to-order catalogue — 19 October 2026

The owner explicitly requested the old Shopify/eBay buy-after-sale model, approved generated images and **Active** availability without public stock amounts. That instruction supersedes the earlier all-enquiry-only model. Customers can place paid orders for defined offers; the owner sources and checks the described goods afterward. An Active label never claims held inventory.

## Source and prices

The supplied eBay All active listings CSV has 68 records, 62 unique IDs and 67 item/colour options after the controller parent is excluded. Two duplicate lot pairs become 65 public choices. The original reviewed data remains in `lib/sourcing-catalogue.json`; `lib/source-orders.mjs` creates the current offers from it. No eBay quantity is imported as physical stock.

- 59 choices have a fixed price and support the basket when live checkout is enabled.
- Six remain details requests: the three unclear empty-case packs, Master System II game bundle, white GBA game bundle and silver DS model/game bundle. Their contents must be defined before payment.
- All six wireless-controller colours have explicit Start prices in the export, despite blank child Current price cells. Black is £14.99; the other five are £24.99. This corrects the earlier missing-price assumption.
- The standard purple GameCube offer uses the £167.99 console-with-leads lot; the £289.99 duplicate lot is not silently substituted.
- Written contents use the source titles. Console-only offers do not promise controllers, cables or games that are not listed. No standalone physical games, unknown game selections, ROM libraries or transfer of accounts/licences were invented.

Prices use the supplied GBP export. Delivery is included by default as an implementation assumption stated to the owner; no reply to the optional delivery preference was received. The owner can change the delivery charge and complete delivery period in Catalogue. The default delivery period uses the old policy's 30-day framework and includes sourcing; it is not the 1–3 working day dispatch aim for physical stock. Generated illustrations are clearly labelled and do not identify a particular unit. Pre-owned goods are offered in working condition with cosmetic wear; material differences require agreement or refund. Consoles and handhelds retain the six-month warranty.

## Daily operation

1. In `/admin#catalogue`, keep Active switches, prices and delivery accurate. Settings use a version check to prevent overwriting a concurrent edit.
2. In Payments, retain the saved Live merchant and declarations. Enable live checkout only when the intended methods and fulfilment are ready. The final-domain card payment and actual signed test/live deliveries are already verified; do not recreate keys or repeat first-success tests.
3. Check paid LIVE Orders regularly. Source and check the described item, keep within the displayed delivery period, include the downloaded saved terms with the parcel, record tracking and contact the customer. Email is manual, with no automatic order alerts.
4. Resolve a sourcing failure promptly with the customer and refund where required. Do not silently replace the ordered model/colour/contents or charge more.
5. Requests holds the six details-request types and earlier enquiries. A matching orderable offer with live checkout enabled unlocks a reviewed purchase-invitation email draft. No draft is sent automatically.
6. Products remains available for optional individual stock items with their own photos and finite quantities. Such a published item replaces the sourced offer at the same URL. Physical quantities stay under the original atomic reservation/release logic.

## Payment and stock handling

Source offers have `saleMode: source`, stock0 and a maximum of ten per cart line. Ten is an order limit, not a reported stock amount. Source lines create no physical reservation and are skipped by stock decrement and restoration. Mixed orders reserve only managed physical lines. Prices, contents, delivery and mode are saved immutably with the order. Checkout rejects inactive or details-request entries even if the caller supplies a fictitious stock value or price. Existing payment verification, signed webhooks, refunds, cancellation and delayed-payment state protection remain in use.

The four approved illustrations in `public/assets/catalogue/` and the unchanged CRT logo are retained. `CATALOGUE_ART.md` records their prompts and generation mode.
