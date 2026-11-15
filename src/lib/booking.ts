import { z } from "zod";
import type { HotelSite, Room } from "./site/schema";
import type { Store } from "./store";
import type { BookingRequest, Hotel } from "./types";

/** What the website's booking form sends. Validated again on the server, always. */
export const bookingInput = z.object({
  roomId: z.string().min(2).max(40),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(12),
  children: z.number().int().min(0).max(12),
  isGroup: z.boolean(),
  groupSize: z.number().int().min(2).max(500).nullable(),
  guestName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{6,30}$/),
  email: z.string().trim().email().max(200).nullable(),
  country: z.string().trim().max(60).nullable(),
  language: z.enum(["en", "ar"]),
  specialRequests: z.string().trim().max(1000).nullable(),
  /** Privacy notice accepted. Required by the form. */
  consent: z.literal(true),
});
export type BookingInput = z.infer<typeof bookingInput>;

export const MAX_NIGHTS = 30;
const DAY_MS = 86_400_000;

export type BookingError =
  | "unknown_room"
  | "dates_invalid"
  | "check_in_in_past"
  | "too_many_nights"
  | "too_many_guests"
  | "group_size_required";

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / DAY_MS);
}

/** Business rules a schema can't express. Returns the first problem found, or null. */
export function validateBooking(input: BookingInput, site: HotelSite, today: string): BookingError | null {
  const room = site.rooms.find((r) => r.id === input.roomId);
  if (!room) return "unknown_room";
  if (Number.isNaN(Date.parse(input.checkIn)) || Number.isNaN(Date.parse(input.checkOut))) return "dates_invalid";
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) return "dates_invalid";
  if (input.checkIn < today) return "check_in_in_past";
  if (nights > MAX_NIGHTS) return "too_many_nights";
  if (input.isGroup) {
    if (!input.groupSize) return "group_size_required";
  } else if (input.adults + input.children > room.maxGuests) {
    return "too_many_guests";
  }
  return null;
}

/** Rough "from" estimate shown before sending: nights x starting price. The hotel confirms the real price. */
export function estimateFromPrice(room: Room, checkIn: string, checkOut: string): number | null {
  const nights = nightsBetween(checkIn, checkOut);
  return nights > 0 ? nights * room.fromPrice : null;
}

// No 0/O or 1/I, so a reference read out over the phone is never ambiguous.
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Web Crypto works in browsers, Node and Cloudflare Workers. 32 letters, so `byte % 32` has no bias. */
export function makeReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `BK-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("")}`;
}

export async function createBooking(
  deps: { store: Store; today: string },
  hotel: Hotel,
  site: HotelSite,
  input: BookingInput,
): Promise<{ ok: true; booking: BookingRequest } | { ok: false; error: BookingError }> {
  const error = validateBooking(input, site, deps.today);
  if (error) return { ok: false, error };
  const booking = await deps.store.createBookingRequest({
    hotelId: hotel.id,
    reference: makeReference(),
    roomId: input.roomId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    isGroup: input.isGroup,
    groupSize: input.isGroup ? input.groupSize : null,
    guestName: input.guestName,
    phone: input.phone,
    email: input.email || null,
    country: input.country || null,
    language: input.language,
    specialRequests: input.specialRequests || null,
  });
  return { ok: true, booking };
}

/** Today's date in Saudi Arabia (UTC+3, no daylight saving), as YYYY-MM-DD. */
export function todayInSaudi(now = new Date()): string {
  return new Date(now.getTime() + 3 * 3_600_000).toISOString().slice(0, 10);
}
