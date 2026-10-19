# RRUK sourcing catalogue — 19 October 2026

The owner sources goods after a customer expresses interest. Public entries therefore use **Available to order · subject to sourcing** and a free **Request availability** form. They do not claim held stock, reserve an item, take payment or create a purchase contract.

## Source and curation

The owner supplied `eBay-all-active-listings-report-2026-10-19-13335517072.csv`. It contains 68 data records and 62 distinct eBay item IDs. One wireless-controller aggregate row is omitted in favour of its six colour rows, leaving 67 source options. Two pairs of duplicate selling lots are combined, giving **65 public entries**:

- Purple GameCube lots `397885841575` and `397885844900` become one request choice, with a guide range of £167.99–£289.99.
- Xbox/Xbox 360 empty-case listings `397880536323` and `397959743933` become one request choice. The pack size is unclear, so the customer requests the exact quantity and receives a quote.

Source quantities are never imported as sale stock. The raw export's 180 total double-counts a controller parent; even the corrected 176 reported selling units are not proof of physical inventory. All sourcing entries have stock zero and an explicit catalogue-only flag; the server rejects them at Checkout even if a caller invents stock.

Nonvariant guide prices come from the supplied GBP export and are labelled as indicative references checked on 19 October 2026. They are not a confirmed direct-store quote. All six controller colour prices remain Price on request because the child rows had no price. All empty-case options use Price on request until pack size and contents are confirmed. No standalone physical game titles were supplied, so none were invented.

Titles describe sourcing targets rather than promising the current unit's tested condition or grade. Special-edition authenticity, imports/region/power, exact DS model, HDMI compatibility, electrical safety, included leads and case contents require confirmation for the actual item. The ambiguous Dreamcast controller/VMU request explicitly excludes a console. Existing eBay charity claims, manufacturer warranties, restoration claims and no-returns wording were not copied.

`lib/sourcing-catalogue.json` is the reviewed public catalogue. `scripts/prepare-sourcing-catalogue.py` regenerates it from the supplied export, with all source IDs retained for reconciliation. Refreshes require review and deployment. Actual ready-to-buy products remain in D1 and retain their original sale-readiness, stock, price and photo checks.

## From a request to a sale

1. Check **/admin → Requests** regularly. There are no automatic email alerts or automatic customer confirmation emails. Customers see a saved reference on the page.
2. Use Reply by email to open a draft in your own email app. Complete every placeholder and confirm the specific item, photos, condition, exact contents, compatibility, final GBP price and tracked delivery cost/timing. Sending and marking contacted are separate owner actions.
3. Once an item can be fulfilled, use Prepare sale item. Only title, category and URL are prefilled. Add actual item photos, checks, agreed price, stock and delivery; save a draft or publish when ready. The published sale listing replaces the illustrated catalogue entry at the same URL. It is publicly purchasable, not reserved privately for the requester. Edit an existing sale item instead of creating another product with the same slug.
   Products also has a catalogue picker so the first sale item can be prepared before a request arrives. Existing sale items are excluded from that picker; Requests opens their editor directly. New item forms start at zero stock until the owner enters the actual available quantity.
4. Complete the applicable remaining payment checks in LAUNCH.md before enabling live Checkout. Share the ready item link with the customer. Existing stock reservation, payment verification, order snapshots, refund checks and packing tools apply to the resulting purchase.
   When a matching sale item is published, has the requested quantity available and live checkout is enabled, Requests offers Draft purchase invitation. It uses the actual sale price, one tracked-delivery charge and the public item URL. Until those conditions hold, it offers the availability reply with confirmation placeholders. Neither action sends email automatically or privately reserves an item.
5. Close completed enquiries. Run owner maintenance to remove closed enquiries older than twelve months. Keep order/accounting records under the separate retention schedule. No request content or email address is returned through a public read endpoint or logged by application error handling.

The public request endpoint checks same origin, bounds the body and fields, rate-limits hashed IP buckets separately from Checkout, and stores server-selected product details. Stable request keys prevent duplicate retries; a key reused with changed content returns a conflict without exposing the existing request reference. The owner queue and status mutations require the existing server-verified owner identity.

## Artwork

Four approved images in `public/assets/catalogue/` are AI-generated pixel illustrations: consoles, handhelds, accessories and empty cases. They match the established navy, cream, sky-blue, coral and yellow brand. They are reused by category and clearly identified as illustrations rather than photos or contents lists. The existing CRT logo is unchanged. Full prompts and generation mode are in CATALOGUE_ART.md.
