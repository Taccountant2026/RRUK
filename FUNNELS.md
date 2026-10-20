# Bytova, RRUK and The Outdoor Living Co. private enquiry pipeline — 20 October 2026

Customer entry: https://retroreplay.uk/start
Owner inbox: https://retroreplay.uk/admin#funnels
Bytova customer entry: https://bytova.co.uk/start-here.html

RRUK's six main shopping routes are ready buyers, returning players, gifts, collectors, connections/setup and saved shortlists. The Replay Room also feeds into optional private shopping help. Public links take buyers straight to suitable discovery tools, listings and the basket. A question or Console Hunt is an alternative chosen by the visitor; it does not replace Add to basket on defined sale offers. Six existing unclear packs remain enquiry-only, as previously chosen by the owner.

Private form submissions record a bounded, allowlisted route and optional short campaign label. A personal-shopping link may preselect gift purpose, budget or setup. Saved items are included only by the visitor’s explicit checkbox. Names, emails, private questions and owner notes are never published as community stories. Existing story permission and moderation remain separate.

The same controller’s Bytova and Outdoor Living Co. websites can send reviewed enquiries to /api/leads. This endpoint accepts its own actual origin, the two exact Bytova HTTPS origins and the exact owned https://taccountant2026.github.io origin, without cookies or wildcard CORS. Outdoor Living entries use the stable internal brand garden and remain private; their reply drafts link to /Turf-Right/ pages. It requires privacy acknowledgement, bounded fields and a random request UUID. Intake, metadata and owner notification are written together. The existing database schema and encrypted email connection are retained. No customer auto-reply or mailing-list entry is created.

Funnels in the protected owner area combines up to 400 private message records and 200 item requests. Filter by brand, route or stage, review a request, set a next action/date and prepare a personal reply. Stages are New enquiry, Reply sent, Quote/options sent, Converted and Closed. Converted is an owner-maintained pipeline stage, not payment verification. Confirm paid RRUK orders in Orders. The pipeline never changes prices, stock, payment state or story publication permission.

Saving a stage sends no message. Email buttons open drafts for the owner to review, complete and send. A follow-up date creates an inbox queue, not an automatic email, reminder or unattended marketing sequence. CSV exports contain private details; keep them secure and use them for the relevant requests, not unrequested bulk marketing.

When the existing email connection is enabled, new requests queue a private owner alert. Bytova and Outdoor Living alerts are clearly labelled, sent to the saved owner recipient, and link to Funnels. Existing transactional order messages and sender configuration remain unchanged. Queue processing follows the existing traffic-triggered/manual retry model, not an idle scheduled worker. The owner previously reported email test/activation; inbox delivery has not been independently re-tested in this release.

Short utm_campaign labels can pass in ordinary public navigation links and be included with a submitted request. This uses URL parameters, not cookies or visitor profiling. Private order, owner, API and basket links are excluded. Route totals count loaded enquiries; there is no visitor denominator or claimed conversion rate.

Closing or converting an enquiry closes its private source record. The existing maintenance action removes closed records after twelve months and removes orphaned funnel metadata. Owner notes should be limited to the job and avoid unnecessary sensitive details. Retention remains subject to active work, disputes and legal records. Source updates use revision checks and transaction guards to reject stale pipeline writes.

## Optional statistics

https://retroreplay.uk/admin#statistics is a separate protected view for all three businesses. It counts consented public-page/action events and known campaign labels in anonymous daily aggregates for up to 90 days. No names, emails, form text, order tokens, IP addresses, visitor identifiers or browsing history are stored in those statistics. The separate short-lived abuse key is hashed. Statistics remain off without a current positive device choice and honour browser no-tracking signals. Admin/order pages and unapproved paths are excluded. Actual enquiry counts and current live paid/dispatched order totals come from existing business records. Event counts are not unique visitors, all traffic, completed bookings, a conversion rate or a verified purchase signal.

The public endpoint is /api/metrics. Private reporting is /api/admin/statistics. Both use the existing database schema; no payment or email configuration changes are needed. The actual client consent and aggregation SQL have automated tests. Google Analytics, Search Console and Windsor.ai are separate external accounts, not implicitly connected by this first-party panel.
