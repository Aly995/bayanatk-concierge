import { describe, expect, it } from "vitest";
import { DEMO_HOTEL } from "@/data/demo-hotel";
import { MockProvider, detectIntent, isInfoQuestion, isYes } from "@/lib/ai/mock";
import type { AIProvider } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompt";
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

describe("questions about a service get the facts first", () => {
  it("answers the airport question in Arabic with the price, without asking for a room", async () => {
    const { send, store } = setup();
    const { reply, conversation } = await send("هل يوجد توصيل من المطار؟");
    expect(reply?.content).toContain("120");
    expect(reply?.content).toContain("3 ساعات");
    expect(reply?.content).not.toContain("رقم غرفتك");
    expect(conversation.status).toBe("ai");
    expect(await store.listRequests(DEMO_HOTEL.id)).toHaveLength(0);
  });

  it("answers the airport question in English with price, free condition and notice", async () => {
    const { send, store } = setup();
    const { reply } = await send("Is there an airport pickup?");
    expect(reply?.content).toContain("SAR 120");
    expect(reply?.content).toMatch(/free .*3 nights/);
    expect(reply?.content).toMatch(/3 hours ahead/);
    expect(reply?.content).toMatch(/arrange it\?$/);
    expect(reply?.content).not.toMatch(/room number/i);
    expect(await store.listRequests(DEMO_HOTEL.id)).toHaveLength(0);
  });

  it("after a yes, asks staying guests for the room number and creates the request", async () => {
    const { send, store } = setup();
    await send("Is there an airport pickup?");
    const yes = await send("Yes please");
    expect(yes.reply?.content).toMatch(/room number/i);
    expect(yes.reply?.content).toMatch(/flight/i);
    expect(await store.listRequests(DEMO_HOTEL.id)).toHaveLength(0);

    await send("412");
    const requests = await store.listRequests(DEMO_HOTEL.id);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ type: "transport", roomNumber: "412" });
    expect(requests[0]!.details).toContain("Is there an airport pickup?");
  });

  it("after a yes, takes an arriving guest's flight details without a room number", async () => {
    const { send, store } = setup();
    await send("هل يوجد توصيل من المطار؟");
    const yes = await send("نعم");
    expect(yes.reply?.content).toContain("رقم غرفتك");
    expect(yes.reply?.content).toContain("رحلتك");

    const done = await send("أصل يوم 20 ديسمبر 2026 الساعة 3 عصراً على رحلة SV 1234");
    expect(done.reply?.content).toContain("✓");
    const requests = await store.listRequests(DEMO_HOTEL.id);
    expect(requests).toHaveLength(1);
    expect(requests[0]!.type).toBe("transport");
    expect(requests[0]!.roomNumber ?? null).toBeNull();
    expect(requests[0]!.details).toContain("SV 1234");
  });

  it("still treats a direct request as a request", async () => {
    const { send, store } = setup();
    const { reply } = await send("I need a taxi to the airport tomorrow at 9am");
    expect(reply?.content).toMatch(/room number/i);
    expect(await store.listRequests(DEMO_HOTEL.id)).toHaveLength(0);
  });

  it("tells questions, requests and yes apart", () => {
    expect(isInfoQuestion("هل يوجد توصيل من المطار؟")).toBe(true);
    expect(isInfoQuestion("How much is the airport transfer?")).toBe(true);
    expect(isInfoQuestion("أريد تاكسي إلى المطار")).toBe(false);
    expect(isInfoQuestion("Can you book me a taxi?")).toBe(false);
    expect(isYes("Yes please!")).toBe(true);
    expect(isYes("نعم من فضلك")).toBe(true);
    expect(isYes("Evet")).toBe(true);
    expect(isYes("What time is breakfast?")).toBe(false);
    // "card" is not a car.
    expect(detectIntent("Do you accept credit cards?")).not.toBe("transport");
  });

  it("gives the real model the facts-first rule", () => {
    const prompt = buildSystemPrompt(DEMO_HOTEL, null);
    expect(prompt).toMatch(/answer from the facts first/);
    expect(prompt).toMatch(/room number only if the guest is staying/);
    // The rule names no prices: those stay in the hotel's own facts.
    expect(prompt.split("RULES")[1]).not.toContain("120");
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
