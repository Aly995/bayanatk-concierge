# Project Facts

Canonical facts about the stack, links, accounts, commands and settings.
Secrets never appear here: setting names only.

## Stack (versions pinned in package.json)

| Part | Choice |
|------|--------|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`) |
| Fonts | Plus Jakarta Sans, Fraunces (Latin headings), IBM Plex Sans Arabic, Amiri (Arabic headings), Noto Nastaliq Urdu; all self-hosted via fontsource |
| Database | Supabase (Postgres with row level security) |
| AI | Claude via the Anthropic SDK (`src/lib/ai/claude.ts`); offline mock when no key |
| Validation | zod |
| Tests | Vitest; database tests run on PGlite (Postgres in memory) |
| Hosting | Cloudflare Workers through OpenNext (`@opennextjs/cloudflare`) |

## Links

| What | Where |
|------|-------|
| Live demo | https://demo.bayanatk.com |
| Guest chat (demo hotel) | https://demo.bayanatk.com/h/demo-madinah |
| Staff inbox (demo hotel, open to all) | https://demo.bayanatk.com/dashboard/demo-madinah |
| Hotel website (demo hotel) | https://demo.bayanatk.com/site/demo-madinah |
| Code | https://github.com/Aly995/bayanatk-concierge (public) |
| Portfolio section linking here | bayanatk.com homepage, repo Aly995/Bayanatk |
| Supabase project | `doqjjumwpsgrihdfmwbx` ("Hotel proposal") |
| Cloudflare Worker | `bayanatk-concierge`, custom domain demo.bayanatk.com |

## Deploy

Every push to `main` builds and deploys automatically (Cloudflare Workers Builds).
Build command `npx opennextjs-cloudflare build`, deploy command
`npx opennextjs-cloudflare deploy`. Step-by-step setup: `docs/DEPLOY.md`.

## Settings

Plain settings live in `wrangler.jsonc` `vars`; secrets are added in the Cloudflare
dashboard (Worker, Settings, Variables and Secrets). Only `src/lib/config.ts` reads them.

| Setting | Kind | Purpose |
|---------|------|---------|
| `SUPABASE_URL` | var | Database address |
| `SUPABASE_SERVICE_ROLE_KEY` | secret | Server access to the database |
| `STAFF_ACCESS_KEY` | secret | Opens staff inboxes of real hotels (`?key=`) |
| `ANTHROPIC_API_KEY` | secret, not set yet | Real AI replies; without it, demo replies |
| `PUBLIC_DEMO_HOTEL_SLUG` | var | Hotel whose inbox is open to everyone (`demo-madinah`) |
| `PUBLIC_BASE_URL` | var | Canonical and language links on hotel websites |
| `WHATSAPP_*` | secrets | WhatsApp Cloud API (not connected yet) |
| `RATE_LIMIT_PER_MINUTE`, `MAX_GUEST_MESSAGES_PER_DAY` | optional | Limits (defaults 20, 50) |
| `DATA_RETENTION_DAYS`, `BOOKING_RETENTION_DAYS` | optional | Shown in the privacy notice (90, 365) |

Full list with comments: `.env.example`.

## Running jobs and rules

| What | Where | Schedule or limit |
|------|-------|-------------------|
| Delete old guest data | Supabase Cron job `purge-guest-data` | Daily 03:15 UTC, `purge_old_guest_data(90, 365)` |
| Flood limit | Cloudflare rate limiting rule "Hotel demo API flood limit" | 20 requests per 10 s per IP on `/api/hotels/*` |

## Commands

| Command | Does |
|---------|------|
| `npm run dev` | Local app at http://localhost:3000 (demo mode without keys) |
| `npm test` | All tests, including database isolation |
| `npm run typecheck` | TypeScript checks |
| `npm run build` | Production build |
| `npm run cf:build` | Cloudflare build (run before pushing big changes) |
| `npm run cf:preview` | Run the Cloudflare build locally |
| `npm run seed:site` | Regenerate `supabase/seed_site.sql` from `src/data/demo-site.ts` |

## Demo and live mode

Without Supabase settings the app uses an in-memory store (`MemoryStore`) and the
demo hotel. With them it uses `SupabaseStore`. Without an Anthropic key it uses the
offline mock for replies. Both modes must keep working (rule 5 in `CLAUDE.md`).
