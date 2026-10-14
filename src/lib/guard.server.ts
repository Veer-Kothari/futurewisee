/**
 * Server-only helpers for the site's server functions: the client IP (never a
 * spoofable first X-Forwarded-For hop), a per-IP rate limit stored in the
 * database (in-memory counters don't survive across Workers isolates), an
 * origin check, and a pause before refusals.
 */
import { getRequest } from "@tanstack/react-start/server";

import { rateLimitAddress } from "@/lib/ip";
import { getSupabaseAdmin } from "@/lib/supabase/admin.server";

export type LimitKind = "survey" | "claim" | "click" | "newsletter" | "account";

export function clientIp(): string {
  const req = getRequest();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return rateLimitAddress(cf);
  const xff = req.headers.get("x-forwarded-for");
  const last = xff
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1);
  return rateLimitAddress(last || "unknown");
}

/** Same-origin requests only: browsers send Origin on these POSTs; scheme, host and port must match. */
export function sameOrigin(): boolean {
  const req = getRequest();
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const url = new URL(req.url);
    // Behind Cloudflare the request URL can say http while the visitor used https.
    const proto = req.headers.get("x-forwarded-proto");
    const self = `${proto ? `${proto}:` : url.protocol}//${url.host}`;
    const from = new URL(origin).origin;
    return from === self || from === url.origin;
  } catch {
    return false;
  }
}

/** Attempt rows (IP addresses) older than a day. The hourly database job does this too; this is the fallback. */
async function sweep() {
  const db = getSupabaseAdmin();
  if (!db) return;
  await db
    .from("rate_events")
    .delete()
    .lt("at", new Date(Date.now() - 86_400_000).toISOString());
}

/**
 * True when this connection (IPv4 address or IPv6 /64) — or the given key,
 * e.g. an account or an email hash — already has `max` attempts of this kind
 * in the last `minutes` (public.rate_attempt, one locked step that also
 * records an allowed attempt). Fails closed: a database error counts as over.
 */
export async function overLimit(
  kind: LimitKind,
  max: number,
  minutes: number,
  key?: string,
): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) return true;
  if (Math.random() < 0.05) await sweep().catch(() => undefined);
  const { data, error } = await db.rpc("rate_attempt", {
    p_kind: kind,
    p_ip: (key ?? clientIp()).slice(0, 100),
    p_max: max,
    p_minutes: minutes,
    p_record: true,
  });
  if (error || typeof data !== "boolean") return true;
  return data;
}

export const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** SHA-256 as lowercase hex (Web Crypto, available in Workers and Node). */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** 32 random bytes, base64url (43 characters). */
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
