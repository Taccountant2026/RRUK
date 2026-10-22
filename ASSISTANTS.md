# Two sides of the business assistant

The website customer assistant and private owner assistant share only public business knowledge and brand identity. Their data and permissions are separate.

- The public widget accepts free text and guides a conversation using bounded, tested business-specific journeys. It stores a six-hour, per-tab conversation only after interaction. It never calls the owner endpoint. No external LLM provider receives the chat. `Forget this chat`, pause movement, reduced-motion support and dismissal remain available.
- Pixel uses the current public catalogue. Shortlists respect the visitor's platform, item-price budget and screen connection. Add-to-basket is an explicit visitor action, is revalidated, and passes through the existing ShopProvider. It never submits payment or claims held stock for sourced items.
- Alex checks routine remote suitability, offers only the verified services/prices, prepares quoted business enquiries and routes active incidents separately.
- Sprig collects a garden brief step by step and preserves the existing closed garden-shop checkout.
- `/api/assistant/owner` requires same-origin requests and verified owner identity on every call. It reads the dedicated business tools. Chatting is read-only; a reviewed proposal can save an internal reply/quote draft or a guarded progress update. Existing MCP tools and audit identities are preserved.
- There is no external mailbox/calendar synchronisation, payment action, general-purpose LLM, social posting or continuously running daemon added by this feature. The owner can open an addressed email draft and send it with their own email client.

Build: `node scripts/build-assistant.mjs`, then the standard Sites build. Tests: `npm test` and `npm run typecheck`. Visitor state is presentation data, never authority. Customer text is untrusted content, never tool instructions.
