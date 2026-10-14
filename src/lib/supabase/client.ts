import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The site's Supabase (Lovable Cloud) client for public reads and sign-in.
 *
 * It reads the same settings Lovable Cloud provides (VITE_SUPABASE_URL and
 * VITE_SUPABASE_PUBLISHABLE_KEY at build time, SUPABASE_URL and
 * SUPABASE_PUBLISHABLE_KEY on the server), so it works whether or not
 * Lovable's generated src/integrations/supabase files exist. When the backend
 * isn't connected (local dev, a preview without Cloud) getSupabase() returns
 * null and every caller shows its empty or "not available yet" state.
 */
type PublicEnv = { url: string; key: string };

function serverEnv(): Record<string, string | undefined> | undefined {
  return typeof process !== "undefined" && process.env ? process.env : undefined;
}

function readPublicEnv(): PublicEnv | null {
  const url =
    (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || serverEnv()?.["SUPABASE_URL"];
  const key =
    (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
    serverEnv()?.["SUPABASE_PUBLISHABLE_KEY"];
  return url && key ? { url: url.replace(/\/+$/, ""), key } : null;
}

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

/** Server-side requests go to the runtime URL of the same backend when it differs from the public one. */
function serverSupabaseUrl(publicUrl: string, key: string): string | undefined {
  if (typeof window !== "undefined") return undefined;
  const runtimeUrl = serverEnv()?.["SUPABASE_URL"]?.replace(/\/+$/, "");
  if (
    !runtimeUrl ||
    runtimeUrl === publicUrl ||
    serverEnv()?.["SUPABASE_PUBLISHABLE_KEY"] !== key
  ) {
    return undefined;
  }
  return runtimeUrl;
}

export function supabaseFetch(publicUrl: string, key: string): typeof fetch {
  const runtimeUrl = serverSupabaseUrl(publicUrl, key);
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    if (runtimeUrl) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.startsWith(`${publicUrl}/`)) {
        const target = runtimeUrl + url.slice(publicUrl.length);
        const request =
          typeof input === "string" || input instanceof URL ? target : new Request(target, input);
        return fetch(request, { ...init, headers });
      }
    }
    return fetch(input, { ...init, headers });
  };
}

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const env = readPublicEnv();
  if (!env) return null;

  if (typeof window === "undefined") {
    // One stateless client on the server: it never holds a user session.
    serverClient ??= createClient(env.url, env.key, {
      global: { fetch: supabaseFetch(env.url, env.key) },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    return serverClient;
  }

  browserClient ??= createClient(env.url, env.key, {
    global: { fetch: supabaseFetch(env.url, env.key) },
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return readPublicEnv() !== null;
}

/** Publishable settings for server code that needs its own short-lived client. */
export function publicSupabaseEnv(): PublicEnv | null {
  return readPublicEnv();
}
