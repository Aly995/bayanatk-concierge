import type { BookingRequest, Conversation, LanguageCode, Message, ServiceRequest } from "./types";

/**
 * Pilot report numbers, computed from data the app already stores.
 * Pure function so it is easy to test and reuse (inbox, monthly report, export).
 */
export interface PilotMetrics {
  periodDays: number;
  conversations: number;
  guestMessages: number;
  aiReplies: number;
  staffReplies: number;
  /** Share of conversations the AI handled with no staff reply, 0..1. */
  handledByAiShare: number;
  escalated: number;
  requestsCreated: number;
  requestsDone: number;
  /** Median minutes from a guest message to the first staff reply, in escalated chats. Null if none yet. */
  medianStaffReplyMinutes: number | null;
  languages: { language: LanguageCode; conversations: number }[];
  /** Direct booking requests from the hotel website, and how many staff confirmed. */
  bookingRequests: number;
  bookingsConfirmed: number;
}

export function computePilotMetrics(input: {
  conversations: Conversation[];
  messagesByConversation: Map<string, Message[]>;
  requests: ServiceRequest[];
  bookings?: BookingRequest[];
  now: Date;
  periodDays?: number;
}): PilotMetrics {
  const periodDays = input.periodDays ?? 30;
  const since = input.now.getTime() - periodDays * 24 * 60 * 60 * 1000;
  const inPeriod = (iso: string) => new Date(iso).getTime() >= since;

  const conversations = input.conversations.filter((c) => inPeriod(c.createdAt));
  let guestMessages = 0;
  let aiReplies = 0;
  let staffReplies = 0;
  let handledByAi = 0;
  let escalated = 0;
  const replyMinutes: number[] = [];
  const langCounts = new Map<LanguageCode, number>();

  for (const c of conversations) {
    const msgs = input.messagesByConversation.get(c.id) ?? [];
    let hadStaff = false;
    let firstStaffTimed = false;
    let lastGuestAt: number | null = null;
    for (const m of msgs) {
      if (m.role === "guest") {
        guestMessages++;
        lastGuestAt = new Date(m.createdAt).getTime();
      } else if (m.role === "assistant") {
        aiReplies++;
      } else {
        staffReplies++;
        hadStaff = true;
        if (!firstStaffTimed && lastGuestAt !== null) {
          replyMinutes.push((new Date(m.createdAt).getTime() - lastGuestAt) / 60000);
          firstStaffTimed = true;
        }
      }
    }
    if (hadStaff || c.status === "needs_staff") escalated++;
    else handledByAi++;
    langCounts.set(c.language, (langCounts.get(c.language) ?? 0) + 1);
  }

  const requests = input.requests.filter((r) => inPeriod(r.createdAt));
  const bookings = (input.bookings ?? []).filter((b) => inPeriod(b.createdAt));
  return {
    periodDays,
    conversations: conversations.length,
    guestMessages,
    aiReplies,
    staffReplies,
    handledByAiShare: conversations.length ? handledByAi / conversations.length : 0,
    escalated,
    requestsCreated: requests.length,
    requestsDone: requests.filter((r) => r.status === "done").length,
    medianStaffReplyMinutes: median(replyMinutes),
    languages: [...langCounts.entries()]
      .map(([language, n]) => ({ language, conversations: n }))
      .sort((a, b) => b.conversations - a.conversations),
    bookingRequests: bookings.length,
    bookingsConfirmed: bookings.filter((b) => b.status === "confirmed").length,
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  const m = s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
  return Math.round(m * 10) / 10;
}
