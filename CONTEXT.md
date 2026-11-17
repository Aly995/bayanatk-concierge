# Project Routing

Layer 1 routing for Bayanatk Concierge. It says where each concern lives and which
reference to load for a task. Keep it thin; detail lives in the files it points to.

## Start and end of a session

1. Read the newest file in `journal/` for open items and recent decisions.
2. Pick the row below that fits the task. Load only that reference.
3. At the end, write a journal entry (`journal/CONTEXT.md` says how).

## Where To Work

| Task | Load this reference | Code lives in |
|------|---------------------|---------------|
| Change what the AI says or does | `references/architecture.md` | `src/lib/assistant.ts`, `src/lib/ai/` |
| Add or change an API route | `references/architecture.md` | `src/app/api/`, `src/lib/http.ts` |
| Read or write data, add a Store method | `references/data-model.md` | `src/lib/store/` |
| Add a table, column or security rule | `references/data-model.md` | `supabase/migrations/`, `tests/rls.test.ts` |
| Change the hotel website layout or look | `references/design-system.md` | `src/components/site/`, `src/app/(site)/` |
| Change website text (both languages) | `references/code-standards.md` | `src/lib/site/strings.ts` |
| Change the website content model | `references/data-model.md` | `src/lib/site/schema.ts`, `src/data/demo-site.ts` |
| Change the booking form or rules | `references/data-model.md` | `src/lib/booking.ts`, `src/components/site/BookingForm.tsx` |
| Change the staff inbox or pilot report | `references/architecture.md` | `src/components/StaffInbox.tsx`, `src/components/inbox/`, `src/lib/metrics.ts` |
| Change the guest chat | `references/code-standards.md` | `src/components/GuestChat.tsx` |
| WhatsApp channel | `references/architecture.md` | `src/lib/channels/whatsapp.ts`, `src/app/api/whatsapp/` |
| Limits, privacy notice, retention | `references/architecture.md` | `src/lib/ratelimit.ts`, `src/lib/privacy.ts`, migration 0002 |
| Deploy, settings, accounts | `references/project-facts.md` | `wrangler.jsonc`, `docs/DEPLOY.md` |
| Bring a new hotel onto the system | `workspaces/hotel-onboarding/CONTEXT.md` | see that workspace |

## Canonical Sources

| Fact | Home |
|------|------|
| Stack, links, commands, settings, accounts | `references/project-facts.md` |
| Message flow, layers, limits | `references/architecture.md` |
| Tables, RLS, Store, website content model | `references/data-model.md` |
| Code style, testing, Arabic/RTL | `references/code-standards.md` |
| Website colours, type, shapes, section order | `references/design-system.md` |
| Writing voice for guests and hotels | `_config/voice.md` |
| Arabic and English terms | `_config/glossary.md` |
| Deploy steps, pilot checklist, roadmap | `docs/DEPLOY.md`, `docs/PILOT.md`, `docs/ROADMAP.md` |
| Feature ideas for the website kit | `docs/WEBSITE_KIT_BACKLOG.md` |
| What happened, when, and why | `journal/` |
| The ICM method | `_core/CONVENTIONS.md` |

## Working Rules

- Load the one or two references that fit the task. Do not read everything.
- Every fact has one home. If two files would state it, link to the home instead.
- Match existing patterns in the file you touch. When in doubt, read a sibling file.
- The rules and Definition of Done in `CLAUDE.md` always apply.
