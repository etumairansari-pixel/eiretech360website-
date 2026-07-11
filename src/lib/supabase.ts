import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;

// The SDK is imported on first use, not at module load, so it stays out of the
// initial page bundle. Returns null when the env vars are not configured.
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(url, publishableKey);
  }
  return client;
}
