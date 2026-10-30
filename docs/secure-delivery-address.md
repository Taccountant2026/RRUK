# Secure RRUK delivery-address requests — implementation design

**Status: development-only foundation; no customer route deployed.**
See the tracked work in [issue #2](https://github.com/Taccountant2026/RRUK/issues/2).

## When this is needed
An order made through an older Shopify storefront may not have a native RRUK paid order record. Do not assume the newer checkout /order/[id] view belongs to that purchase. Confirm the original order details with the owner before issuing any request.

## Process
1. Owner privately confirms order identity and whether an address is already available through the original merchant order record. Avoid asking for an address again if not needed.
2. If necessary, owner creates a request using a privileged same-origin admin action, with a new opaque request ID, an owner-verified legacy order reference stored privately, and an expiry at most 72 hours ahead.
3. Server generates 32 cryptographically random bytes via `createSecureDeliveryToken`, stores only `hashSecureDeliveryToken(token)` in D1 and shows a one-time HTTPS link to the owner. Do not log the raw token.
4. Customer opens a no-index, no-referrer, HTTPS form. The token must never be sent to analytics, third parties, error monitoring or search indexing. Prefer moving the token out of the URL into a short-lived same-site HttpOnly Secure SameSite cookie on first GET, then immediately redirecting to a clean URL.
5. Customer submits only necessary UK recipient/address fields. `validateUkDeliveryAddress` performs preliminary checks. Enforce body limits, rate limits, same-origin/CSRF rules and no-store response headers. Reject expired, invalid, consumed and mismatched requests with a uniform message.
6. In **one atomic D1 transaction/conditional UPDATE**, consume the hashed token only when unused and unexpired and insert the encrypted address. Prevent two simultaneous requests from accepting two different addresses. Encrypt the payload with existing `encrypt` (AES-GCM / runtime STORE_SECRET), and never include it in a normal enquiry, email, analytics or a GitHub issue.
7. In the owner-only dashboard, mask by default and reveal only for authorised fulfilment. Record which owner used it and when, without logging address text. Notify the owner with a request reference, not the address.
8. Owner verifies the address against the private case, dispatches only the confirmed real order and adds tracking through the normal process. No automatic payment, paid-status or dispatch-state changes.
9. Define privacy notice and retention/deletion after fulfilment, subject to lawful recordkeeping. Maintain recovery procedures for secret rotation without losing encrypted address access.

## Required persistence and server work (not yet built)
- D1 table: delivery_address_requests (id, token_hash UNIQUE, original_order_link_privately, recipient_email_hash or verified channel, expires_at, used_at, status, address_ciphertext, created_at, updated_at, retained_until).
- Protected admin issue/read/revoke endpoints; customer GET/POST endpoints; CSRF and same-origin policy; fixed-body size, no cache, no referrer, rate-limited wrong tokens.
- Scheduled expiry/purge, minimum logs and owner-dashboard authorisation checks.
- Verify that no user is linked to a different order merely by knowing an email address.

## Verification before any live use
- Add integration tests for two concurrent redemption attempts; malformed/expired tokens; unauthorised admin access; cross-origin submissions; overlong/malicious addresses; encryption failures; alert deduplication; retention/purge; referrer/log leaks.
- Compare against *fresh deployed Sites source*, which may be ahead of GitHub. Do not overwrite live payments, checkout or the customer portal.
- Run local tests, typecheck, schema generation/migration dry-run and website acceptance tests. GitHub-hosted checks are currently blocked by an account-level billing issue.
- Owner approves release and performs an end-to-end harmless test before sending a real customer the link.

## Interim customer handling
Use a verified address from the original order platform if available. The current `/order-help` is a general enquiry form, not this one-time address facility. Do not promise that this secure link is operational until it has passed the checks above.
