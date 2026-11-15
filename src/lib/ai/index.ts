import { config } from "../config";
import { ClaudeProvider } from "./claude";
import { MockProvider } from "./mock";
import type { AIProvider } from "./provider";

export type { AIProvider } from "./provider";

let provider: AIProvider | undefined;

/** Claude when a key is set, the offline demo assistant otherwise. */
export function getAIProvider(): AIProvider {
  provider ??= config.ai.apiKey
    ? new ClaudeProvider(config.ai.apiKey, config.ai.model)
    : new MockProvider();
  return provider;
}
