import { NextResponse } from "next/server";
import { loadHotel, requireStaff, route } from "@/lib/http";
import { getStore } from "@/lib/store";

/** Everything the staff inbox shows: conversations (with last message) and requests. */
export const GET = route(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  requireStaff(req, slug);
  const hotel = await loadHotel(slug);
  const store = getStore();
  const [conversations, requests] = await Promise.all([
    store.listConversations(hotel.id),
    store.listRequests(hotel.id),
  ]);
  const withLast = await Promise.all(
    conversations.map(async (c) => {
      const msgs = await store.listMessages(hotel.id, c.id);
      return { ...c, lastMessage: msgs.at(-1)?.content ?? "", messageCount: msgs.length };
    }),
  );
  return NextResponse.json({ conversations: withLast, requests });
});
