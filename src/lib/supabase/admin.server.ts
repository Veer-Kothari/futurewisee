import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseFetch } from "./client";

/**
 * Service-role client (bypasses RLS). Server functions only — never import
 * this from a route or component. Returns null when Lovable Cloud isn't
 * connected, so callers answer "unavailable" instead of crashing.
 */
let adminClient: SupabaseClient | null = null;

function adminSettings(): { url: string; serviceKey: string } | null {
  const env = typeof process !== "undefined" && process.env ? process.env : undefined;
  const url = env?.["SUPABASE_URL"]?.replace(/\/+$/, "");
  const serviceKey = env?.["SUPABASE_SERVICE_ROLE_KEY"];
  return url && serviceKey ? { url, serviceKey } : null;
}

/**
 * True when the service-role settings exist. Checks settings only and creates
 * no client. Lovable's own hosting provides them; Lovable Cloud doesn't give
 * the key out, so another host (Vercel) runs without them.
 */
export function adminConfigured(): boolean {
  return adminSettings() !== null;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const settings = adminSettings();
  if (!settings) return null;
  const { url, serviceKey } = settings;

  const baseFetch = supabaseFetch(url, serviceKey);
  // Server-side database calls never hang a request (or a sync lease) for long.
  const timedFetch: typeof fetch = (input, init) =>
    baseFetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(10_000) });
  adminClient ??= createClient(url, serviceKey, {
    global: { fetch: timedFetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return adminClient;
}
