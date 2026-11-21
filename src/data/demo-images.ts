import type { Photo } from "@/lib/site/schema";

/**
 * Photo config for the demo hotel: one place to swap the drawings for photos.
 *
 * To add a photo:
 *   1. Put the file in public/images/originals/ with the suggested name below,
 *      for example placeholder-room-haram-view.jpg.
 *   2. Run `npm run images:optimize` (makes 640, 1280 and 1920 px WebP versions).
 *   3. Replace `null` with `photo("placeholder-room-haram-view", { en: "...", ar: "..." })`.
 *      Add a focus point (`{ x: 0-100, y: 0-100 }`, percent from left and top) when the
 *      subject is off-centre, so the arch and card crops keep it in view.
 *   4. Run `npm run seed:site`, then load supabase/seed_site.sql in Supabase for the live site.
 * Anything left as `null` keeps its drawing. Use only photos you have the rights to.
 */
export const photo = (name: string, alt: Photo["alt"], focus?: Photo["focus"]): Photo => ({
  src: `/images/${name}`,
  alt,
  ...(focus ? { focus } : {}),
});

/** The demo's photos, chosen by Ali (originals are kept outside git). */
const GREEN_DOME_STAR = photo("haram-green-dome-star", {
  en: "The Green Dome and a minaret of the Prophet's Mosque, seen through an eight-pointed star window",
  ar: "القبة الخضراء ومئذنة المسجد النبوي من خلال نافذة على شكل نجمة ثمانية",
});
const HARAM_DUSK = photo(
  "haram-dusk-panorama",
  {
    en: "The Prophet's Mosque at dusk: its minarets, the Green Dome and the hotels of the central area",
    ar: "المسجد النبوي عند الغروب: المآذن والقبة الخضراء وفنادق المنطقة المركزية",
  },
  // Keep the Green Dome (right side of the photo) in portrait crops.
  { x: 100, y: 50 },
);
// Colour-corrected copy of Ali's photo (gentle white balance; highlights left as they were).
const ROOM_TWO_BEDS = photo(
  "room-two-beds",
  {
    en: "Guest room with two beds, a dressing mirror, a desk, a wardrobe and a small fridge",
    ar: "غرفة بسريرين ومرآة ومكتب وخزانة وثلاجة صغيرة",
  },
  { x: 55, y: 50 },
);

export const DEMO_IMAGES: {
  hero: Photo | null;
  rooms: Record<string, Photo | null>;
  facilities: Record<string, Photo | null>;
} = {
  hero: GREEN_DOME_STAR,
  rooms: {
    "haram-view-double": HARAM_DUSK,
    "family-suite": null, // placeholder-room-family-suite
    // Waiting for a licensed photo (the one supplied was a watermarked iStock preview).
    "quad-room": null, // placeholder-room-quad
    "accessible-double": ROOM_TWO_BEDS,
  },
  facilities: {
    breakfast: null, // placeholder-facility-breakfast: landscape 16:10, the buffet
    haram: null, // placeholder-facility-zamzam: a Zamzam dispenser
    transfers: null, // placeholder-facility-transfer-car
    families: null, // placeholder-facility-family-suite
    accessible: null, // placeholder-facility-step-free
    laundry: null, // placeholder-facility-laundry
  },
};
