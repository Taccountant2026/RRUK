# RRUK transactional email

Open https://retroreplay.uk/admin#emails as the existing owner. Live checkout and the merchant connection are independent and must remain enabled as already configured.

## Complete the connection

1. Use an owner-controlled Resend account and verify a sender on retroreplay.uk or one of its subdomains. Follow the provider's exact sender-verification records; preserve the working website and mail DNS. Check its current plan and limits. No paid plan has been purchased here.
2. Create a sending-only key restricted to the verified RRUK domain. Enter it only in the protected Emails form, with the sender and your private alert address. The saved key is encrypted with the existing store secret and is never returned to the browser. Saving pauses email.
3. Send the form's test to your alert inbox. Provider acceptance is shown separately from actual inbox receipt. Check sender, reply address and junk folder. Confirm receipt and enable automatic email.
4. Future verified live purchases receive the full saved order and contract text with a private order link. Recorded dispatches and verified full refunds produce their matching messages. Owner alerts cover paid orders, payment/refund review and new enquiries, Console Hunts, contact messages or stories. Personal replies and moderation remain yours.

No past customer is automatically emailed on activation. No test-mode order is emailed. Private form submissions do not automatically email their unverified supplied address. No marketing subscription is created.

## Reliability and limits

Business-state writes and their queue inserts share a D1 batch. Notification inserts recheck the saved business state. Event keys are unique; payloads are immutable. An atomic lease prevents two workers claiming the same message. Resend receives the same idempotency key on every retry. Retries stop before 23 hours or after eight attempts, then require owner review; this stays within Resend's documented 24-hour idempotency window. Do not replace an uncertain message until checking the provider log.

Verified business-event requests trigger background processing; later store visits and the owner Process due messages button retry pending work. There is no unattended scheduled retry when the store receives no requests. An extended provider outage needs operator attention. Accepted means accepted by the sending API, not proof of inbox delivery or absence of a bounce. No provider delivery webhook is configured.

Changing connection identity pauses sending and holds pending work for review. An in-progress lease must finish before connection changes. Accepted message addresses/content are cleared during queue maintenance after 30 days; minimal unique identifiers remain to prevent late duplicate sends. Existing order/accounting retention is unchanged.

No real customer message, booking, charge or refund was created to test this implementation. Transport tests use injected responses and SQLite scenarios use the actual generated migrations.

## Setup discovery recorded

Stripe Projects' current catalogue lists Resend email under free/pro parent plans. Its provisioning preflight returned BROWSER_AUTH_REQUIRED. The exact returned message was:

> No Stripe session with a live-mode account is signed in. Rerun this same `stripe projects init` command without `--preflight`, keeping every other argument (such as `--from` or a project name) and including `--json --yes`. It returns `BROWSER_AUTH_REQUIRED` with `details.reason` `handoff_prepared`, an `onboarding_url`, a `browser_url` and a `verification_code`. Ask the user to open `onboarding_url` to create or choose their Stripe Projects account, then approve the sign-in at `browser_url` with the code. Once they have, run that command again. Do not run `stripe login` yourself.

The skill's preflight rule requires stopping that provisioning path for owner sign-in. No init retry, login, subscription or payment was performed. The secure owner setup above also supports an existing Resend sending account.

Primary implementation references:

- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/changelog/idempotency-keys
- https://resend.com/legal/privacy-policy
