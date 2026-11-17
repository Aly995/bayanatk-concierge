# Design System (hotel websites)

How hotel websites look. Code: `src/components/site/`, tokens in `src/app/globals.css`,
colours per hotel in `hotel_sites.content.brand`.

## Colour: 60-30-10

Each hotel sets four colours. Tailwind names in brackets.

| Share | Role | Token | Used for |
|-------|------|-------|----------|
| about 60% | Surface | `brand.surface` (`bg-hotel-surface`) | Page background, quiet panels |
| about 30% | Main colour | `brand.primary` (`bg-hotel`, `text-hotel`) | Header, hero, headings, groups band, footer, outline buttons |
| about 10% | Accent | `brand.accent` (`bg-hotel-accent`) | Main action buttons, small rules and check marks only |
| text | Ink | `brand.ink` (`text-hotel-ink`) | Body text, text on accent buttons |

Rules:
- White text on the main colour must reach 4.5:1; ink text on the accent too
  (`tests/website.test.ts` checks the demo hotel).
- Accent never carries white text and is never a large background.
- Cards are white on the surface colour.

Demo hotel: surface `#f6f7f4`, main `#0b5d45` (deep green), accent `#c9a24b` (gold),
ink `#12211e`.

## Type

Plus Jakarta Sans for Latin, Readex Pro for Arabic (self-hosted). Headings bold with
tight tracking; body 17px with relaxed line height; lines under about 75 characters.

## Shapes and drawings

- Signature shape: the arch (top corners fully rounded), from the gates and windows of
  Madinah. Used on the hero image and room images only.
- Drawings stand in for photos until a hotel adds its own (`src/components/site/Art.tsx`):
  the walk to the Haram (hero), the view from each room type, and each facility's icon
  on an eight-point-star pattern.
- Photos: HTTPS, alt text in both languages, landscape for hero and facilities,
  portrait (4:5) for rooms.

## Home page order

Modelled on established Madinah hotel sites:

1. Header on the main colour: hotel name, section links (Menu button on phones),
   language switch, Request a booking (accent)
2. Hero: headline, gate, book-direct perks, arched image
3. Booking bar overlapping the hero: dates, adults, children, Check availability.
   It opens the booking form at the room step.
4. Room cards (swipe row on phones), each with Request this room
5. Key facts: walk minutes, gate, airport distance, WhatsApp 24/7. Real facts only.
6. Welcome: heading and intro, centred
7. Facilities: alternating image and text rows
8. Offers, then the Umrah groups band (main colour)
9. Location, then questions with policies beside them
10. Footer on the main colour

Floating buttons: Ask us anything (AI chat in a panel) and WhatsApp; on phones a
bottom bar with Ask us, WhatsApp and Book.

## Motion

One moment only: the walking route draws itself once on load, skipped when the visitor
prefers less motion. Interaction feedback (menus, questions opening) is allowed.
