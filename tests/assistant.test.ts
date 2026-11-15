import { describe, expect, it } from "vitest";
import { DEMO_HOTEL } from "@/data/demo-hotel";
import { MockProvider } from "@/lib/ai/mock";
import type { AIProvider } from "@/lib/ai/provider";
import { handleGuestMessage } from "@/lib/assistant";
import { MemoryStore } from "@/lib/store/memory";

const setup = (ai: AIProvider = new MockProvider()) => {
  const store = new MemoryStore();
  const send = (text: string, externalId = "guest-session-1") =>
    handleGuestMessage({ store, ai }, { hotel: DEMO_HOTEL, channel: "web", externalId, text });
  return { store, send };
};

describe("handleGuestMessage with the offline demo AI", () => {
  it("answers a fact question in the guest's language", async () => {
    const { send } = setup();
    const { reply, conversation } = await send("كم تبعد المسافة إلى الحرم؟");
    expect(reply?.content).toContain("المسجد النبوي");
    expect(conversation.language).toBe("ar");
    expect(conversation.status).toBe("ai");
  });

  it("asks for the room number, then creates the request", async () => {
    const { send, store } = setup();
    const first = await send("I need extra towels please");
    expect(first.reply?.content).toMatch(/room number/i);
    expect(await store.listRequests(DEMO_HOTEL.id)).toHaveLength(0);

    const second = await send("412");
    const requests = await store.listRequests(DEMO_HOTEL.id);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ type: "extra_items", roomNumber: "412", status: "new" });
    // Staff see the original request, not the room-number reply.
    expect(requests[0]!.details).toContain("I need extra towels please");
    expect(second.conversation.roomNumber).toBe("412");
  });

  it("escalates complaints to staff and then stays quiet", async () => {
    const { send } = setup();
    const r1 = await send("I want to speak to the manager, I have a complaint");
    expect(r1.conversation.status).toBe("needs_staff");
    const r2 = await send("hello?");
    expect(r2.reply).toBeNull();
  });

  it("keeps hotels isolated", async () => {
    const { send, store } = setup();
    const { conversation } = await send("What time is check-in?");
    expect(await store.getConversation("another-hotel-id", conversation.id)).toBeNull();
    expect(await store.listMessages("another-hotel-id", conversation.id)).toEqual([]);
  });

  it("hands over to staff if the AI provider fails", async () => {
    const failing: AIProvider = { name: "broken", respond: async () => { throw new Error("down"); } };
    const { send } = setup(failing);
    const { reply, conversation } = await send("Hello");
    expect(conversation.status).toBe("needs_staff");
    expect(reply?.content).toMatch(/team member/i);
  });
});

describe("tool validation", () => {
  it("rejects tool calls with bad input before anything is saved", async () => {
    const { parseToolCall } = await import("@/lib/ai/tools");
    expect(parseToolCall("create_service_request", { type: "spa", details: "x" })).toBeNull();
    expect(parseToolCall("delete_everything", {})).toBeNull();
    expect(parseToolCall("escalate_to_staff", { reason: "Refund", urgency: "urgent" })).not.toBeNull();
  });
});
