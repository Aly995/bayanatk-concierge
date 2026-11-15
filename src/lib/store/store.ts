import type {
  Channel,
  Conversation,
  ConversationStatus,
  Hotel,
  LanguageCode,
  Message,
  MessageRole,
  RequestStatus,
  RequestType,
  ServiceRequest,
} from "../types";

export interface NewRequest {
  hotelId: string;
  conversationId: string;
  type: RequestType;
  roomNumber: string | null;
  details: string;
}

export interface ConversationPatch {
  status?: ConversationStatus;
  language?: LanguageCode;
  roomNumber?: string | null;
  guestName?: string | null;
}

/**
 * The only way the app reads or writes data.
 * Implementations: MemoryStore (demo, tests) and SupabaseStore (production).
 * Every method that touches tenant data takes hotelId, so one hotel can never
 * read another hotel's rows, whatever the backing database does.
 */
export interface Store {
  getHotelBySlug(slug: string): Promise<Hotel | null>;

  getOrCreateConversation(input: {
    hotelId: string;
    channel: Channel;
    externalId: string;
    language: LanguageCode;
  }): Promise<Conversation>;
  getConversation(hotelId: string, id: string): Promise<Conversation | null>;
  listConversations(hotelId: string): Promise<Conversation[]>;
  updateConversation(hotelId: string, id: string, patch: ConversationPatch): Promise<void>;

  addMessage(hotelId: string, conversationId: string, role: MessageRole, content: string): Promise<Message>;
  listMessages(hotelId: string, conversationId: string): Promise<Message[]>;

  createRequest(input: NewRequest): Promise<ServiceRequest>;
  listRequests(hotelId: string): Promise<ServiceRequest[]>;
  updateRequestStatus(hotelId: string, id: string, status: RequestStatus): Promise<ServiceRequest | null>;

  /** Returns true the first time an external (e.g. WhatsApp) message id is seen. */
  claimExternalMessage(externalMessageId: string): Promise<boolean>;
}
