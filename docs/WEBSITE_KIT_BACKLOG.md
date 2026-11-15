# Hotel Website Kit: feature backlog (for later)

Extra features suggested after comparing the website blueprint with Hilton, Marriott and Accor,
plus features specific to Madinah. The core kit (blueprint, sample site, booking requests) is built
(v0.2); these are the next layer. Items marked ◐ are partly covered by the core kit.

Each item lists: why it matters, what "done" means, what it needs, and rough effort
(S = under a day, M = 1-2 days, L = 3+ days).

Status key: ☐ not started · ◐ in progress · ☑ done

---

## A. From the big brands: high value, add first

### A1. Add-ons during booking ☐  · M
**Why:** Big brands upsell during booking; hotel sites see about 15% of guests take a small add-on.
**For Madinah:** airport transfer, Ziyarah tour, breakfast or suhoor, late checkout, extra bed.
**Done when:**
- Booking request has an optional add-ons step after room selection
- Hotel manages its add-ons (name AR/EN, price, per stay / per person / per night) in the dashboard
- Selected add-ons and total show in the confirmation and in the staff inbox
**Needs:** table `addons` (hotel_id, name_en, name_ar, price, unit, active); link table `booking_request_addons`
**Depends on:** booking requests (website plan phase 3)

### A2. Promo, corporate and agent codes ☐  · M
**Why:** Brands use codes for corporate and member rates. Umrah agents are a major source of bookings.
**Done when:**
- A guest or agent enters a code in the booking form; a valid code applies its discount or fixed rate
- Codes have: type (percent / fixed / agent rate), valid dates, usage limit, optional room types
- Staff see which code was used on each request; a report counts bookings per code
**Needs:** table `promo_codes`; validation in the booking API (zod), rate-limited to stop code guessing

### A3. Multi-currency display ☐  · S
**Why:** Guests come from Indonesia, Pakistan, India, Egypt, Turkey and beyond.
**Done when:**
- Prices always show in SAR, with an approximate amount in the guest's chosen currency (USD, IDR, PKR, INR, EGP, TRY, MYR)
- Choice remembered per visitor; rates refreshed daily from a free exchange-rate source
- Clear note: "Charged in SAR. Other currencies are approximate."
**Needs:** small rates cache (KV or a table) updated by a daily scheduled job

### A4. Manage my booking ☐  · M
**Why:** Every brand lets guests view and change bookings themselves, which cuts front-desk calls.
**Done when:**
- Guest enters booking reference + phone number to see their request
- Guest can cancel (per hotel policy) or ask for a change; staff see it in the inbox
- Lookup is rate-limited; reference numbers are not guessable
**Depends on:** booking requests

### A5. Pre-arrival and confirmation messages ☐  · M
**Why:** Brands send confirmation, pre-arrival and directions messages automatically.
**Done when:**
- On confirmation: WhatsApp (template message) and/or email with booking details
- 1-2 days before arrival: reminder with check-in time, walking route to the Haram gate and the hotel's WhatsApp
- Guest's language is used where a template exists
**Needs:** approved WhatsApp message templates (required outside the 24-hour window); scheduled job
**Depends on:** WhatsApp channel (already built), booking requests

### A6. Review request after the stay ☐  · S
**Why:** Fresh real reviews are the strongest trust signal, and feed the website's reviews section.
**Done when:** one message after checkout with a link to the hotel's Google review page; one message only, guest can opt out
**Depends on:** A5

### A7. Special requests and accessibility ◐  · S
**Already:** rooms can be marked accessible ("Step-free"), free-text special requests on the form, shown in the staff inbox.
**Why:** Many pilgrims are elderly or travel with family.
**Done when:**
- Booking form has checkboxes: wheelchair access, near the lift, low floor, elderly guest, connecting rooms, cot, plus free text
- Rooms can be marked as accessible; the website can filter for them
- Requests show clearly in the staff inbox

### A8. Privacy policy, cookie notice, terms ◐  · S
**Already:** bilingual privacy notice per hotel, consent checkbox, retention function. No cookies are used. Still to do: terms page, lawyer review.
**Why:** Required under Saudi Arabia's Personal Data Protection Law (PDPL) before collecting guest details.
**Done when:**
- Privacy policy and terms pages per hotel (AR/EN), based on a reviewed template
- Consent checkbox on forms that collect personal data
- Cookie notice only if non-essential cookies or trackers are used
- Data retention rule applied (for example, delete booking requests and chats after a set period)
**Note:** have the templates reviewed by a lawyer before a real hotel goes live.

### A9. Analytics and booking tracking ◐  · S
**Already:** the pilot report counts booking requests and confirmations. Still to do: visits and the funnel.
**Why:** Proves the website's value at the end of a pilot (visits, booking starts, completed requests).
**Done when:**
- Privacy-friendly analytics (for example Cloudflare Web Analytics, no cookies)
- Funnel events: viewed room → started booking → submitted request
- Simple monthly report in the dashboard: visits, requests, conversion rate, top rooms, top languages

---

## B. Specific to Madinah

### B1. Hijri dates in the date picker ☐  · S
**Why:** Guests plan around Ramadan, the last 10 nights and Hajj season.
**Done when:** the date picker shows the Hijri date under each Gregorian date; key periods (Ramadan, Eid, Hajj) are highlighted
**Needs:** `Intl.DateTimeFormat` with the `islamic-umalqura` calendar (no extra library)

### B2. Explore Madinah page ☐  · S
**Why:** Brands all have "explore the area"; for Madinah this is the Ziyarah sites.
**Done when:** a page (AR/EN) with Quba Mosque, Mount Uhud, Masjid al-Qiblatain and others, with the distance from the hotel, plus how to reach the Haramain train station and the airport
**Needs:** shared content for all Madinah hotels + per-hotel distances

### B3. Visa and Nusuk information ☐  · S
**Why:** Visitors often ask about Umrah visas and permits before booking.
**Done when:** an FAQ section that links to the official Nusuk and visa pages (no copied rules, since they change), with a "last checked" date

---

## C. Later, after the first pilots

### C1. Online check-in form ☐  · M
Guest sends arrival time and guest details before arrival, so the front desk is faster.
**Caution:** this collects identity details. Needs encryption, strict access, a short retention period and PDPL review before use.

### C2. Saudi payment methods ☐  · L
mada, Apple Pay and STC Pay through a Saudi payment gateway (for example Moyasar, HyperPay or Tap),
using the gateway's hosted payment page so card data never touches our servers.
**Depends on:** availability and rates (website plan, booking stage 2)

### C3. Lowest-price calendar ☐  · M
Calendar showing the lowest rate per day, like the big brands. Belongs with the availability stage.

### C4. Multi-hotel mode ☐  · L
One website listing several hotels of a group (for example Dar Al Eiman or Sedra International),
with search by dates across all of them.
**Needs:** a `hotel_groups` table; group-level branding; shared booking flow

### C5. Returning-guest offers ☐  · M
A light version of a loyalty programme: guests opt in to a WhatsApp list and get return-visit offers.
No points system.

### C6. Video or 360° room tours ☐  · S
Embedded video or 360° photos per room, loaded only when the guest taps them (keeps the site fast).

### C7. "Best rate guarantee" badge ☐  · S
Shown only if the hotel commits to matching lower prices found elsewhere. Off by default.

---

## Not planned (and why)
| Feature | Why not |
|---|---|
| Mobile app | The website can be added to the phone's home screen instead |
| Digital room key, choosing a room online | Needs integration with each hotel's door-lock system |
| Gift cards, sustainability pages, spa and events booking | Rarely relevant for these hotels |

---

## Suggested order
1. **First four:** A1 add-ons, A2 agent codes, A5 pre-arrival messages, A9 analytics
2. **With them, small and quick:** A3, A7, A8, B1, B2, B3
3. **Then:** A4, A6
4. **After pilots:** C1 to C7

Sources used for the comparison:
- Hilton, book direct benefits: https://www.hilton.com/en/p/book-direct/
- Hilton Honors app (digital check-in, digital key): https://www.hilton.com/en/hilton-honors/mobile-app/
- Accor member rates: https://all.accor.com/a/nl/offers/members-rate.html
- PriceLabs, hotel direct booking best practices: https://hotels.pricelabs.co/blog/hotel-direct-booking-websites/
