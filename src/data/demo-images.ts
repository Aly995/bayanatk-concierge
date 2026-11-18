import type { Photo } from "@/lib/site/schema";

/**
 * Photo config for the demo hotel: one place to swap the drawings for photos.
 *
 * To add a photo:
 *   1. Put the file in public/images/originals/ with the suggested name below,
 *      for example placeholder-room-haram-view.jpg.
 *   2. Run `npm run images:optimize` (makes 640, 1280 and 1920 px WebP versions).
 *   3. Replace `null` with `photo("placeholder-room-haram-view", { en: "...", ar: "..." })`.
 *   4. Run `npm run seed:site`, then load supabase/seed_site.sql in Supabase for the live site.
 * Anything left as `null` keeps its drawing. Use only photos you have the rights to.
 */
export const photo = (name: string, alt: Photo["alt"]): Photo => ({ src: `/images/${name}`, alt });

export const DEMO_IMAGES: {
  hero: Photo | null;
  rooms: Record<string, Photo | null>;
  facilities: Record<string, Photo | null>;
} = {
  // placeholder-hero-haram-dusk: landscape, 1920 px or wider; a window toward the Haram at dusk
  hero: null,
  rooms: {
    "haram-view-double": null, // placeholder-room-haram-view: portrait 4:5
    "family-suite": null, // placeholder-room-family-suite
    "quad-room": null, // placeholder-room-quad
    "accessible-double": null, // placeholder-room-accessible
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
