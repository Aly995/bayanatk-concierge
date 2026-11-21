# Hotel photos

1. Put original photos in `originals/` (JPG, PNG or WebP). Use lowercase names with
   hyphens, for example `placeholder-room-haram-view.jpg`.
2. Run `npm run images:optimize`. It writes `<name>-640.webp`, `<name>-1280.webp` and
   `<name>-1920.webp` here. Browsers pick the right size for the screen.
3. Use `/images/<name>` (no size, no extension) as the photo `src` in the hotel's content.
   For the demo hotel: `src/data/demo-images.ts`.

Sizes: hero and rooms show in portrait arches (5:6 and 4:5), at least 1280 px wide;
facilities landscape 16:10. Add a `focus` point in the content when the subject is off-centre.

Only photos the hotel owns or has a licence for; never a watermarked stock preview.
`originals/` is not committed to git (size and licences): keep the originals in the hotel's
own storage. The optimised WebP files here are committed.
