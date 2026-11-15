# Bayanatk Concierge

A multilingual AI guest assistant and a direct-booking website kit for hotels in Madinah.
Guests ask questions in their own language (Arabic, English, Urdu, Indonesian, Turkish and more)
by web chat or WhatsApp. The AI answers from the hotel's own facts, turns service requests into
tasks for staff, and hands anything sensitive to a person. The hotel website (Arabic and English)
takes booking requests with no payment, straight to the staff inbox.

![Staff inbox](docs/screenshots/3-staff-inbox.png)

| Guest chat (phone) | Guest sees a staff reply |
|---|---|
| ![Guest chat](docs/screenshots/2-guest-chat.png) | ![Staff reply](docs/screenshots/4-guest-sees-staff.png) |

| Hotel website | Arabic, on a phone |
|---|---|
| ![Hotel website](docs/screenshots/5-website-en.png) | ![Arabic website on a phone](docs/screenshots/6-website-ar-phone.png) |

![Booking requests in the staff inbox](docs/screenshots/7-booking-requests.png)

## What it does

- **Guest chat** (`/h/<hotel>`): a mobile chat page a guest opens from a QR code in the room.
- **AI assistant**: answers only from the hotel's facts, replies in the guest's language,
  creates service requests (housekeeping, laundry, transport, late check-out, extra items),
  and escalates complaints, payments and booking changes to staff.
- **Staff inbox** (`/dashboard/<hotel>`): live conversations with language and status,
  staff replies (which take over from the AI), and a request board: New → In progress → Done.
- **WhatsApp channel** (`/api/whatsapp`): Meta Cloud API webhook with signature checks,
  duplicate protection and fast responses.
- **Hotel website** (`/site/<hotel>/en` and `/site/<hotel>/ar`): walk time to the Haram, rooms,
  offers, Umrah groups, location, facilities, FAQ and policies, with drawn illustrations (no photos
  needed), schema.org data and language links for search engines. Arabic pages are fully right-to-left.
- **Booking requests** (`/site/<hotel>/<lang>/book`): three short steps, no account, no card. Staff
  confirm or decline in the inbox and message the guest on WhatsApp.
- **Pilot report** in the staff inbox: chats answered by AI, chats passed to staff, staff reply time,
  requests, booking requests and guest languages. Printable for the hotel manager.
- **Privacy and limits**: bilingual privacy notice (`/h/<hotel>/privacy`), consent on the booking form,
  automatic deletion of old data, per-visitor rate limits and a daily AI message cap per guest.
- **Many hotels, one system**: every record belongs to a hotel; the database blocks
  cross-hotel access (tested).

## Quick start (demo mode, no keys needed)

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000, then:
1. Click **Open the guest chat** and try the sample questions.
2. In another tab, click **Open the staff inbox** to see conversations and requests appear.
3. Click **Open the sample website**, switch to العربية, and send a booking request.
   It appears under **Booking requests** in the staff inbox.

Demo mode uses a fictional hotel (Dar Al Noor), keeps data in memory, and replies with an
offline rule-based assistant. Nothing leaves your computer.

## Live mode

Copy `.env.example` to `.env.local` and fill in what you have. Each part switches on by itself:

| You set | What changes |
|---|---|
| `ANTHROPIC_API_KEY` | Real Claude answers any question, in any language, from the hotel facts |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Data is saved in your Supabase database |
| `WHATSAPP_*` | Guests can message the hotel's WhatsApp number |
| `STAFF_ACCESS_KEY` | Staff inbox only opens with `?key=<value>` (set this before any real pilot) |
| `PUBLIC_BASE_URL` | The public address, used for canonical and language links on hotel websites |
| `RATE_LIMIT_PER_MINUTE`, `MAX_GUEST_MESSAGES_PER_DAY` | Abuse and AI-cost limits (defaults 20 and 50) |
| `DATA_RETENTION_DAYS`, `BOOKING_RETENTION_DAYS` | Shown in the privacy notice (defaults 90 and 365) |

### Set up Supabase
1. Create a project at supabase.com.
2. In **SQL Editor**, run in this order: `supabase/migrations/0001_init.sql`,
   `supabase/migrations/0002_website_and_retention.sql`, `supabase/seed.sql`, `supabase/seed_site.sql`.
3. Copy the project URL and the **service role** key into `.env.local`.
   The service role key stays on the server; never put it in browser code.

### Set up WhatsApp
1. In Meta for Developers, create an app with the WhatsApp product.
2. Deploy this app (for example on Vercel) so it has a public HTTPS address.
3. Set the webhook URL to `https://<your-domain>/api/whatsapp`, with the same verify token
   as `WHATSAPP_VERIFY_TOKEN`, and subscribe to `messages`.
4. Fill in `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
   and `WHATSAPP_HOTEL_SLUG`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the app for development |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | All tests: assistant logic, WhatsApp security, languages, database isolation |
| `npm run typecheck` | TypeScript checks |
| `npm run cf:build` | Build for Cloudflare Workers (production) |
| `npm run seed:site` | Regenerate `supabase/seed_site.sql` after editing `src/data/demo-site.ts` |

## Deploying

The app deploys to Cloudflare Workers at `demo.bayanatk.com`, redeploying on every push to GitHub.
Step by step: [docs/DEPLOY.md](docs/DEPLOY.md). Try the Cloudflare build locally with `npm run cf:preview`.

## Adding a new hotel (pilot)

1. Insert a row in `hotels` with a unique `slug` (e.g. `al-noor-madinah`).
2. Add its facts to `knowledge_items`: check-in times, distance to the Haram, prices, services.
   The AI will only say what is written here.
3. For a website, insert a row in `hotel_sites` with the hotel's content as JSON. The shape is
   `src/lib/site/schema.ts`; `src/data/demo-site.ts` is a complete example. Invalid content is
   refused (logged), never shown half-broken.
4. Share `https://<your-domain>/h/<slug>` as a QR code in rooms, the website at
   `https://<your-domain>/site/<slug>`, and give staff
   `https://<your-domain>/dashboard/<slug>?key=<STAFF_ACCESS_KEY>`.

Before a real hotel goes live, go through [docs/PILOT.md](docs/PILOT.md).

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/ROADMAP.md](docs/ROADMAP.md) ·
working rules for AI coding tools: [CLAUDE.md](CLAUDE.md).

---
Built by Bayanatk · bayanatk.com
