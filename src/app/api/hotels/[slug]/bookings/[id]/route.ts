import { NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, loadHotel, parseBody, requireStaff, route } from "@/lib/http";
import { getStore } from "@/lib/store";
import { BOOKING_STATUSES } from "@/lib/types";

const body = z.object({ status: z.enum(BOOKING_STATUSES) });

/** Staff confirm, decline or cancel a booking request. */
export const PATCH = route(async (req: Request, ctx: { params: Promise<{ slug: string; id: string }> }) => {
  const { slug, id } = await ctx.params;
  requireStaff(req, slug);
  const hotel = await loadHotel(slug);
  const { status } = await parseBody(req, body);
  const updated = await getStore().updateBookingStatus(hotel.id, id, status);
  if (!updated) throw new HttpError(404, "Booking request not found");
  return NextResponse.json({ booking: updated });
});
