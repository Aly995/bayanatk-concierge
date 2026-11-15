import { NextResponse } from "next/server";
import { loadHotel, requireStaff, route } from "@/lib/http";
import { computePilotMetrics } from "@/lib/metrics";
import { getStore } from "@/lib/store";
import type { Message } from "@/lib/types";

/** Everything the staff inbox shows: conversations, requests, booking requests and pilot numbers. */
export const GET = route(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  requireStaff(req, slug);
  const hotel = await loadHotel(slug);
  const store = getStore();
  const [conversations, requests, bookings, site] = await Promise.all([
    store.listConversations(hotel.id),
    store.listRequests(hotel.id),
    store.listBookingRequests(hotel.id),
    store.getHotelSite(hotel.id),
  ]);

  const messagesByConversation = new Map<string, Message[]>();
  await Promise.all(
    conversations.map(async (c) => messagesByConversation.set(c.id, await store.listMessages(hotel.id, c.id))),
  );

  const withLast = conversations.map((c) => {
    const msgs = messagesByConversation.get(c.id) ?? [];
    return { ...c, lastMessage: msgs.at(-1)?.content ?? "", messageCount: msgs.length };
  });
  const metrics = computePilotMetrics({ conversations, messagesByConversation, requests, bookings, now: new Date() });
  // Room names for the bookings board (staff read English names; the guest's language is shown separately).
  const roomNames = Object.fromEntries((site?.rooms ?? []).map((r) => [r.id, r.name.en]));

  return NextResponse.json({ conversations: withLast, requests, bookings, roomNames, metrics });
});
