# RetroReplay UK domain connection

Verified 19 October 2026, shortly after midnight BST. Both retroreplay.uk and www.retroreplay.uk are active in Sites with active HTTPS certificates. The public storefront is served by the independent RRUK Worker app.

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

Both HTTPS homepages return 200 with the RRUK title, root canonical and final-domain Open Graph image. HTTP root upgrades to HTTPS. Shop, contact, terms, returns, logo, empty catalogue, robots and sitemap respond correctly. Anonymous owner access returns the application's 403, and an unsigned webhook reaches the final route and returns the expected 400.

The first native refreshes showed pending validation, followed by active certificates with active_redeploying. Republishing the saved source with the final origin applied environment revision2 and finished routing activation. Both native domain statuses are now active with no error. No certificate check was bypassed.

## Finish payment callback cutover

1. In the owner Payments page at https://retroreplay.uk/admin, select Test and use Create or update test webhook. Then select Live and use Create or update live webhook. These secure owner actions update each existing endpoint and its encrypted stored URL without exposing or replacing its signing secret.
2. Keep checkout paused. Each endpoint must now target https://retroreplay.uk/api/stripe/webhook.
3. Verify genuine signed external delivery in both configured modes at that final address. Earlier native-origin receipts do not verify the new address. Receipts record the actual request origin, so a callback to the preview address cannot be counted as final-domain delivery.
4. Update Stripe's public support website from the native support URL to https://retroreplay.uk/contact. The separate RRUK merchant and statement descriptor are already verified.
5. Finish applicable payment-method tests, add genuine checked/photographed stock and enable real sales only when ready. Enable indexing after the final domain and catalogue are ready.

## Rollback

Old root website record: A 23.227.38.65. Old www CNAME: shops.myshopify.com. To roll back hosting, restore those two website mappings and remove only the two new hosting A targets. Preserve every unrelated mail, verification and preset record. If changing the application origin back, redeploy that environment and restore/verify matching webhook URLs before enabling checkout. Keep checkout off during diagnosis; do not change Bytova.
