import { NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, loadHotel, parseBody, requireStaff, route } from "@/lib/http";
import { getStore } from "@/lib/store";
import { REQUEST_STATUSES } from "@/lib/types";

const body = z.object({ status: z.enum(REQUEST_STATUSES) });

/** Staff move a request: new -> in_progress -> done. */
export const PATCH = route(async (req: Request, ctx: { params: Promise<{ slug: string; id: string }> }) => {
  const { slug, id } = await ctx.params;
  requireStaff(req, slug);
  const hotel = await loadHotel(slug);
  const { status } = await parseBody(req, body);
  const updated = await getStore().updateRequestStatus(hotel.id, id, status);
  if (!updated) throw new HttpError(404, "Request not found");
  return NextResponse.json({ request: updated });
});
