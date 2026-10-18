# RetroReplay UK domain connection

Prepared 18 October 2026 for the existing RRUK project. Both hostnames have been added to Sites and are pending DNS verification. No registrar records have been changed. The storefront remains owner-private and live payments remain off.

The intended primary origin is `https://retroreplay.uk`. Do not change `PUBLIC_ORIGIN` until that domain's HTTPS route is active. Preserve email MX, SPF, DKIM, DMARC and unrelated DNS records. Save the old website records before replacing them. These records are specific to RRUK Sites hosting; they are not Bytova's GitHub Pages records.

| DNS type | Full name | Value |
| --- | --- | --- |
| A | retroreplay.uk | 162.159.143.30 |
| A | retroreplay.uk | 172.66.3.26 |
| TXT | _openai-site-verification.retroreplay.uk | openai-site-verification=Djmg16iMnOH_40wXAxKk-1KLjDXvlWGN02RTRMhSpvo |
| TXT | _cf-custom-hostname.retroreplay.uk | 89415f21-ca8e-4b80-aab6-2db88a505ce8 |
| CNAME | www.retroreplay.uk | custom-domains.chatgpt.site. |
| TXT | _openai-site-verification.www.retroreplay.uk | openai-site-verification=ABUX-Buf-epdHs-kHrC67CG7kIzXKnWFt7mpncw69fE |
| TXT | _cf-custom-hostname.www.retroreplay.uk | 198c21cd-0268-4f6a-a96e-4616a87ecccc |

Some registrar forms append `.retroreplay.uk` automatically: use `@`/blank for the root, `www`, `_openai-site-verification`, `_cf-custom-hostname`, `_openai-site-verification.www` and `_cf-custom-hostname.www` respectively. Enter a full name only when the form expects it. Remove conflicting old website A/AAAA/root-CNAME records only when making the planned cutover. Do not remove mail records.

After saving DNS:

1. Refresh both native custom-domain statuses until ownership and SSL are active. Confirm valid HTTPS without bypassing certificate checks.
2. Set `PUBLIC_ORIGIN=https://retroreplay.uk`, then redeploy the current saved source. Verify root/www and old native URL handling, canonical URLs and success/cancel/order links.
3. Make the storefront public only after the owner's explicit instruction. Its server owner allowlist continues to protect administration.
4. Update the test webhook through the owner Payments form to `https://retroreplay.uk/api/stripe/webhook`. Confirm actual signed provider delivery and duplicate delivery handling. Changing endpoint or signing secret invalidates previous verification evidence.
5. Save the intended RRUK live restricted key privately. Check legal merchant/support details, receipts and statement wording. Configure and verify the live webhook before enabling real checkout.
6. Complete the remaining provider/browser scenarios in LAUNCH.md and publish only researched, checked, photographed physical stock. Enable indexing when the domain and real catalogue are ready.

Rollback: restore the saved old website DNS values and keep checkout off while diagnosing the cutover. Do not modify email records or Bytova.
