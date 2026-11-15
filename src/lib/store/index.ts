import { config } from "../config";
import { MemoryStore } from "./memory";
import type { Store } from "./store";
import { SupabaseStore } from "./supabase";

export type { Store } from "./store";

// Keep one instance across hot reloads in development.
const globalForStore = globalThis as unknown as { __bayanatkStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__bayanatkStore) {
    globalForStore.__bayanatkStore = config.supabase.enabled
      ? new SupabaseStore(config.supabase.url!, config.supabase.serviceRoleKey!)
      : new MemoryStore();
  }
  return globalForStore.__bayanatkStore;
}
