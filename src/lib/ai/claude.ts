import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, RespondArgs } from "./provider";
import { parseToolCall, TOOL_DEFINITIONS } from "./tools";

const MAX_TOOL_ROUNDS = 3;

/** Claude via the Anthropic Messages API, with tool use. */
export class ClaudeProvider implements AIProvider {
  readonly name = "claude";
  private client: Anthropic;

  constructor(apiKey: string, private model: string) {
    this.client = new Anthropic({ apiKey });
  }

  async respond({ system, history, executeTool }: RespondArgs): Promise<string> {
    const messages: Anthropic.MessageParam[] = history.map((t) => ({ role: t.role, content: t.content }));

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 600,
        system,
        messages,
        tools: TOOL_DEFINITIONS,
      });

      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();

      if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
        return text || "…";
      }

      // Run each tool the model asked for, then send the results back.
      messages.push({ role: "assistant", content: response.content });
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const use of toolUses) {
        const call = parseToolCall(use.name, use.input);
        const content = call ? await executeTool(call) : "Invalid tool input; ask the guest to clarify.";
        results.push({ type: "tool_result", tool_use_id: use.id, content, is_error: !call });
      }
      messages.push({ role: "user", content: results });
    }
    return "A team member will reply to you shortly.";
  }
}
