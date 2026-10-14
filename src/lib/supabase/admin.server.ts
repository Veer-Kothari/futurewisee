import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseFetch } from "./client";

/**
 * Service-role client (bypasses RLS). Server functions only — never import
 * this from a route or component. Returns null when Lovable Cloud isn't
 * connected, so callers answer "unavailable" instead of crashing.
 */
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const env = typeof process !== "undefined" && process.env ? process.env : undefined;
  const url = env?.["SUPABASE_URL"]?.replace(/\/+$/, "");
  const serviceKey = env?.["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !serviceKey) return null;

  adminClient ??= createClient(url, serviceKey, {
    global: { fetch: supabaseFetch(url, serviceKey) },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return adminClient;
}
