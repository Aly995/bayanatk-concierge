import { randomUUID } from "node:crypto";
import { DEMO_HOTEL } from "@/data/demo-hotel";
import { DEMO_SITE } from "@/data/demo-site";
import { hotelSiteSchema, type HotelSite } from "../site/schema";
import type { BookingRequest, Conversation, Hotel, Message, ServiceRequest } from "../types";
import type { ConversationPatch, NewBookingRequest, NewRequest, Store } from "./store";

const now = () => new Date().toISOString();

/**
 * In-memory store for demo mode and tests. Data resets on server restart.
 */
export class MemoryStore implements Store {
  private hotels = new Map<string, Hotel>();
  private conversations = new Map<string, Conversation>();
  private messages: Message[] = [];
  private requests = new Map<string, ServiceRequest>();
  private seenExternalIds = new Set<string>();
  private sites = new Map<string, HotelSite>();
  private bookings = new Map<string, BookingRequest>();

  constructor(hotels: Hotel[] = [DEMO_HOTEL], sites: Record<string, unknown> = { [DEMO_HOTEL.id]: DEMO_SITE }) {
    for (const h of hotels) this.hotels.set(h.id, h);
    // Same validation as the database path, so bad demo data fails loudly.
    for (const [hotelId, site] of Object.entries(sites)) this.sites.set(hotelId, hotelSiteSchema.parse(site));
  }

  async getHotelBySlug(slug: string) {
    return [...this.hotels.values()].find((h) => h.slug === slug) ?? null;
  }

  async getOrCreateConversation(input: Parameters<Store["getOrCreateConversation"]>[0]) {
    const existing = [...this.conversations.values()].find(
      (c) =>
        c.hotelId === input.hotelId &&
        c.channel === input.channel &&
        c.externalId === input.externalId &&
        c.status !== "closed",
    );
    if (existing) return existing;
    const conv: Conversation = {
      id: randomUUID(),
      hotelId: input.hotelId,
      channel: input.channel,
      externalId: input.externalId,
      guestName: null,
      roomNumber: null,
      language: input.language,
      status: "ai",
      createdAt: now(),
      updatedAt: now(),
    };
    this.conversations.set(conv.id, conv);
    return conv;
  }

  async getConversation(hotelId: string, id: string) {
    const c = this.conversations.get(id);
    return c && c.hotelId === hotelId ? c : null;
  }

  async listConversations(hotelId: string) {
    return [...this.conversations.values()]
      .filter((c) => c.hotelId === hotelId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async updateConversation(hotelId: string, id: string, patch: ConversationPatch) {
    const c = await this.getConversation(hotelId, id);
    if (!c) return;
    this.conversations.set(id, { ...c, ...patch, updatedAt: now() });
  }

  async addMessage(hotelId: string, conversationId: string, role: Message["role"], content: string) {
    const c = await this.getConversation(hotelId, conversationId);
    if (!c) throw new Error("Conversation not found for this hotel");
    const msg: Message = { id: randomUUID(), conversationId, role, content, createdAt: now() };
    this.messages.push(msg);
    this.conversations.set(c.id, { ...c, updatedAt: msg.createdAt });
    return msg;
  }

  async listMessages(hotelId: string, conversationId: string) {
    const c = await this.getConversation(hotelId, conversationId);
    if (!c) return [];
    return this.messages.filter((m) => m.conversationId === conversationId);
  }

  async createRequest(input: NewRequest) {
    const req: ServiceRequest = { id: randomUUID(), status: "new", createdAt: now(), ...input };
    this.requests.set(req.id, req);
    return req;
  }

  async listRequests(hotelId: string) {
    return [...this.requests.values()]
      .filter((r) => r.hotelId === hotelId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateRequestStatus(hotelId: string, id: string, status: ServiceRequest["status"]) {
    const r = this.requests.get(id);
    if (!r || r.hotelId !== hotelId) return null;
    const updated = { ...r, status };
    this.requests.set(id, updated);
    return updated;
  }

  async claimExternalMessage(externalMessageId: string) {
    if (this.seenExternalIds.has(externalMessageId)) return false;
    this.seenExternalIds.add(externalMessageId);
    return true;
  }

  async getHotelSite(hotelId: string) {
    return this.sites.get(hotelId) ?? null;
  }

  async createBookingRequest(input: NewBookingRequest) {
    const b: BookingRequest = { id: randomUUID(), status: "new", createdAt: now(), ...input };
    this.bookings.set(b.id, b);
    return b;
  }

  async listBookingRequests(hotelId: string) {
    return [...this.bookings.values()]
      .filter((b) => b.hotelId === hotelId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateBookingStatus(hotelId: string, id: string, status: BookingRequest["status"]) {
    const b = this.bookings.get(id);
    if (!b || b.hotelId !== hotelId) return null;
    const updated = { ...b, status };
    this.bookings.set(id, updated);
    return updated;
  }
}
