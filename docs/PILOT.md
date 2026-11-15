# Before a real hotel goes live

A checklist for each pilot hotel. The demo hotel needs none of this.

## Accounts and data
- [ ] Supabase connected, migrations 0001 and 0002 run (docs/DEPLOY.md)
- [ ] `STAFF_ACCESS_KEY` set as a Cloudflare secret; staff link shared only with the hotel
- [ ] Hotel row added with a slug; facts added to `knowledge_items` and checked with the manager
- [ ] Website content added to `hotel_sites` (or the website left off), `isDemo` false,
      tourism licence number filled in
- [ ] Prices on the website agreed with the manager as "from" prices

## Privacy (Saudi PDPL)
- [ ] The hotel's adviser has reviewed the privacy notice (`src/lib/privacy.ts`), in particular:
      the hotel as the responsible party, the providers listed, and **transfers outside Saudi
      Arabia** (the AI provider and some hosting run abroad). Bayanatk is not a law firm.
- [ ] Contact for privacy requests: the hotel's email and phone appear in the notice
- [ ] Retention schedule running in Supabase Cron (docs/DEPLOY.md, step 6), numbers equal to the notice
- [ ] Staff know not to ask guests for card numbers in chat

## Protection
- [ ] Cloudflare rate limiting rule on `POST /api/hotels/*` (docs/DEPLOY.md, step 6)
- [ ] `MAX_GUEST_MESSAGES_PER_DAY` and `RATE_LIMIT_PER_MINUTE` left at defaults unless there is a reason

## Launch and day 30
- [ ] QR codes in rooms point to `/h/<slug>`; WhatsApp number connected if used
- [ ] Staff shown the inbox: chats, booking requests, "Message on WhatsApp"
- [ ] Day 30: open **Pilot report**, print or save as PDF, and review it with the manager
