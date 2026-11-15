import { NextResponse } from "next/server";
import { z } from "zod";
import { sendText } from "@/lib/channels/whatsapp";
import { config } from "@/lib/config";
import { HttpError, loadHotel, parseBody, requireStaff, route } from "@/lib/http";
import { getStore } from "@/lib/store";

type Ctx = { params: Promise<{ slug: string; id: string }> };

/**
 * Messages of one conversation. Guests poll this for staff replies; the
 * conversation id is an unguessable UUID that only that guest's browser holds.
 */
export const GET = route(async (_req: Request, ctx: Ctx) => {
  const { slug, id } = await ctx.params;
  const hotel = await loadHotel(slug);
  const store = getStore();
  const conversation = await store.getConversation(hotel.id, id);
  if (!conversation) throw new HttpError(404, "Conversation not found");
  const messages = await store.listMessages(hotel.id, id);
  return NextResponse.json({ conversation, messages });
});

const staffReply = z.object({ text: z.string().min(1).max(2000) });

/** Staff reply from the inbox. Also delivered on WhatsApp for WhatsApp guests. */
export const POST = route(async (req: Request, ctx: Ctx) => {
  const { slug, id } = await ctx.params;
  requireStaff(req, slug);
  const hotel = await loadHotel(slug);
  const { text } = await parseBody(req, staffReply);
  const store = getStore();
  const conversation = await store.getConversation(hotel.id, id);
  if (!conversation) throw new HttpError(404, "Conversation not found");

  const message = await store.addMessage(hotel.id, id, "staff", text);
  if (conversation.status !== "needs_staff") {
    await store.updateConversation(hotel.id, id, { status: "needs_staff" });
  }
  if (conversation.channel === "whatsapp" && config.whatsapp.enabled) {
    await sendText({
      accessToken: config.whatsapp.accessToken!,
      phoneNumberId: config.whatsapp.phoneNumberId!,
      to: conversation.externalId,
      body: text,
    });
  }
  return NextResponse.json({ message });
});
