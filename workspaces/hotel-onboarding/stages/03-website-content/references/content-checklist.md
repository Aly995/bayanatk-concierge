# Website Content Checklist

Field list: `references/data-model.md` (Hotel website content). This file covers how
to fill the fields well.

## Text

- `tagline`: the hero headline. Lead with the walk to the Haram if it is under 10
  minutes. Under 45 characters in English.
- `intro`: two sentences on what makes the stay easy. Used in the welcome section.
- `welcomeTitle`: "Welcome to <hotel short name>" / "أهلاً بكم في <الاسم>".
- `perks`: book-direct perks only (free pickup, late check-out, pay at hotel). Each must
  be an approved fact. Two to four.
- Rooms: description is one sentence; features are three short items.
- Offers: only offers the hotel confirmed, with validity and minimum nights.
- Facilities: four to six rows. Title under 45 characters, text under 200.
- FAQs: the five questions the front desk hears most (intake question 21).
- Times as 15:00. Prices as numbers in SAR in `fromPrice`.

## Colours (60-30-10)

1. If the hotel has brand colours: main colour = its darkest strong colour, accent =
   its lightest strong colour, surface = a very light neutral that suits both.
2. If not: propose three palettes from the hotel's building and logo, and let the hotel choose.
3. `site:check` must pass: white text on the main colour, ink on the accent, and
   main colour on the surface all at 4.5:1 or more. If the hotel's main colour is
   too light, use a darker shade of it.

## Photos

- Only photos the hotel owns or has rights to (intake question 25).
- HTTPS links. Host them on the hotel's own storage or ours; never hotlink another site.
- Hero: landscape, at least 1600px wide. Rooms: portrait 4:5, at least 800px wide.
  Facilities: landscape 16:10.
- Alt text says what is in the photo, in both languages: "Double room with a view of
  the Prophet's Mosque", not "room photo".
- No photo yet? Leave the slot out; the drawing shows instead.

## Before running site:check

- `isDemo` is false; `licence` is filled in.
- `contact.whatsapp` is the number guests should message, with country code.
- Every room id is lowercase with hyphens and stays the same forever (booking
  requests refer to it).
