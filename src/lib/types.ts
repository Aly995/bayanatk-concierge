/**
 * Domain types shared by every layer (store, AI, channels, UI).
 * Keep this file free of framework imports so any layer can use it.
 */

export type LanguageCode = "ar" | "en" | "ur" | "id" | "tr" | "other";

export type Channel = "web" | "whatsapp";

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  city: string;
  /** Short facts the assistant may quote, e.g. check-in time, distance to the Haram. */
  knowledge: KnowledgeItem[];
}

export interface KnowledgeItem {
  id: string;
  topic: string;
  content: string;
}

export type ConversationStatus = "ai" | "needs_staff" | "closed";

export interface Conversation {
  id: string;
  hotelId: string;
  channel: Channel;
  /** Channel-specific guest id: a browser session id or a WhatsApp phone number. */
  externalId: string;
  guestName: string | null;
  roomNumber: string | null;
  language: LanguageCode;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "guest" | "assistant" | "staff";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export const REQUEST_TYPES = [
  "housekeeping",
  "laundry",
  "maintenance",
  "transport",
  "late_checkout",
  "extra_items",
  "other",
] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_STATUSES = ["new", "in_progress", "done"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface ServiceRequest {
  id: string;
  hotelId: string;
  conversationId: string;
  type: RequestType;
  roomNumber: string | null;
  details: string;
  status: RequestStatus;
  createdAt: string;
}

export type Urgency = "low" | "normal" | "urgent";

export const BOOKING_STATUSES = ["new", "confirmed", "declined", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** A booking request from the hotel website. Staff confirm it; no payment is taken. */
export interface BookingRequest {
  id: string;
  hotelId: string;
  /** Short code the guest can quote, e.g. "BK-7K3Q9X". */
  reference: string;
  roomId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  isGroup: boolean;
  groupSize: number | null;
  guestName: string;
  phone: string;
  email: string | null;
  country: string | null;
  language: "en" | "ar";
  specialRequests: string | null;
  status: BookingStatus;
  createdAt: string;
}
