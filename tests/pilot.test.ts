import { describe, expect, it } from "vitest";
import { DEMO_HOTEL } from "@/data/demo-hotel";
import { MockProvider } from "@/lib/ai/mock";
import { handleGuestMessage } from "@/lib/assistant";
import { computePilotMetrics } from "@/lib/metrics";
import { FixedWindowLimiter } from "@/lib/ratelimit";
import { MemoryStore } from "@/lib/store/memory";
import type { BookingRequest, Conversation, Message, ServiceRequest } from "@/lib/types";

describe("rate limiter", () => {
  it("allows up to the limit per window, then asks to retry", () => {
    let t = 0;
    const limiter = new FixedWindowLimiter(3, 60_000, () => t);
    expect([1, 2, 3].map(() => limiter.hit("ip-1").ok)).toEqual([true, true, true]);
    const blocked = limiter.hit("ip-1");
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBe(60);
    expect(limiter.hit("ip-2").ok).toBe(true); // other visitors unaffected
    t = 60_001;
    expect(limiter.hit("ip-1").ok).toBe(true); // new window
  });
});

describe("daily message cap", () => {
  it("hands over to staff after the cap instead of calling the AI", async () => {
    const store = new MemoryStore();
    let aiCalls = 0;
    const ai = { name: "counting", respond: async () => { aiCalls++; return "ok"; } };
    const send = (text: string) =>
      handleGuestMessage(
        { store, ai, limits: { maxGuestMessagesPerDay: 3 } },
        { hotel: DEMO_HOTEL, channel: "web", externalId: "session-cap", text },
      );
    for (const t of ["a", "b", "c"]) await send(t);
    expect(aiCalls).toBe(3);
    const over = await send("d");
    expect(aiCalls).toBe(3);
    expect(over.conversation.status).toBe("needs_staff");
    expect(over.reply?.content).toMatch(/team/i);
  });

  it("does not count yesterday's messages", async () => {
    const store = new MemoryStore();
    const ai = new MockProvider();
    const limits = { maxGuestMessagesPerDay: 1 };
    const send = (text: string, now: Date) =>
      handleGuestMessage({ store, ai, limits, now: () => now }, { hotel: DEMO_HOTEL, channel: "web", externalId: "s-day", text });
    await send("Hello", new Date());
    // A day later the cap has reset (messages are timestamped "now", so check from 25h ahead).
    const later = new Date(Date.now() + 25 * 3_600_000);
    const r = await send("What time is check-in?", later);
    expect(r.conversation.status).toBe("ai");
  });
});

describe("pilot metrics", () => {
  const now = new Date("2026-11-15T12:00:00Z");
  const conv = (id: string, status: Conversation["status"], language: Conversation["language"], createdAt = "2026-11-10T10:00:00Z"): Conversation => ({
    id, hotelId: "h", channel: "web", externalId: id, guestName: null, roomNumber: null, language, status, createdAt, updatedAt: createdAt,
  });
  const msg = (conversationId: string, role: Message["role"], at: string): Message => ({ id: `${conversationId}-${at}`, conversationId, role, content: "x", createdAt: at });

  it("counts AI-handled chats, staff reply time, requests and languages", () => {
    const conversations = [conv("a", "ai", "ar"), conv("b", "needs_staff", "en"), conv("c", "ai", "ar"), conv("old", "ai", "id", "2026-09-01T00:00:00Z")];
    const messagesByConversation = new Map<string, Message[]>([
      ["a", [msg("a", "guest", "2026-11-10T10:00:00Z"), msg("a", "assistant", "2026-11-10T10:00:05Z")]],
      ["b", [msg("b", "guest", "2026-11-10T10:00:00Z"), msg("b", "assistant", "2026-11-10T10:00:05Z"), msg("b", "staff", "2026-11-10T10:04:00Z")]],
      ["c", [msg("c", "guest", "2026-11-11T09:00:00Z"), msg("c", "assistant", "2026-11-11T09:00:03Z")]],
    ]);
    const requests: ServiceRequest[] = [
      { id: "r1", hotelId: "h", conversationId: "a", type: "laundry", roomNumber: "1", details: "", status: "done", createdAt: "2026-11-10T10:01:00Z" },
      { id: "r2", hotelId: "h", conversationId: "c", type: "transport", roomNumber: "2", details: "", status: "new", createdAt: "2026-11-11T09:01:00Z" },
    ];
    const booking = (id: string, status: BookingRequest["status"], createdAt: string): BookingRequest => ({
      id, hotelId: "h", reference: "BK-AAAAAA", roomId: "r", checkIn: "2026-12-01", checkOut: "2026-12-03", adults: 2, children: 0,
      isGroup: false, groupSize: null, guestName: "G", phone: "+1", email: null, country: null, language: "en", specialRequests: null, status, createdAt,
    });
    const bookings = [booking("b1", "confirmed", "2026-11-12T00:00:00Z"), booking("b2", "new", "2026-11-13T00:00:00Z"), booking("b3", "confirmed", "2026-08-01T00:00:00Z")];
    const m = computePilotMetrics({ conversations, messagesByConversation, requests, bookings, now });
    expect(m.bookingRequests).toBe(2);
    expect(m.bookingsConfirmed).toBe(1);
    expect(m.conversations).toBe(3); // "old" is outside 30 days
    expect(m.handledByAiShare).toBeCloseTo(2 / 3);
    expect(m.escalated).toBe(1);
    expect(m.medianStaffReplyMinutes).toBe(4);
    expect(m.requestsCreated).toBe(2);
    expect(m.requestsDone).toBe(1);
    expect(m.languages[0]).toEqual({ language: "ar", conversations: 2 });
  });

  it("handles an empty hotel", () => {
    const m = computePilotMetrics({ conversations: [], messagesByConversation: new Map(), requests: [], now });
    expect(m).toMatchObject({ conversations: 0, handledByAiShare: 0, medianStaffReplyMinutes: null });
  });
});
