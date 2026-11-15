import type { AIProvider } from "./ai/provider";
import { buildSystemPrompt } from "./ai/prompt";
import type { ToolCall } from "./ai/tools";
import { detectLanguage } from "./i18n";
import type { Store } from "./store";
import type { Channel, Conversation, Hotel, Message } from "./types";

export interface GuestMessageInput {
  hotel: Hotel;
  channel: Channel;
  /** Browser session id or WhatsApp phone number. */
  externalId: string;
  text: string;
}

export interface GuestMessageResult {
  conversation: Conversation;
  reply: Message | null;
}

const MAX_HISTORY = 20;

/**
 * The single entry point for a guest message, whatever the channel.
 * Saves the message, asks the AI (unless staff have taken over), runs any
 * tools the AI calls, and saves the reply.
 */
export async function handleGuestMessage(
  deps: { store: Store; ai: AIProvider },
  input: GuestMessageInput,
): Promise<GuestMessageResult> {
  const { store, ai } = deps;
  const { hotel } = input;
  const text = input.text.trim().slice(0, 2000);

  const conversation = await store.getOrCreateConversation({
    hotelId: hotel.id,
    channel: input.channel,
    externalId: input.externalId,
    language: detectLanguage(text),
  });
  await store.addMessage(hotel.id, conversation.id, "guest", text);

  const language = detectLanguage(text);
  if (language !== "other" && language !== conversation.language) {
    await store.updateConversation(hotel.id, conversation.id, { language });
  }

  // Once staff have taken over, the AI stays quiet until they hand it back.
  if (conversation.status === "needs_staff") {
    return { conversation: (await store.getConversation(hotel.id, conversation.id))!, reply: null };
  }

  const history = (await store.listMessages(hotel.id, conversation.id))
    .slice(-MAX_HISTORY)
    // Staff replies count as the hotel's side of the conversation.
    .map((m) => ({ role: m.role === "guest" ? ("user" as const) : ("assistant" as const), content: m.content }));

  let roomNumber = conversation.roomNumber;
  const executeTool = async (call: ToolCall): Promise<string> => {
    if (call.name === "create_service_request") {
      const room = call.input.room_number ?? roomNumber;
      if (room && room !== roomNumber) {
        roomNumber = room;
        await store.updateConversation(hotel.id, conversation.id, { roomNumber: room });
      }
      const req = await store.createRequest({
        hotelId: hotel.id,
        conversationId: conversation.id,
        type: call.input.type,
        roomNumber: room ?? null,
        details: call.input.details,
      });
      return `Request ${req.id.slice(0, 8)} created for staff (${req.type}).`;
    }
    await store.updateConversation(hotel.id, conversation.id, { status: "needs_staff" });
    return `Escalated to staff (${call.input.urgency}): ${call.input.reason}`;
  };

  let replyText: string;
  try {
    replyText = await ai.respond({
      hotel,
      system: buildSystemPrompt(hotel, roomNumber),
      history: mergeConsecutive(history),
      executeTool,
    });
  } catch (err) {
    console.error("AI provider failed", err);
    await store.updateConversation(hotel.id, conversation.id, { status: "needs_staff" });
    replyText = "Sorry, I couldn't process that. A team member will reply to you shortly.";
  }

  const reply = await store.addMessage(hotel.id, conversation.id, "assistant", replyText);
  const updated = (await store.getConversation(hotel.id, conversation.id))!;
  return { conversation: updated, reply };
}

/** The Messages API needs alternating roles; merge any back-to-back turns. */
function mergeConsecutive(turns: { role: "user" | "assistant"; content: string }[]) {
  const out: typeof turns = [];
  for (const t of turns) {
    const last = out.at(-1);
    if (last && last.role === t.role) last.content += `\n${t.content}`;
    else out.push({ ...t });
  }
  // The first turn must come from the user.
  while (out[0]?.role === "assistant") out.shift();
  return out;
}

export type { Message };
