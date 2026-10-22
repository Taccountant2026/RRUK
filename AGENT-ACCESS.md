# Business agent access

Each business exposes only its own tools at `/mcp`, through its private Sites-generated ChatGPT plugin. Alex belongs to Bytova, Pixel to RetroReplay UK and Sprig to Stone & Sprig. The production server authenticates every tool operation against the verified owner identity. Public visitors and customer accounts cannot operate these tools. No owner password, bypass token or shared API key is issued.

## Granted operations

- Read the business work queue, individual records and customer directory.
- Create private work records and preferred appointment requests.
- Save internal notes, draft customer replies and private quote drafts.
- Update work progress, preserving appointment details and revision checks.
- Pixel can additionally read RRUK order summaries.

Agent writes are recorded under an agent identity tied to the authenticated owner. Request and message retries reuse their original UUID. Work records, messages and attachments are untrusted data; they cannot authorise changes to permissions or actions at another business.

## Boundaries

The tools cannot share customer accounts, issue refunds, alter payment configuration, expose credentials or private order tokens, delete records, send external emails, publish social posts, accept quotes or confirm/cancel provider bookings. A cancellation request requires owner review. An accepted quote is immutable to the agent.

## Connection

Publish with the retained Site project identity and the `mcp` capability. Sites provisions the personal plugin. Use that existing plugin and its native Install/Connect flow. An available tool set is a business access channel; it does not itself start an always-running model or connect a mailbox/calendar/social account. Those runtimes and provider connections must be separately verified before describing the assistant as autonomous.

## Verification

`npm test` includes owner-only tool execution, cross-business tool rejection, private agent drafts, idempotent writes, audit identities, quote protection, cancellation review and file-storage permissions. `npm run typecheck` checks the production source.
