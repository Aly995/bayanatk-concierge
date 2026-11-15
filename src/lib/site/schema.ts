import { z } from "zod";

/**
 * The hotel website's content: one validated document per hotel.
 * Stored as JSON (table hotel_sites) so a hotel's whole site can be edited,
 * versioned and copied in one piece. Every visible text is bilingual.
 */

export const SITE_LANGUAGES = ["en", "ar"] as const;
export type SiteLanguage = (typeof SITE_LANGUAGES)[number];

export const localized = z.object({
  en: z.string().min(1).max(2000),
  ar: z.string().min(1).max(2000),
});
export type Localized = z.infer<typeof localized>;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const AMENITY_ICONS = [
  "wifi", "breakfast", "prayer", "zamzam", "laundry", "shuttle", "family", "accessible", "concierge", "parking",
] as const;

export const roomSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  name: localized,
  description: localized,
  sizeSqm: z.number().int().positive().max(500),
  maxGuests: z.number().int().min(1).max(12),
  beds: localized,
  view: z.enum(["haram", "city", "courtyard"]),
  /** Starting price per night in SAR, before tax. */
  fromPrice: z.number().int().positive(),
  features: z.array(localized).max(8),
  accessible: z.boolean().default(false),
});
export type Room = z.infer<typeof roomSchema>;

export const offerSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  title: localized,
  description: localized,
  validity: localized,
  includes: z.array(localized).max(6),
});
export type Offer = z.infer<typeof offerSchema>;

export const hotelSiteSchema = z.object({
  brand: z.object({ primary: hexColor, accent: hexColor, ink: hexColor }),
  tagline: localized,
  intro: localized,
  /** Reasons to book direct: perks the hotel controls (not a lower price than OTAs). */
  perks: z.array(localized).min(1).max(6),
  location: z.object({
    walkMinutesToHaram: z.number().int().min(0).max(120),
    gate: localized,
    address: localized,
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    airportKm: z.number().positive(),
    trainStationKm: z.number().positive(),
  }),
  rooms: z.array(roomSchema).min(1).max(30),
  offers: z.array(offerSchema).max(10),
  amenities: z.array(z.object({ icon: z.enum(AMENITY_ICONS), label: localized })).max(16),
  faqs: z.array(z.object({ q: localized, a: localized })).max(30),
  policies: z.object({
    checkIn: z.string().regex(/^\d{2}:\d{2}$/),
    checkOut: z.string().regex(/^\d{2}:\d{2}$/),
    cancellation: localized,
    children: localized,
  }),
  contact: z.object({
    phone: z.string().max(30),
    whatsapp: z.string().max(30),
    email: z.string().email(),
  }),
  /** Tourism licence number, shown as a trust signal. */
  licence: z.string().max(60).optional(),
  /** Marks fictional demo content so the site says so. */
  isDemo: z.boolean().default(false),
});
export type HotelSite = z.infer<typeof hotelSiteSchema>;

export const pick = (text: Localized, lang: SiteLanguage) => text[lang];
