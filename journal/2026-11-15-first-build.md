# 2026-11-15: First build

Written on 2026-11-17 from the session record and git history.

## Goal
Build a working proof of the hotel offer: an AI guest assistant for Madinah hotels,
plus the website kit, ready for a free 30-day pilot.

## Done
- v0.1: guest chat, staff inbox, service requests, hand-over to staff, WhatsApp
  webhook, Supabase schema with row level security, Cloudflare config (`6f8dade`).
- Pilot readiness: per-visitor rate limits, daily AI message cap per guest, pilot
  report, bilingual privacy notice, retention function.
- Website kit phases 1 to 3: content model, Arabic and English sample site, booking
  requests with a staff board (both in `c4ea73e`).

## Decisions
- Stack: Next.js, Supabase, Claude, hosted on Cloudflare Workers (Ali).
- Demo mode works with no keys: in-memory store and offline replies.
- Website: drawn illustrations instead of photos, booking requests with no payment,
  Arabic and English only for now (Ali chose the defaults offered).
- Facts on the website must match the AI's facts; a test enforces it.

## Open
- Privacy notice needs review by each hotel's adviser before a real pilot
  (transfers outside Saudi Arabia).

## Next
- Push to GitHub, set up Supabase and the Cloudflare Worker (needs Ali's accounts).
