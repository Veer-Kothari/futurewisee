/**
 * Kit (formerly ConvertKit) V4 API, server only. Secrets in Lovable Cloud:
 *   KIT_API_KEY  a V4 API key (Kit → Settings → Developer)
 *   KIT_FORM_ID  the id of a form with double opt-in turned on
 * Unset → kitConfigured() is false, the newsletter form stays hidden and
 * account choices are only stored in profiles.marketing_opt_in.
 *
 * New subscribers start as "inactive". Adding them to the form makes Kit email
 * a confirmation link, and they only become "active" once they click it (double
 * opt-in), which matters for an audience of 15–19 year olds.
 *
 * Every step uses the id and state the create call returns (checked live: they
 * are the real state), not Kit's email lookup, which can lag by minutes. The
 * form step runs last, so a failed tag can't send a second confirmation email.
 *
 * Kit's API can't do two things Mailchimp's could (checked on a live account):
 * - Re-subscribe: once someone unsubscribes they stay "cancelled", so an
 *   explicit new "email me" comes back as `refused`.
 * - Delete: unsubscribing keeps the record; a full delete is done in Kit's
 *   dashboard.
 */
const BASE = "https://api.kit.com/v4";
/** Kit requires this when adding to a form by id; it is only shown in Kit's reports. */
const REFERRER = "https://futurewiseapp.org/";

type Config = { key: string; formId: string };
type Answer = { status: number; ok: boolean; json: Record<string, unknown> | null };

export const KIT_TAGS = {
  website: "website-signup",
  account: "account",
  survey: "survey-completed",
} as const;

function config(): Config | null {
  const env = typeof process !== "undefined" && process.env ? process.env : undefined;
  const key = env?.["KIT_API_KEY"]?.trim();
  const formId = env?.["KIT_FORM_ID"]?.trim();
  if (!key || !formId || !/^\d+$/.test(formId)) return null;
  return { key, formId };
}

export function kitConfigured(): boolean {
  return config() !== null;
}

/**
 * Kit turned the request down (a 4xx answer other than a timeout or rate
 * limit): for example an invalid API key, a lapsed plan or a wrong form id.
 */
const rejectedStatus = (status: number) =>
  status >= 400 && status < 500 && status !== 408 && status !== 429;

/**
 * One Kit API request. Never throws: a timeout or network failure comes back
 * as status 0, so a caller that already created a subscriber still knows it.
 */
async function call(cfg: Config, method: string, path: string, body?: unknown): Promise<Answer> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "X-Kit-Api-Key": cfg.key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body === undefined ? null : JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { status: 0, ok: false, json: null };
  }
  // No email or key here: only which kind of request failed and how.
  if (rejectedStatus(response.status)) {
    console.error(`[kit] ${method} request rejected: HTTP ${response.status}`);
  }
  let json: Record<string, unknown> | null = null;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    json = null;
  }
  return { status: response.status, ok: response.status >= 200 && response.status < 300, json };
}

const normalise = (email: string) => email.trim().toLowerCase();

function subscriberOf(answer: Answer): { id: number; state: string } | null {
  const subscriber = answer.json?.["subscriber"] as { id?: unknown; state?: unknown } | undefined;
  return typeof subscriber?.id === "number" && typeof subscriber.state === "string"
    ? { id: subscriber.id, state: subscriber.state }
    : null;
}

/** Tag ids by name, kept while this server instance lives. */
const tagIds = new Map<string, number>();

/** Creating a tag is safe to repeat: Kit returns the existing one for the same name. */
async function tagId(cfg: Config, name: string): Promise<number | null> {
  const known = tagIds.get(name);
  if (known !== undefined) return known;
  const created = await call(cfg, "POST", "/tags", { name });
  const id = (created.json?.["tag"] as { id?: unknown } | undefined)?.id;
  if (!created.ok || typeof id !== "number") return null;
  tagIds.set(name, id);
  return id;
}

async function addTag(cfg: Config, name: string, subscriberId: number): Promise<boolean> {
  const id = await tagId(cfg, name);
  if (id === null) return false;
  const tagged = await call(cfg, "POST", `/tags/${id}/subscribers/${subscriberId}`, {});
  // The tag may have been deleted in Kit's dashboard: look it up again next time.
  if (tagged.status === 404) tagIds.delete(name);
  return tagged.ok;
}

export type OptInResult = {
  /** A subscriber exists for this address (true even if a later step failed or a reply was lost). */
  member: boolean;
  /** The subscriber is active or waiting to confirm now, whatever happened with the tags. */
  statusDone: boolean;
  /** Every step worked. */
  ok: boolean;
  /** This address unsubscribed, bounced or complained: the API can't reactivate it. */
  refused: boolean;
  /** Kit rejected the request itself (key, plan or form id), so it affects every address. */
  rejected: boolean;
};

/**
 * Makes sure the address is on the list. Tags come first, then an unconfirmed
 * address joins the form, which makes Kit send the confirmation email. Active →
 * unchanged. Cancelled, bounced or complained → left alone, and `refused` if this
 * was an explicit new choice (`resubscribe`).
 */
export async function kitOptIn(
  rawEmail: string,
  tags: string[],
  opts: { resubscribe: boolean },
): Promise<OptInResult> {
  const cfg = config();
  const none = { member: false, statusDone: false, ok: false, refused: false, rejected: false };
  if (!cfg) return none;

  const created = await call(cfg, "POST", "/subscribers", {
    email_address: normalise(rawEmail),
    state: "inactive",
  });
  const subscriber = subscriberOf(created);
  if (!subscriber) {
    // No answer at all: the subscriber may have been created anyway, so count it
    // (an extra unsubscribe later is harmless; a missed one isn't).
    return { ...none, member: created.status === 0, rejected: rejectedStatus(created.status) };
  }
  const member = { ...none, member: true };

  const unconfirmed = subscriber.state === "inactive";
  if (!unconfirmed && subscriber.state !== "active" && opts.resubscribe) {
    return { ...member, refused: true };
  }

  const statusDone = subscriber.state === "active";
  for (const name of tags) {
    if (!(await addTag(cfg, name, subscriber.id))) return { ...member, statusDone };
  }

  if (unconfirmed) {
    const added = await call(cfg, "POST", `/forms/${cfg.formId}/subscribers/${subscriber.id}`, {
      referrer: REFERRER,
    });
    if (!added.ok) return { ...member, rejected: rejectedStatus(added.status) };
    return { ...member, statusDone: true, ok: true };
  }
  return { ...member, statusDone, ok: true };
}

/**
 * Unsubscribes an address this site added. If it somehow wasn't added, this
 * records it as already unsubscribed and sends nothing.
 */
export async function kitOptOut(rawEmail: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  const found = await call(cfg, "POST", "/subscribers", {
    email_address: normalise(rawEmail),
    state: "cancelled",
  });
  // Kit won't accept this address at all, so no subscriber can exist for it.
  if (found.status === 422) return true;
  const subscriber = subscriberOf(found);
  if (!subscriber) return false;
  if (subscriber.state === "cancelled") return true;
  const result = await call(cfg, "POST", `/subscribers/${subscriber.id}/unsubscribe`, {});
  return result.ok || result.status === 404;
}

/**
 * For account deletion when this site never added the address itself (it may
 * have joined through the newsletter form): unsubscribes it only if it's there,
 * so people who were never on the list don't get a record.
 */
export async function kitOptOutIfListed(rawEmail: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  const email = encodeURIComponent(normalise(rawEmail));
  const found = await call(cfg, "GET", `/subscribers?email_address=${email}&status=all`);
  if (!found.ok) return false;
  const list = found.json?.["subscribers"] as { id?: unknown; state?: unknown }[] | undefined;
  const first = list?.[0];
  if (!first || first.state === "cancelled") return true;
  const result = await call(cfg, "POST", `/subscribers/${String(first.id)}/unsubscribe`, {});
  return result.ok || result.status === 404;
}
