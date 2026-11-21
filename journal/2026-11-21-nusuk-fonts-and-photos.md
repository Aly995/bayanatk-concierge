# 2026-11-21: Nusuk fonts and the first real photos

## Goal
Replace the drawings with Ali's stock photos and switch the website fonts to match the Nusuk app.

## Done
- Fonts: IBM Plex Sans Arabic for everything (Arabic and English, headings and body), the
  typeface nusuk.sa uses (checked its stylesheets: Plex in weights 300 to 700; headings
  semibold). Removed Fraunces, Amiri and Plus Jakarta Sans. Urdu keeps Noto Nastaliq Urdu.
  The staff inbox and guest chat use the same font.
- Photos (optimised to WebP 640/1280/1920):
  - Hero: the Green Dome through an eight-pointed star window (`haram-green-dome-star`).
  - Haram View Double: the Prophet's Mosque at dusk (`haram-dusk-panorama`), focus on the dome.
  - Accessible Double: room with two beds (`room-two-beds`), gentle white-balance fix.
- Hero photo now shows in the arched window (no longer full-bleed), so it never sits under the
  headline in English or Arabic.
- Photo schema: optional `focus` point for crops. Test added.
- `public/images/originals/` is git-ignored; only WebP files are committed.

## Decisions
- Ali chose the star-window photo for the hero (option A) and approved the colour fix.
- Nusuk's display face "Saud Hajj" is private, so only IBM Plex Sans Arabic is used.
- The quad room photo supplied was an iStock preview with the watermark and ID: not used.

## Open
- Quad Room and Family Suite still show drawings: need licensed photos (the iStock image
  needs buying; the clean download can then be added).
- Keep a record of where each photo came from and its licence.

## Next
- Add the remaining room and facility photos when Ali has them.
