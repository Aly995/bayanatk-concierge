import type { Hotel } from "../types";
import type { ToolCall } from "./tools";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface RespondArgs {
  hotel: Hotel;
  system: string;
  /** Full history, oldest first, ending with the guest's newest message. */
  history: ChatTurn[];
  /** Runs a validated tool call and returns a short result for the model. */
  executeTool: (call: ToolCall) => Promise<string>;
}

/**
 * Any AI backend (Claude, an offline mock, another vendor later) implements this.
 * The rest of the app never imports a vendor SDK directly.
 */
export interface AIProvider {
  readonly name: string;
  respond(args: RespondArgs): Promise<string>;
}
