# RetroReplay UK domain connection

Verified 19 October 2026; final-domain live Stripe delivery passed at 07:26 BST. Both retroreplay.uk and www.retroreplay.uk are active in Sites with active HTTPS certificates. The public storefront is served by the independent RRUK Worker app.

Primary origin: https://retroreplay.uk. PUBLIC_ORIGIN is applied in runtime environment revision2. Existing owner access, encrypted payment settings, D1/R2 data and the native preview address are preserved. Checkout remains paused in live mode; indexing stays off until actual products and sale readiness are complete.

## Current DNS

The owner saved these records through Squarespace. Public DNS verification matched all seven records; existing Zoho MX, SPF, DKIM, DMARC and unrelated verification records were preserved.

| DNS type | Full name | Value |
| --- | --- | --- |
| A | retroreplay.uk | 162.159.143.30 |
| A | retroreplay.uk | 172.66.3.26 |
| TXT | _openai-site-verification.retroreplay.uk | openai-site-verification=Djmg16iMnOH_40wXAxKk-1KLjDXvlWGN02RTRMhSpvo |
| TXT | _cf-custom-hostname.retroreplay.uk | 89415f21-ca8e-4b80-aab6-2db88a505ce8 |
| CNAME | www.retroreplay.uk | custom-domains.chatgpt.site. |
| TXT | _openai-site-verification.www.retroreplay.uk | openai-site-verification=ABUX-Buf-epdHs-kHrC67CG7kIzXKnWFt7mpncw69fE |
| TXT | _cf-custom-hostname.www.retroreplay.uk | 198c21cd-0268-4f6a-a96e-4616a87ecccc |

Keep the verification records. A registrar transfer and nameserver change were not needed. Root and www both serve the site with canonical URLs pointing to the primary root origin; www is not claimed to redirect to root.

## Verified delivery

Both HTTPS homepages return 200 with the RRUK title, root canonical and final-domain Open Graph image. HTTP root upgrades to HTTPS. Shop, contact, terms, returns, logo, empty catalogue, robots and sitemap respond correctly. Anonymous owner API access returns the application's 403, and an unsigned webhook reaches the final route and returns the expected 400. The owner page requires sign-in and the configured owner email; a sign-in page itself may return 200.

The first native refreshes showed pending validation, followed by active certificates with active_redeploying. Republishing the saved source with the final origin applied environment revision2 and finished routing activation. Both native domain statuses are now active with no error. No certificate check was bypassed.

## Payment callback cutover

The owner completed both Test and Live webhook setup actions on the final-domain owner page. Encrypted saved configurations updated on 19 October 2026 at 06:19:53 UTC and 06:20:07 UTC respectively. No key or signing secret was exposed or replaced. The live provider destination is independently confirmed enabled at https://retroreplay.uk/api/stripe/webhook.

The owner then saved https://retroreplay.uk/contact as Stripe's public support website. This emitted genuine live event evt_1USA28D8x9830lXtXzSb6fHc. The store received and verified its signature at 1792391217284, recording the actual root-domain URL, RRUK merchant, live mode and matching secret fingerprint. Stripe reports no pending webhook delivery for that event. The temporary account.updated event subscription was removed; all four checkout event types remain enabled. No live purchase or refund was made.

The test-mode receipt still refers to the earlier native origin. Refresh that evidence by resending the existing expiry event evt_1US2hbDMYd1hK6hbg9Z0yfoR to the existing destination in Bytova standard Test mode; that merchant is not exposed in the current MCP session. Verify the actual final-domain test receipt and idempotent order/event state. No new key, account or purchase is needed for this resend. Source uses PUBLIC_ORIGIN for new Checkout return/order URLs; a new final-domain test session has not yet been externally checked.

Keep checkout paused while the catalogue is empty. Finish applicable product/payment-method checks, add genuine checked/photographed stock and enable real sales when ready. Enable indexing after the real catalogue is ready.

## Rollback

Old root website record: A 23.227.38.65. Old www CNAME: shops.myshopify.com. To roll back hosting, restore those two website mappings and remove only the two new hosting A targets. Preserve every unrelated mail, verification and preset record. If changing the application origin back, redeploy that environment and restore/verify matching webhook URLs before enabling checkout. Keep checkout off during diagnosis; do not change Bytova.
