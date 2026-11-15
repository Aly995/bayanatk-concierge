# Roadmap

## Done (v0.1, proof of work)
- Guest web chat, staff inbox, request board
- Claude provider with tools; offline demo provider
- WhatsApp Cloud API webhook (signature check, de-duplication, background processing)
- Supabase schema with row level security, tested
- Demo mode that runs with no keys

## Before the first real hotel pilot
1. **Staff login with Supabase Auth.** Replace `STAFF_ACCESS_KEY` with real accounts
   (magic link). The `hotel_members` table and RLS policies are already in place.
2. **Knowledge editor** in the dashboard, so the hotel updates its own facts.
3. **Pilot metrics**: messages answered by AI vs staff, requests completed, average response
   time. These numbers make the case for the paid package at the end of the 30 days.
4. **Rate limiting** on the guest chat endpoint (per session and per IP).
5. **Privacy notice** on the guest chat, and a data retention rule (e.g. delete chats after 90 days).

## Next
- Real-time updates (Supabase Realtime) instead of polling
- QR code generator per room
- WhatsApp message templates for replies after the 24-hour window
- Knowledge search (embeddings) for hotels with long fact lists
- Arabic interface for the staff inbox
- Reports: busiest hours, top questions, languages
