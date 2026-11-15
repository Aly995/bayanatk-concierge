import { NextResponse } from "next/server";
import { z } from "zod";
import { loadHotel, parseBody, requireStaff, route } from "@/lib/http";
import { getStore } from "@/lib/store";

const body = z.object({ status: z.enum(["ai", "needs_staff", "closed"]) });

/** Staff hand a conversation back to the AI, take it over, or close it. */
export const PATCH = route(async (req: Request, ctx: { params: Promise<{ slug: string; id: string }> }) => {
  const { slug, id } = await ctx.params;
  requireStaff(req, slug);
  const hotel = await loadHotel(slug);
  const { status } = await parseBody(req, body);
  await getStore().updateConversation(hotel.id, id, { status });
  return NextResponse.json({ ok: true });
});
