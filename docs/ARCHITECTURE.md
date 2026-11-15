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
| Website kit | `src/lib/site/` | Content schema, loader, fixed interface text (`strings.ts`, English and Arabic), SEO and link helpers. |
| Booking | `src/lib/booking.ts` | Input schema and business rules shared by the browser form and the server. |
| Pilot | `src/lib/metrics.ts`, `src/lib/ratelimit.ts`, `src/lib/privacy.ts` | Pure functions: report numbers, rate limiting, privacy notice text. |
| UI | `src/app/`, `src/components/` | Server pages load the hotel; client components handle chat, inbox and the booking form. |

## Multi-tenancy (many hotels)

- Every table except `hotels` and `processed_external_messages` has `hotel_id`.
- The app server filters every query by `hotel_id` (defence in depth).
- Row level security in PostgreSQL limits staff logins to hotels they belong to
  (`hotel_members` + `is_hotel_member()`), and column grants stop staff moving rows between
  hotels. `tests/rls.test.ts` runs the real migration and proves this.

## Hotel websites

- **Content**: one JSON document per hotel in `hotel_sites`, validated by `hotelSiteSchema`
  (`src/lib/site/schema.ts`). Every visible text has `en` and `ar`. Copying, versioning or editing a
  whole site is one row. The demo hotel's content (`src/data/demo-site.ts`) is checked by a test to
  agree with the AI assistant's facts, so the website and the chat never contradict each other.
- **Two root layouts**: `src/app/(main)/` (app pages) and `src/app/(site)/site/[slug]/[lang]/`
  (hotel websites). The website layout sets `<html lang dir>` from the URL, so Arabic pages are
  truly right-to-left, and applies the hotel's brand colours as CSS variables (`bg-hotel`, `text-hotel-accent`).
- **Sections**: `src/components/site/HomeSections.tsx`, one component per section. A hotel's page is
  the list in `app/(site)/site/[slug]/[lang]/page.tsx`.
- **Booking requests**: `BookingForm` (browser) → `POST /api/hotels/<slug>/bookings` (rate-limited, zod) →
  `createBooking()` (rules, reference code) → `Store.createBookingRequest`. Staff change status with
  `PATCH /api/hotels/<slug>/bookings/<id>`. No payment is taken.

## Limits and data retention

- `enforceRateLimit()` (`src/lib/http.ts`) limits each visitor (IP) per minute on the chat and booking
  endpoints. It counts per Worker instance, so it is a first line; the hard limit is a Cloudflare rate
  limiting rule (docs/DEPLOY.md).
- `handleGuestMessage()` stops calling the AI after `MAX_GUEST_MESSAGES_PER_DAY` guest messages in one
  conversation in 24 hours, and hands the chat to staff. Counted from the database, so it holds across instances.
- `public.purge_old_guest_data()` (migration 0002) deletes old conversations, booking requests and
  de-duplication records. Run it daily with Supabase Cron.

## Extending it

- **New AI vendor**: add a class implementing `AIProvider` and choose it in `src/lib/ai/index.ts`.
- **New channel** (Instagram, SMS, Telegram): add `src/lib/channels/<name>.ts` and an API route
  that calls `handleGuestMessage()`.
- **New tool** (e.g. book a Ziyarah tour): add its zod schema and definition in `src/lib/ai/tools.ts`,
  handle it in `executeTool` in `src/lib/assistant.ts`, and add a test.
- **New data backend**: implement `Store`.
- **New website section**: add a component to `HomeSections.tsx`, any new content to `hotelSiteSchema`,
  its interface text to both languages in `strings.ts` (TypeScript refuses a missing Arabic key), and a test.
- **New website language** (e.g. Urdu): add it to `SITE_LANGUAGES` and `localized`, add its strings and
  direction in `strings.ts`.
