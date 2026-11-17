# Code Standards

How code is written here. The always-on rules and the Definition of Done are in
`CLAUDE.md`; this file adds the details.

## TypeScript

- Strict mode. No `any`; use `unknown` and narrow, or a zod schema.
- Types for data live in `src/lib/types.ts`; schemas next to the code that owns them
  (`src/lib/site/schema.ts`, `src/lib/booking.ts`).
- Small pure functions in `src/lib/` (easy to test); pages and components stay thin.

## Next.js

- App Router with two root layouts: `src/app/(main)/` (app pages) and
  `src/app/(site)/site/[slug]/[lang]/` (hotel websites, with `<html lang dir>`).
- Route params and search params are Promises in Next.js 16: `await ctx.params`.
- API routes use the `route()` wrapper, `parseBody()` with a zod schema, and
  `HttpError` for expected failures (`src/lib/http.ts`). Public POST routes call
  `enforceRateLimit()` first. Staff routes call `requireStaff()`.
- Server components by default; `"use client"` only for interaction (chat, inbox,
  booking form, chat launcher).

## Arabic and right to left

- User-written text gets `dir="auto"`. Phone numbers, emails and codes get `dir="ltr"`.
- Inside Arabic sentences, wrap left-to-right pieces with `ltr()` from `strings.ts`.
- Arabic counted nouns use `arCount()` (1, 2, 3 to 10, 11 and more take different forms).
- Use logical spacing and position classes (`ms-`, `pe-`, `start-`, `text-start`);
  flip direction-bound drawings with `rtl:-scale-x-100`.
- Website interface text: `src/lib/site/strings.ts`. TypeScript refuses a missing Arabic key.
- Terms: `_config/glossary.md`. Tone: `_config/voice.md`.

## Testing

| Test file | Covers |
|-----------|--------|
| `tests/assistant.test.ts` | AI replies, tools, hand-over to staff |
| `tests/whatsapp-i18n.test.ts` | WhatsApp webhook, signatures, languages |
| `tests/pilot.test.ts` | Rate limiter, daily cap, pilot metrics |
| `tests/website.test.ts` | Site content, booking rules, SEO helpers, contrast, seed sync |
| `tests/rls.test.ts` | Database isolation between hotels, retention function |

- New behaviour gets a test in the matching file, or a new file named for the area.
- Tests use `MemoryStore` and the mock AI: no network, no keys.

## Accessibility

- Every form field has a visible label; errors are linked with `aria-describedby`.
- Visible keyboard focus; motion only when the person has not asked for less.
- Text contrast at least 4.5:1 (a test checks the demo hotel's colours).

## Git

- Commit messages: a short summary line, then what changed and why.
- Commits made by an AI agent end with its attribution lines.
- Never commit `.env*` files with values, `.open-next/` or `.next/`.
