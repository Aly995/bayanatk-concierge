# CLAUDE.md: working rules for this project

Read this first when working on Bayanatk Concierge with an AI coding tool.

## What this is
A multilingual AI guest assistant for hotels in Madinah: guest chat, staff inbox, WhatsApp.
Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase + Claude.
Architecture: `docs/ARCHITECTURE.md`. Plans: `docs/ROADMAP.md`.

## Rules
1. **Keep the layers.** UI and routes call `src/lib/*`. Only `src/lib/config.ts` reads env vars.
   Only `src/lib/ai/claude.ts` imports the Anthropic SDK. Only `src/lib/store/supabase.ts`
   imports Supabase.
2. **Every data method takes `hotelId`.** Never write a query that can return another hotel's rows.
3. **Validate at the edges.** API bodies and AI tool inputs go through zod schemas.
4. **The AI says only what the hotel's facts say.** Don't add facts to prompts in code;
   add them to the hotel's knowledge items.
5. **Both demo and live mode must keep working.** Anything added to `Store` goes in
   both `MemoryStore` and `SupabaseStore`.
6. **Database changes are new migration files** (`supabase/migrations/0002_*.sql`), never
   edits to old ones. Enable RLS on new tables and add a test in `tests/rls.test.ts`.
7. **Arabic and RTL are first-class.** Use `dir="auto"` on user text; test with Arabic and Urdu.
8. **Pin dependency versions** (exact numbers in package.json).

## Definition of done
- `npm test` passes (assistant, WhatsApp, languages, database isolation)
- `npm run typecheck` passes
- `npm run build` passes, and `npm run cf:build` passes (Cloudflare Workers is the production host)
- New behaviour has a test
- README or docs updated if setup or behaviour changed

## Useful commands
```bash
npm run dev        # http://localhost:3000
npm test
npm run typecheck
npm run build
```
