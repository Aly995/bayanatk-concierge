# Data Model

Canonical facts about tables, security rules, the `Store` interface and the hotel
website content model. Code: `supabase/migrations/`, `src/lib/store/`, `src/lib/types.ts`,
`src/lib/site/schema.ts`.

## Tables

| Table | Migration | Holds |
|-------|-----------|-------|
| `hotels` | 0001 | One row per hotel: slug, English and Arabic name, city |
| `hotel_members` | 0001 | Which signed-in users belong to which hotel (for staff logins) |
| `knowledge_items` | 0001 | The hotel's facts the AI may use: `topic`, `content` (max 2000 chars) |
| `conversations` | 0001 | One per guest chat: channel (web or WhatsApp), language, status |
| `messages` | 0001 | Guest, assistant and staff messages |
| `service_requests` | 0001 | Housekeeping, laundry, maintenance, transport, late checkout, extra items, other |
| `processed_external_messages` | 0001 | WhatsApp message ids already handled (no double replies) |
| `hotel_sites` | 0002 | The hotel website: one validated JSON document per hotel |
| `booking_requests` | 0002 | Requests from the website form; reference `BK-XXXXXX`, status |

Function `purge_old_guest_data(retention_days, booking_retention_days)` (0002) deletes
old chats, booking requests and handled WhatsApp ids. Only the server can run it.

## Security (row level security)

- RLS is on for every table. A signed-in user sees only rows of hotels they belong to
  (`is_hotel_member(hotel_id)`).
- Staff can update only some columns (column grants), for example a booking's `status`,
  never its guest details or hotel.
- The app server uses the service role key and enforces `hotelId` in every query itself.
- `tests/rls.test.ts` proves isolation on a real Postgres (PGlite). Every new table gets
  a test there.

## Store interface (`src/lib/store/store.ts`)

Every method that touches hotel data takes `hotelId`. Two implementations:
`MemoryStore` (demo and tests) and `SupabaseStore` (live). Groups:

- Hotels: `getHotelBySlug`
- Conversations and messages: `getOrCreateConversation`, `getConversation`,
  `listConversations`, `updateConversation`, `addMessage`, `listMessages`
- Requests: `createRequest`, `listRequests`, `updateRequestStatus`
- WhatsApp de-duplication: `claimExternalMessage`
- Website: `getHotelSite`, `createBookingRequest`, `listBookingRequests`, `updateBookingStatus`

## Hotel website content (`hotel_sites.content`)

Validated by `hotelSiteSchema` on every read; invalid content is logged and the site
is not shown. Every visible text is `{ en, ar }`.

| Field | Contents |
|-------|----------|
| `brand` | `surface`, `primary`, `accent`, `ink` (60-30-10, see `design-system.md`) |
| `tagline`, `intro`, `welcomeTitle` | Hero headline, welcome text and its heading |
| `heroPhoto` | Optional photo (HTTPS, alt text in both languages) |
| `perks` | 1 to 6 book-direct perks |
| `location` | Walk minutes, gate, address, map point, airport and train distances |
| `rooms` | Id, name, description, size, max guests, beds, view, from price, features, accessible, optional photo |
| `offers` | Up to 10: title, description, validity, includes |
| `amenities` | Short labels (used in search engine data) |
| `facilities` | Up to 10 image and text rows: icon, title, text, optional photo |
| `faqs`, `policies`, `contact`, `licence`, `isDemo` | As named |

The demo hotel's content is `src/data/demo-site.ts`. After editing it, run
`npm run seed:site`; a test fails if `supabase/seed_site.sql` is out of date, and
another fails if the website states something the AI's facts do not.

## Booking requests

Input schema and rules: `src/lib/booking.ts` (shared by browser and server). Rules:
known room, check-out after check-in, check-in not in the past (Saudi date), at most
30 nights, party fits the room unless it is a group, group size given for groups,
consent ticked. No payment is taken.
