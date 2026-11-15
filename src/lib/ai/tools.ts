import { z } from "zod";
import { REQUEST_TYPES } from "../types";

/**
 * The actions the assistant may take. Each tool has:
 *  - a zod schema: validates whatever the model sends before we act on it
 *  - a JSON schema: what the model sees (kept in sync by hand, small on purpose)
 */

export const createRequestInput = z.object({
  type: z.enum(REQUEST_TYPES),
  details: z.string().min(1).max(500),
  room_number: z.string().max(20).optional(),
});
export type CreateRequestInput = z.infer<typeof createRequestInput>;

export const escalateInput = z.object({
  reason: z.string().min(1).max(500),
  urgency: z.enum(["low", "normal", "urgent"]),
});
export type EscalateInput = z.infer<typeof escalateInput>;

export type ToolCall =
  | { name: "create_service_request"; input: CreateRequestInput }
  | { name: "escalate_to_staff"; input: EscalateInput };

export const TOOL_DEFINITIONS = [
  {
    name: "create_service_request",
    description:
      "Create a request for hotel staff when the guest asks for a service: housekeeping, laundry, maintenance, transport (taxi, airport), late check-out, or extra items (towels, pillows, water). Ask for the room number first if you don't know it.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", enum: [...REQUEST_TYPES] },
        details: { type: "string", description: "What the guest wants, with time if given. Write in English for staff." },
        room_number: { type: "string", description: "Guest's room number, if known." },
      },
      required: ["type", "details"],
    },
  },
  {
    name: "escalate_to_staff",
    description:
      "Hand the conversation to a human. Use for complaints, payment or refund questions, booking changes or cancellations, medical or safety issues, anything you cannot answer from the hotel facts, or when the guest asks for a person.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: { type: "string", description: "Short summary for staff, in English." },
        urgency: { type: "string", enum: ["low", "normal", "urgent"] },
      },
      required: ["reason", "urgency"],
    },
  },
];

/** Validate a raw tool call from a model. Returns null if invalid. */
export function parseToolCall(name: string, input: unknown): ToolCall | null {
  if (name === "create_service_request") {
    const r = createRequestInput.safeParse(input);
    return r.success ? { name, input: r.data } : null;
  }
  if (name === "escalate_to_staff") {
    const r = escalateInput.safeParse(input);
    return r.success ? { name, input: r.data } : null;
  }
  return null;
}
