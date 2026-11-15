import { NextResponse } from "next/server";
import { bookingInput, createBooking, todayInSaudi } from "@/lib/booking";
import { enforceRateLimit, HttpError, loadHotel, parseBody, route } from "@/lib/http";
import { getStore } from "@/lib/store";

/** A guest sends a booking request from the hotel website. No payment is taken. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  enforceRateLimit(req, "booking");
  const { slug } = await ctx.params;
  const hotel = await loadHotel(slug);
  const store = getStore();
  const site = await store.getHotelSite(hotel.id);
  if (!site) throw new HttpError(404, "This hotel has no website");
  const input = await parseBody(req, bookingInput);
  const result = await createBooking({ store, today: todayInSaudi() }, hotel, site, input);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 422 });
  return NextResponse.json(
    { reference: result.booking.reference, status: result.booking.status },
    { status: 201 },
  );
});
