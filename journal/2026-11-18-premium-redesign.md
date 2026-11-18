# 2026-11-18: Premium redesign of the demo hotel site and guest chat

## Goal
Make the Dar Al Noor demo feel premium, following Ali's design review (six priorities),
and fix the AI asking for a room number when a guest only asked about the airport transfer.

## Done
- Photo infrastructure: `/images/<name>` paths, `npm run images:optimize` (WebP at 640, 1280,
  1920 px), `SitePhoto` with `srcset`, `src/data/demo-images.ts` as the one place to swap in
  photos. Drawings stay until Ali picks stock images.
- Palette and type: ivory surface `#f7f3ec`, deep green, brass `#c9a45c` used sparingly;
  Fraunces and Amiri for headings, IBM Plex Sans Arabic for Arabic text, Noto Nastaliq Urdu
  for Urdu. Readex Pro removed. Spacing, radius and shadow tokens in `globals.css`.
- Reusable parts in `src/components/site/ui/`: GeometricPattern, SectionDivider, StatItem,
  ArchImageCard, DateRangePicker (Hijri dates, keyboard, right-to-left), SelectField,
  FloatingContactButton (WhatsApp + assistant in one round button), WalkMap, HotelMark, Icon.
- Home page: stats strip hanging over the hero edge, room cards with "From SAR ___ / night"
  and amenity icons, walk map labelled "5 min", guest ratings placeholder (demo only),
  footer with small map, WhatsApp link and language switch; scroll and hover motion only
  when the visitor allows motion.
- Guest chat: hotel colours and fonts, hotel mark avatar, bilingual welcome above starter
  chips, typing indicator, follow-up chips in the guest's language, icon Send button.
- AI: questions about a service get the facts first and an offer; the room number is asked
  only after a "yes" from a staying guest; arriving guests give flight details instead.
  Rule added to the system prompt and tool description. Fixed "card" matching "car".
- Tests: 82 pass (new: dates, chat chips, airport question in Arabic and English, images).

## Decisions
- Ali: keep the drawings for now (he will find stock images), guest ratings as a placeholder
  only (no invented numbers), no payment-method logos.
- Real hotels without ratings show no ratings section at all; the placeholder is demo-only.
- On phones the floating button appears after a short scroll, so it does not cover the
  booking bar on the first screen.
- The facts-first rule is a behaviour rule in the prompt; prices stay in the hotel's facts.

## Open
- Stock photos: Ali to choose; then add them to `public/images/originals/` and
  `src/data/demo-images.ts`.
- Real ratings: connect Google and Booking.com ratings when a real hotel joins (content
  field `ratings` is ready).
- The offline demo AI recognises a fixed set of topics; other questions go to staff.

## Next
- Ali reviews demo.bayanatk.com after this deploy.
- Swap in photos when chosen; rerun `npm run seed:site` and the SQL in Supabase.
- Hotel outreach with the redesigned demo.
