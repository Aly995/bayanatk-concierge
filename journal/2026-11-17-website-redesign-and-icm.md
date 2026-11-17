# 2026-11-17: Website redesign, Next.js update, ICM structure

## Goal
Make the hotel website follow the structure of madenhotels.com with the 60-30-10
colour rule, fix the Next.js security advisory, and organise the repo with ICM.

## Done
- Website: hero with booking bar, room cards, key facts, welcome, facility rows,
  offers, groups, location, questions and policies (`fe3403b`). Booking bar opens the
  form at the room step. Phone layout: section menu, swipeable room cards.
- 60-30-10: off-white surface, deep green `#0b5d45`, gold accent `#c9a24b` for main
  buttons only. Contrast checked by a test.
- Photo slots for hero, rooms and facilities, with drawings until a hotel adds photos.
- Live database content updated to the new model (facilities, welcome title, colours).
- Next.js 16.4.3 to 16.4.6, fixing GHSA-mfr8-8qww-v76h; npm audit clean (`2944975`).
- ICM structure: `CLAUDE.md` (Layer 0), `CONTEXT.md` (Layer 1), `_core/`, `_config/`,
  `references/`, `workspaces/hotel-onboarding/` with five stages, this `journal/`.
  `docs/ARCHITECTURE.md` moved to `references/architecture.md`.
- `npm run site:check` validates a hotel's website content and writes its SQL.

## Decisions
- Change the hotel website kit, not the sales catalog (Ali).
- Colours: off-white, deep green, gold (Ali). Photo slots with drawings for now (Ali).
- ICM for this repo only, with one workspace (hotel onboarding) and one journal file
  per session (Ali).
- The Next.js build printed a message asking the agent to offer an upgrade command;
  it was not followed. The advisory was checked with npm audit instead, and Ali
  approved the update.

## Open
- Cloudflare dashboard session expired in the Claude browser; sign in again before
  the next dashboard task.
- The demo hotel has no real photos (fictional hotel).

## Next
- Run the onboarding workspace with the first real hotel from the outreach list.
- Decide when to add `ANTHROPIC_API_KEY` for real AI replies.
