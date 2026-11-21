# Design System (hotel websites and guest chat)

How hotel websites and the guest chat look. Code: `src/components/site/` (sections) and
`src/components/site/ui/` (reusable parts). Tokens: `src/app/globals.css`. Colours per hotel:
`hotel_sites.content.brand`, applied by `src/lib/site/brand-style.ts`.

## Where the tokens live

| What | Where | Tailwind classes |
|------|-------|------------------|
| Hotel colours (4 per hotel) | `brand` in the hotel's site content; defaults in `globals.css` `@theme inline` | `bg-hotel-surface`, `bg-hotel-paper`, `bg-hotel`, `bg-hotel-deep`, `text-hotel-on-primary`, `bg-hotel-accent`, `text-hotel-ink` |
| Fonts | `globals.css` `@theme` (`--font-sans`, `--font-arabic`, `--font-urdu`, `--font-display`) | `font-sans`, `font-display` |
| Section spacing | `--spacing-section` (7rem), `--spacing-section-sm` (4.5rem) | `py-section`, `py-section-sm` |
| Corners | `--radius-card` (1rem), `--radius-control` (0.625rem), `--radius-arch` | `rounded-card`, `rounded-control`, `rounded-t-arch` |
| Shadows | `--shadow-card`, `--shadow-float` | `shadow-card`, `shadow-float` |
| Heading tracking | `--tracking-display` | `tracking-display` |

Change a token once in `globals.css` and every hotel follows. Change a hotel's colours in its
`brand` (then `npm run site:check` and `npm run seed:site`).

## Colour: 60-30-10

| Share | Role | Token | Used for |
|-------|------|-------|----------|
| about 60% | Surface (ivory) | `brand.surface` | Page background; sections alternate surface and white paper |
| about 30% | Main colour (deep green) | `brand.primary` | Header, hero, headings, groups band, footer (`hotel-deep`), buttons |
| about 10% | Accent (brass) | `brand.accent` | Main call to action, section dividers, check marks, small rules only |
| text | Ink | `brand.ink` | Body text, text on accent buttons |

Rules:
- White text on the main colour and ink text on the accent must reach 4.5:1
  (`npm run site:check`, `tests/website.test.ts`).
- Accent never carries white text and is never a large background.
- Demo hotel: surface `#f7f3ec`, main `#0b5d45`, accent `#c9a45c`, ink `#12211e`.

## Type

One typeface, as in the Nusuk app and nusuk.sa (Ministry of Hajj and Umrah): **IBM Plex Sans
Arabic**, self-hosted (fontsource, Open Font License). It has matching Latin letters, so Arabic
and English pages share one voice. No other font loads, so no browser fallback font shows.

| Use | Font | Weight |
|-----|------|--------|
| Section headings, room names, logo (`font-display`) | IBM Plex Sans Arabic | SemiBold 600 |
| Hero headline | IBM Plex Sans Arabic | Medium 500 (large size) |
| Body and interface (`font-sans`) | IBM Plex Sans Arabic | Regular 400, buttons 600 |
| Urdu text (`lang="ur"`) | Noto Nastaliq Urdu | 400 (Urdu readers expect Nastaliq) |

`font-display` stays a separate token so a hotel brand can give headings another face later.
Arabic headings are never letter-spaced (`--tracking-display` is 0 for `:lang(ar)`). Body 17px,
lines under about 75 characters. Nusuk's own display face ("Saud Hajj") is private and not used.

## Components (`src/components/site/ui/`)

| Component | What it does |
|-----------|--------------|
| `ArchImageCard` | Arch-framed photo (or drawing) with a brass inner line; gentle zoom and pattern on hover |
| `StatItem` | Icon, big value, short label (key facts strip) |
| `SectionDivider` | Brass lines with an eight-point star, above section headings |
| `GeometricPattern` | Eight-point-star lattice as an SVG background; `color`, `opacity`, `size` props |
| `FloatingContactButton` | One round button: WhatsApp and the AI assistant (chat in a panel). On phones it appears after a short scroll so it does not cover the booking bar |
| `DateRangePicker` | Check-in and check-out in one calendar, nights count, Hijri dates (Umm al-Qura), keyboard and right-to-left support |
| `SelectField` | Styled native select (adults, children) |
| `WalkMap` | Stylised map: hotel to gate to the Haram, labelled with the walk time |
| `HotelMark` | Arch-and-star mark for the assistant avatar until a hotel has a logo |
| `Icon` | Lucide line icons by meaning (`breakfast`, `walk`, `send`...); start/end chevrons flip in Arabic |
| `WhatsAppIcon` | Official WhatsApp glyph (Simple Icons, CC0) |

Date logic lives in `src/lib/site/dates.ts` (tested in `tests/dates.test.ts`).

## Home page order

1. Demo banner (demo hotel only), header on the main colour
2. Hero: headline, gate, book-direct perks, the hero photo (or drawing) in an arched window,
   the booking bar, then the key facts strip hanging over the hero's bottom edge
3. Rooms: arched cards with 3 to 4 amenity icons, "From SAR ___ / night" and Request this room
4. The walk to the Haram: address, train and airport, Google Maps link, walk map
5. Welcome (pattern watermark)
6. Facilities: icon cards, or alternating photo rows once every facility has a photo
7. Guest ratings: real ratings from `ratings` in the site content. The demo shows a labelled
   placeholder; real hotels without ratings show nothing. Never invent scores.
8. Offers, then the Umrah groups band
9. Questions with policies beside them
10. Footer (`hotel-deep`): name and address, contact with WhatsApp, small walk map, language
    switch. No payment-method logos.

## Photos

Drawings stand in until a hotel has photos. To add photos:

1. Put originals in `public/images/originals/` (for example `dar-al-noor-hero.jpg`).
2. Run `npm run images:optimize`: writes `public/images/<name>-640.webp`, `-1280.webp`,
   `-1920.webp`.
3. Point the content at `/images/<name>` (the demo uses `src/data/demo-images.ts`; real
   hotels set `heroPhoto` / `photo` in their site content). HTTPS URLs work too.
4. Give alt text in both languages. If the subject is off-centre, add a focus point
   (`focus: { x, y }`, percent from left and top) so the arch and card crops keep it in view.
5. Only licensed photos: never a watermarked stock preview. Originals stay out of git
   (`public/images/originals/` is ignored); only the WebP sizes are committed.

`SitePhoto` serves the right size with `srcset`; the hero loads first, others lazily.

## Guest chat (`/h/<slug>`, `src/components/GuestChat.tsx`)

- Uses the hotel's colours (the page sets the brand variables) and display font.
- Hotel mark avatar; a welcome message in English and Arabic above starter chips in five
  languages (each chip has `lang`, so Urdu uses Nastaliq).
- Typing indicator while a reply is on its way; follow-up chips in the guest's language
  after an answer, but not when the assistant is waiting for an answer (`src/lib/chat/chips.ts`).
- Send is an icon button; disabled state is a pale tint of the main colour.

## Motion

Only for visitors who have not asked for less motion (`prefers-reduced-motion`):
- the hero route draws itself once;
- sections fade up as they scroll into view, and the walk-map route moves (scroll-driven
  CSS, no JavaScript; older browsers show everything in place);
- room images zoom slightly on hover; the chat's typing dots rise in turn.
Interaction feedback (menus, calendar, questions opening) is always on.

## Reusing the design for another hotel

1. Follow `workspaces/hotel-onboarding/` to collect facts, colours and photos.
2. Write the hotel's site content (brand, rooms, facilities, offers, ratings if the hotel
   has real ones) and run `npm run site:check` (schema, unique ids, colour contrast).
3. Add photos as above, then `npm run seed:site` and run the SQL in Supabase.
The components read everything from the content and tokens; no component holds hotel facts.
