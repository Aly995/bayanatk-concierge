# Roadmap

## Done (v0.1, proof of work)
- Guest web chat, staff inbox, request board
- Claude provider with tools; offline demo provider
- WhatsApp Cloud API webhook (signature check, de-duplication, background processing)
- Supabase schema with row level security, tested
- Demo mode that runs with no keys

## Done (v0.2, pilot-ready and website kit)
- Pilot report in the staff inbox (AI-handled share, escalations, staff reply time, requests,
  booking requests, languages), printable
- Rate limits per visitor on public endpoints, and a daily AI message cap per guest
- Bilingual privacy notice, consent on the booking form, retention function for old data
- Hotel website kit: content model (`hotel_sites`), Arabic/English pages with real RTL,
  sample site, three-step booking requests, bookings board for staff

## Before the first real hotel pilot
1. **Staff login with Supabase Auth.** Replace `STAFF_ACCESS_KEY` with real accounts
   (magic link). The `hotel_members` table and RLS policies are already in place.
2. **Knowledge and website editor** in the dashboard, so the hotel updates its own facts and pages.
3. Everything in [PILOT.md](PILOT.md): legal review of the privacy notice, retention schedule,
   Cloudflare rate limiting rule.

## Next
- Real-time updates (Supabase Realtime) instead of polling
- QR code generator per room
- WhatsApp message templates for replies after the 24-hour window
- Knowledge search (embeddings) for hotels with long fact lists
- Arabic interface for the staff inbox
- Reports: busiest hours, top questions
- Website kit features from the brands comparison: [WEBSITE_KIT_BACKLOG.md](WEBSITE_KIT_BACKLOG.md)
- Hotels on their own domain (custom hostnames) instead of `/site/<hotel>`
