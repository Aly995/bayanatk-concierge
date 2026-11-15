import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hotelSiteSchema, type HotelSite } from "../site/schema";
import type {
  BookingRequest,
  Conversation,
  Hotel,
  KnowledgeItem,
  Message,
  ServiceRequest,
} from "../types";
import type { ConversationPatch, NewBookingRequest, NewRequest, Store } from "./store";

/**
 * Supabase-backed store. Runs ONLY on the server with the service-role key,
 * because guests are anonymous. Tenant isolation is enforced here by always
 * filtering on hotel_id, and in the database by RLS for staff logins
 * (see supabase/migrations/0001_init.sql).
 */
export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async getHotelBySlug(slug: string): Promise<Hotel | null> {
    const { data: hotel, error } = await this.db
      .from("hotels")
      .select("id, slug, name, name_ar, city")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!hotel) return null;
    const { data: kb, error: kbError } = await this.db
      .from("knowledge_items")
      .select("id, topic, content")
      .eq("hotel_id", hotel.id)
      .order("topic");
    if (kbError) throw kbError;
    return {
      id: hotel.id,
      slug: hotel.slug,
      name: hotel.name,
      nameAr: hotel.name_ar,
      city: hotel.city,
      knowledge: (kb ?? []) as KnowledgeItem[],
    };
  }

  async getOrCreateConversation(input: Parameters<Store["getOrCreateConversation"]>[0]) {
    const { data: existing, error } = await this.db
      .from("conversations")
      .select("*")
      .eq("hotel_id", input.hotelId)
      .eq("channel", input.channel)
      .eq("external_id", input.externalId)
      .neq("status", "closed")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (existing) return toConversation(existing);
    const { data, error: insertError } = await this.db
      .from("conversations")
      .insert({
        hotel_id: input.hotelId,
        channel: input.channel,
        external_id: input.externalId,
        language: input.language,
      })
      .select("*")
      .single();
    if (insertError) throw insertError;
    return toConversation(data);
  }

  async getConversation(hotelId: string, id: string) {
    const { data, error } = await this.db
      .from("conversations")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? toConversation(data) : null;
  }

  async listConversations(hotelId: string) {
    const { data, error } = await this.db
      .from("conversations")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []).map(toConversation);
  }

  async updateConversation(hotelId: string, id: string, patch: ConversationPatch) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.language !== undefined) row.language = patch.language;
    if (patch.roomNumber !== undefined) row.room_number = patch.roomNumber;
    if (patch.guestName !== undefined) row.guest_name = patch.guestName;
    const { error } = await this.db.from("conversations").update(row).eq("hotel_id", hotelId).eq("id", id);
    if (error) throw error;
  }

  async addMessage(hotelId: string, conversationId: string, role: Message["role"], content: string) {
    const { data, error } = await this.db
      .from("messages")
      .insert({ hotel_id: hotelId, conversation_id: conversationId, role, content })
      .select("*")
      .single();
    if (error) throw error;
    await this.updateConversation(hotelId, conversationId, {});
    return toMessage(data);
  }

  async listMessages(hotelId: string, conversationId: string) {
    const { data, error } = await this.db
      .from("messages")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toMessage);
  }

  async createRequest(input: NewRequest) {
    const { data, error } = await this.db
      .from("service_requests")
      .insert({
        hotel_id: input.hotelId,
        conversation_id: input.conversationId,
        type: input.type,
        room_number: input.roomNumber,
        details: input.details,
      })
      .select("*")
      .single();
    if (error) throw error;
    return toRequest(data);
  }

  async listRequests(hotelId: string) {
    const { data, error } = await this.db
      .from("service_requests")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []).map(toRequest);
  }

  async updateRequestStatus(hotelId: string, id: string, status: ServiceRequest["status"]) {
    const { data, error } = await this.db
      .from("service_requests")
      .update({ status })
      .eq("hotel_id", hotelId)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? toRequest(data) : null;
  }

  async claimExternalMessage(externalMessageId: string) {
    // The primary key makes this atomic: a duplicate insert fails.
    const { error } = await this.db.from("processed_external_messages").insert({ id: externalMessageId });
    if (!error) return true;
    if (error.code === "23505") return false; // unique_violation: already processed
    throw error;
  }

  async getHotelSite(hotelId: string): Promise<HotelSite | null> {
    const { data, error } = await this.db.from("hotel_sites").select("content").eq("hotel_id", hotelId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    // Content is JSON written by people: validate before any page uses it.
    const parsed = hotelSiteSchema.safeParse(data.content);
    if (!parsed.success) {
      console.error(`Invalid site content for hotel ${hotelId}`, parsed.error.issues.slice(0, 5));
      return null;
    }
    return parsed.data;
  }

  async createBookingRequest(input: NewBookingRequest) {
    const { data, error } = await this.db
      .from("booking_requests")
      .insert({
        hotel_id: input.hotelId,
        reference: input.reference,
        room_id: input.roomId,
        check_in: input.checkIn,
        check_out: input.checkOut,
        adults: input.adults,
        children: input.children,
        is_group: input.isGroup,
        group_size: input.groupSize,
        guest_name: input.guestName,
        phone: input.phone,
        email: input.email,
        country: input.country,
        language: input.language,
        special_requests: input.specialRequests,
      })
      .select("*")
      .single();
    if (error) throw error;
    return toBooking(data);
  }

  async listBookingRequests(hotelId: string) {
    const { data, error } = await this.db
      .from("booking_requests")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []).map(toBooking);
  }

  async updateBookingStatus(hotelId: string, id: string, status: BookingRequest["status"]) {
    const { data, error } = await this.db
      .from("booking_requests")
      .update({ status })
      .eq("hotel_id", hotelId)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? toBooking(data) : null;
  }
}

/* ---- row mappers: database snake_case to domain camelCase ---- */

function toBooking(r: Row): BookingRequest {
  return {
    id: r.id,
    hotelId: r.hotel_id,
    reference: r.reference,
    roomId: r.room_id,
    checkIn: r.check_in,
    checkOut: r.check_out,
    adults: r.adults,
    children: r.children,
    isGroup: r.is_group,
    groupSize: r.group_size,
    guestName: r.guest_name,
    phone: r.phone,
    email: r.email,
    country: r.country,
    language: r.language,
    specialRequests: r.special_requests,
    status: r.status,
    createdAt: r.created_at,
  };
}

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function toConversation(r: Row): Conversation {
  return {
    id: r.id,
    hotelId: r.hotel_id,
    channel: r.channel,
    externalId: r.external_id,
    guestName: r.guest_name,
    roomNumber: r.room_number,
    language: r.language,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toMessage(r: Row): Message {
  return { id: r.id, conversationId: r.conversation_id, role: r.role, content: r.content, createdAt: r.created_at };
}

function toRequest(r: Row): ServiceRequest {
  return {
    id: r.id,
    hotelId: r.hotel_id,
    conversationId: r.conversation_id,
    type: r.type,
    roomNumber: r.room_number,
    details: r.details,
    status: r.status,
    createdAt: r.created_at,
  };
}
