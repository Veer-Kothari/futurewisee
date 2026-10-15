/**
 * Mailchimp Marketing API (server only). Secrets in Lovable Cloud:
 *   MAILCHIMP_API_KEY      e.g. "abc123…-us21" (the part after "-" is the data centre)
 *   MAILCHIMP_AUDIENCE_ID  the audience (list) id
 * Unset → mailchimpConfigured() is false, the newsletter form stays hidden
 * and account choices are only stored in profiles.marketing_opt_in.
 *
 * New members are added as "pending": Mailchimp emails them a confirmation
 * link first (double opt-in), which matters for an audience of 15–19 year olds.
 * The drip after the survey is a Mailchimp Customer Journey that starts when
 * the "survey-completed" tag is added.
 */
import { md5Hex } from "@/lib/md5";

type Config = { base: string; audience: string; auth: string };

export const MAILCHIMP_TAGS = {
  website: "website-signup",
  account: "account",
  survey: "survey-completed",
} as const;

function config(): Config | null {
  const env = typeof process !== "undefined" && process.env ? process.env : undefined;
  const key = env?.["MAILCHIMP_API_KEY"]?.trim();
  const audience = env?.["MAILCHIMP_AUDIENCE_ID"]?.trim();
  if (!key || !audience) return null;
  const dc = key.split("-").at(-1) ?? "";
  if (!/^[a-z]{2}\d{1,3}$/.test(dc) || !/^[A-Za-z0-9]+$/.test(audience)) return null;
  return {
    base: `https://${dc}.api.mailchimp.com/3.0/lists/${audience}/members`,
    audience,
    auth: `Basic ${btoa(`futurewise:${key}`)}`,
  };
}

export function mailchimpConfigured(): boolean {
  return config() !== null;
}

/**
 * One Mailchimp API request. Never throws: a timeout or network failure comes
 * back as status 0, so a caller that already created a member still knows it.
 */
async function call(
  cfg: Config,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; ok: boolean; json: Record<string, unknown> | null }> {
  let response: Response;
  try {
    response = await fetch(`${cfg.base}${path}`, {
      method,
      headers: { Authorization: cfg.auth, "Content-Type": "application/json" },
      body: body === undefined ? null : JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { status: 0, ok: false, json: null };
  }
  let json: Record<string, unknown> | null = null;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    json = null;
  }
  return { status: response.status, ok: response.status >= 200 && response.status < 300, json };
}

const memberPath = (email: string) => `/${md5Hex(email.trim().toLowerCase())}`;

/**
 * Makes sure the address is on the audience: new → pending (Mailchimp asks
 * them to confirm); subscribed or pending → unchanged; unsubscribed, cleaned
 * or archived → pending again only with `resubscribe` (an explicit new
 * choice), otherwise left alone. Then adds the tags.
 *
 * `member` says whether a member exists for this address afterwards — true
 * even when a later step (tags) failed, so the caller can still record it and
 * unsubscribe or delete it later. `ok` is true only when every step worked.
 */
export async function mailchimpOptIn(
  email: string,
  tags: string[],
  opts: { resubscribe: boolean },
): Promise<{ member: boolean; ok: boolean }> {
  const cfg = config();
  if (!cfg) return { member: false, ok: false };
  const path = memberPath(email);
  const current = await call(cfg, "GET", path);
  const status = typeof current.json?.["status"] === "string" ? current.json["status"] : null;

  if (current.status === 404) {
    const created = await call(cfg, "PUT", path, {
      email_address: email.trim().toLowerCase(),
      status_if_new: "pending",
    });
    // No answer at all: the member may have been created anyway, so count it
    // (an extra unsubscribe or delete later is harmless; a missed one isn't).
    if (!created.ok) return { member: created.status === 0, ok: false };
  } else if (!current.ok || !status) {
    return { member: false, ok: false };
  } else if (status !== "subscribed" && status !== "pending" && opts.resubscribe) {
    const updated = await call(cfg, "PATCH", path, { status: "pending" });
    if (!updated.ok) return { member: true, ok: false };
  }

  if (tags.length) {
    const tagged = await call(cfg, "POST", `${path}/tags`, {
      tags: tags.map((name) => ({ name, status: "active" })),
    });
    if (!tagged.ok) return { member: true, ok: false };
  }
  return { member: true, ok: true };
}

/** Unsubscribes an existing member; a missing member counts as done. */
export async function mailchimpOptOut(email: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  const path = memberPath(email);
  const result = await call(cfg, "PATCH", path, { status: "unsubscribed" });
  return result.ok || result.status === 404;
}

/** Permanently removes the address (account deletion). A missing member counts as done. */
export async function mailchimpDelete(email: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  const result = await call(cfg, "POST", `${memberPath(email)}/actions/delete-permanent`);
  return result.ok || result.status === 404;
}
