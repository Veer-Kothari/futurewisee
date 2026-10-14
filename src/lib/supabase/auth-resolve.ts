import { createClient } from "@supabase/supabase-js";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { publicSupabaseEnv, supabaseFetch } from "./client";

/**
 * Server half of the auth pair: verifies the bearer token (signature and
 * expiry, through Supabase's getClaims) and puts the user id — or null for a
 * visitor or an invalid token — into the function's context. Functions that
 * need an account check `context.userId` themselves and answer with a
 * reason, never a raw error.
 */
export const resolveUser = createMiddleware({ type: "function" }).server(async ({ next }) => {
  let userId: string | null = null;
  try {
    userId = await userIdFromRequest();
  } catch {
    userId = null;
  }
  return next({ context: { userId } });
});

async function userIdFromRequest(): Promise<string | null> {
  const header = getRequest()?.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (token.split(".").length !== 3) return null;

  const env = publicSupabaseEnv();
  if (!env) return null;
  const client = createClient(env.url, env.key, {
    global: {
      fetch: supabaseFetch(env.url, env.key),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.getClaims(token);
  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string" || !sub) return null;
  return sub;
}
