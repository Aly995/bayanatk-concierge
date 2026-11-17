# Bayanatk Concierge

Layer 0 orientation. Read this first, then route to the one file you need.

A multilingual AI guest assistant and a direct-booking website kit for hotels in
Madinah: guest chat (web and WhatsApp), staff inbox with booking requests and a
pilot report, and an Arabic and English hotel website. Sold free-first: a free
30-day pilot, then a paid package. Next.js 16 (App Router), TypeScript, Tailwind v4,
Supabase, Claude, deployed to Cloudflare Workers at demo.bayanatk.com.

This project uses the Interpretable Context Methodology (ICM): the folder
structure is the workflow. Load only what the task needs.

## Folder Map

```
bayanatk-concierge/
├── CLAUDE.md          (you are here, Layer 0)
├── CONTEXT.md         (Layer 1: task routing, start work here)
├── _core/             (the ICM method itself: CONVENTIONS.md)
├── _config/           (shared settings: voice, Arabic and English glossary)
├── references/        (Layer 3: canonical facts about the codebase)
├── workspaces/        (multi-stage pipelines, numbered stages)
│   └── hotel-onboarding/   (new hotel to live pilot to day-30 report)
├── journal/           (one dated file per working session)
├── docs/              (guides for people: deploy, pilot, roadmap, backlog)
├── src/ tests/ supabase/ scripts/   (application code, tests, database)
```

## Routing

| You want to... | Go to |
|----------------|-------|
| Know where to work for a code task | `CONTEXT.md` |
| Know stack, links, commands, settings | `references/project-facts.md` |
| Understand how a message flows, layers | `references/architecture.md` |
| Work with tables, security rules, content | `references/data-model.md` |
| Follow code style, testing, Arabic/RTL | `references/code-standards.md` |
| Change how hotel websites look | `references/design-system.md` |
| Bring a new hotel onto the system | `workspaces/hotel-onboarding/CONTEXT.md` |
| See what happened last and what is next | newest file in `journal/` |
| Read the method | `_core/CONVENTIONS.md` |

## Rules (always on)

1. **Keep the layers.** UI and routes call `src/lib/*`. Only `src/lib/config.ts` reads env vars.
   Only `src/lib/ai/claude.ts` imports the Anthropic SDK. Only `src/lib/store/supabase.ts`
   imports Supabase.
2. **Every data method takes `hotelId`.** Never write a query that can return another hotel's rows.
3. **Validate at the edges.** API bodies and AI tool inputs go through zod schemas.
4. **The AI says only what the hotel's facts say.** Don't add facts to prompts in code;
   add them to the hotel's knowledge items.
5. **Both demo and live mode must keep working.** Anything added to `Store` goes in
   both `MemoryStore` and `SupabaseStore`.
6. **Database changes are new migration files** (`supabase/migrations/0003_*.sql` next), never
   edits to old ones. Enable RLS on new tables and add a test in `tests/rls.test.ts`.
7. **Arabic and RTL are first-class.** Use `dir="auto"` on user text; test with Arabic and Urdu.
   Website interface text goes in `src/lib/site/strings.ts` in both languages; use logical
   classes (`ms-`, `me-`, `start-`, `text-start`) so layouts mirror in Arabic.
8. **Pin dependency versions** (exact numbers in package.json).

## Definition of Done

- `npm test`, `npm run typecheck`, `npm run build` and `npm run cf:build` pass
- New behaviour has a test
- README, `references/` or `docs/` updated if setup or behaviour changed
- A journal entry for the session (see `journal/CONTEXT.md`)

## Triggers

| Keyword | Action |
|---------|--------|
| `status` | Read the newest journal entry and report open items |
| `setup` | Install dependencies and run the dev server (`references/project-facts.md`) |
| `onboard <hotel>` | Start `workspaces/hotel-onboarding/` at the first unfinished stage for that hotel |
| `journal` | Write today's journal entry from the session |
