import { NextResponse } from "next/server";
import { z } from "zod";
import { getAIProvider } from "@/lib/ai";
import { handleGuestMessage } from "@/lib/assistant";
import { loadHotel, parseBody, route } from "@/lib/http";
import { getStore } from "@/lib/store";

const body = z.object({
  sessionId: z.string().min(8).max(100),
  text: z.string().min(1).max(2000),
});

/** Guest sends a message from the web chat. */
export const POST = route(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const hotel = await loadHotel(slug);
  const { sessionId, text } = await parseBody(req, body);
  const store = getStore();
  const { conversation } = await handleGuestMessage(
    { store, ai: getAIProvider() },
    { hotel, channel: "web", externalId: sessionId, text },
  );
  const messages = await store.listMessages(hotel.id, conversation.id);
  return NextResponse.json({ conversationId: conversation.id, status: conversation.status, messages });
});
