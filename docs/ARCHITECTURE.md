# Architecture

## The flow of one guest message

```
Guest (web chat or WhatsApp)
        │
        ▼
API route  ── /api/hotels/[slug]/chat   or   /api/whatsapp
        │       (validates input; WhatsApp: checks Meta signature, answers 200 fast)
        ▼
handleGuestMessage()            src/lib/assistant.ts   ← the single entry point
        │  1. find or create the conversation (per hotel + channel + guest)
        │  2. save the guest message, detect language
        │  3. if staff have taken over: stop here
        │  4. build the system prompt from the hotel's facts
        │  5. ask the AI provider; run any tools it calls
        │  6. save the reply
        ▼
AIProvider ── ClaudeProvider (real) | MockProvider (offline demo)
        │      tools: create_service_request, escalate_to_staff (validated with zod)
        ▼
Store ── MemoryStore (demo, tests) | SupabaseStore (production)
```

## Layers and their rules

| Layer | Folder | Rule |
|---|---|---|
| Domain types | `src/lib/types.ts` | No framework imports. Everything else depends on these. |
| Config | `src/lib/config.ts` | The only place that reads `process.env`. Validated with zod. |
| Data | `src/lib/store/` | All reads and writes go through the `Store` interface. Every tenant method takes `hotelId`. |
| AI | `src/lib/ai/` | Vendor SDKs are imported only inside a provider. Tool inputs are validated before anything runs. |
| Channels | `src/lib/channels/` | One file per channel. Pure helpers (parse, verify, send) so they are easy to test. |
| Orchestration | `src/lib/assistant.ts` | Channel-independent. Web chat and WhatsApp call the same function. |
| HTTP | `src/app/api/` | Thin: parse input, call the library, return JSON. Errors go through `route()` in `src/lib/http.ts`. |
| UI | `src/app/`, `src/components/` | Server pages load the hotel; client components handle chat and inbox. |

## Multi-tenancy (many hotels)

- Every table except `hotels` and `processed_external_messages` has `hotel_id`.
- The app server filters every query by `hotel_id` (defence in depth).
- Row level security in PostgreSQL limits staff logins to hotels they belong to
  (`hotel_members` + `is_hotel_member()`), and column grants stop staff moving rows between
  hotels. `tests/rls.test.ts` runs the real migration and proves this.

## Extending it

- **New AI vendor**: add a class implementing `AIProvider` and choose it in `src/lib/ai/index.ts`.
- **New channel** (Instagram, SMS, Telegram): add `src/lib/channels/<name>.ts` and an API route
  that calls `handleGuestMessage()`.
- **New tool** (e.g. book a Ziyarah tour): add its zod schema and definition in `src/lib/ai/tools.ts`,
  handle it in `executeTool` in `src/lib/assistant.ts`, and add a test.
- **New data backend**: implement `Store`.
