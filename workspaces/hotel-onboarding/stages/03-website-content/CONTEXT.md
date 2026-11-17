# Stage 03: Website Content

Write the hotel's website content as one JSON file, check it, and produce its SQL.

## Inputs

| Source | File/Location | Section/Scope | Why |
|--------|---------------|---------------|-----|
| Layer 4 | `workspaces/hotel-onboarding/stages/01-intake/output/<slug>-intake.md` | Sections B to G | Rooms, policies, offers, look |
| Layer 4 | `workspaces/hotel-onboarding/stages/02-facts/output/<slug>-facts.md` | All | The site may state only approved facts |
| Layer 3 | `workspaces/hotel-onboarding/stages/03-website-content/references/content-checklist.md` | All | Fields, writing rules, colours, photos |
| Layer 3 | `src/data/demo-site.ts` | All | A complete example of the shape |
| Layer 3 | `references/design-system.md` | Colour | The 60-30-10 rule |
| Layer 3 | `_config/voice.md`, `_config/glossary.md` | All | Tone and Arabic terms |

## Process

1. Copy the shape of `src/data/demo-site.ts` into `<slug>-site.json` (plain JSON).
2. Fill every field from the intake and approved facts, in English and Arabic.
   Write the Arabic as Arabic; do not translate word for word.
3. Choose the four colours (`content-checklist.md`, Colours). Set `isDemo` to false.
4. Add photo slots only for photos the hotel owns, with alt text in both languages.
5. Run `npm run site:check -- workspaces/hotel-onboarding/stages/03-website-content/output/<slug>-site.json`.
   Fix every problem it lists and run it again until it prints OK. It writes `<slug>-site.sql`.
6. Send the hotel a preview (run locally with the content loaded) and get approval.

## Outputs

| Artifact | Location | Format |
|----------|----------|--------|
| `<slug>-site.json` | `stages/03-website-content/output/` | JSON matching `hotelSiteSchema` |
| `<slug>-site.sql` | `stages/03-website-content/output/` | Written by `npm run site:check`, never by hand |

## Done when

`site:check` prints OK, every statement on the site matches an approved fact, and the
hotel has approved the preview.
