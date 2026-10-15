/**
 * Keeps Mailchimp in step with an account's stored email choice
 * (profiles.marketing_opt_in). Idempotent: safe to run on every sign-in,
 * after a survey and after every preference change; a failed sync is simply
 * tried again the next time one of those happens.
 *
 * Only one sync per account runs at a time (a short lease in the database),
 * so two Mailchimp calls for the same person never overlap. Every change of
 * the choice bumps profiles.marketing_version (database trigger): a round
 * records its result only for the version it read, otherwise it goes round
 * again with the newest choice. If the choice keeps changing until the rounds
 * run out, the recorded state is cleared so the next sync redoes it, and
 * after the lease is released the version is checked once more so a change
 * that arrived during the last moments is not left behind.
 *
 * An explicit "email me" sets mailchimp_resubscribe_pending: it re-subscribes
 * someone who had unsubscribed through an email link, and is retried until
 * Mailchimp confirms it. Plain sign-ins never re-subscribe on their own.
 */
import {
  MAILCHIMP_TAGS,
  mailchimpConfigured,
  mailchimpOptIn,
  mailchimpOptOut,
} from "@/lib/mailchimp.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin.server";

type ProfileSyncRow = {
  marketing_opt_in: boolean;
  marketing_version: number;
  mailchimp_member: boolean;
  mailchimp_synced_choice: boolean | null;
  mailchimp_survey_tagged: boolean;
  mailchimp_resubscribe_pending: boolean;
};

type Db = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

const SYNC_COLUMNS =
  "marketing_opt_in, marketing_version, mailchimp_member, mailchimp_synced_choice, mailchimp_survey_tagged, mailchimp_resubscribe_pending";
const MAX_ROUNDS = 3;
const LEASE_SECONDS = 90;

async function readProfile(db: Db, userId: string): Promise<ProfileSyncRow | null> {
  const { data, error } = await db
    .from("profiles")
    .select(SYNC_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  return error ? null : ((data as ProfileSyncRow | null) ?? null);
}

async function hasSurveyResponse(db: Db, userId: string): Promise<boolean> {
  const { count } = await db
    .from("survey_responses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return (count ?? 0) > 0;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Waits briefly for another sync of the same account to finish. */
async function acquireLease(db: Db, userId: string, owner: string): Promise<boolean> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, error } = await db.rpc("acquire_mailchimp_lock", {
      _user: userId,
      _owner: owner,
      _seconds: LEASE_SECONDS,
    });
    if (!error && data === true) return true;
    await pause(1500);
  }
  return false;
}

/** One serialized pass. Returns the version it confirmed (or null). */
async function syncRounds(
  db: Db,
  userId: string,
  email: string,
  explicit: boolean,
): Promise<{ synced: boolean; version: number | null }> {
  let force = explicit;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const profile = await readProfile(db, userId);
    if (!profile) return { synced: false, version: null };
    const choice = profile.marketing_opt_in;
    const resubscribe = choice && (force || profile.mailchimp_resubscribe_pending);
    const hasSurvey = choice ? await hasSurveyResponse(db, userId) : false;
    const upToDate =
      profile.mailchimp_synced_choice === choice &&
      !resubscribe &&
      (!choice || profile.mailchimp_survey_tagged || !hasSurvey);
    if (upToDate && !force) return { synced: true, version: profile.marketing_version };

    let remoteOk: boolean;
    if (choice) {
      const tags: string[] = [MAILCHIMP_TAGS.account];
      if (hasSurvey) tags.push(MAILCHIMP_TAGS.survey);
      const result = await mailchimpOptIn(email, tags, { resubscribe });
      // A member exists even if a later step failed: remember it, so an
      // opt-out or account deletion always reaches Mailchimp.
      if (result.member && !profile.mailchimp_member) {
        await db.from("profiles").update({ mailchimp_member: true }).eq("id", userId);
      }
      remoteOk = result.ok;
    } else if (!profile.mailchimp_member && profile.mailchimp_synced_choice === null) {
      remoteOk = true; // nothing of ours on the audience
    } else {
      remoteOk = await mailchimpOptOut(email);
    }

    // Record the outcome only if the choice is still the one this round applied.
    const { data: committed, error } = await db
      .from("profiles")
      .update(
        remoteOk
          ? {
              mailchimp_synced_choice: choice,
              mailchimp_synced_at: new Date().toISOString(),
              mailchimp_survey_tagged: choice
                ? hasSurvey || profile.mailchimp_survey_tagged
                : false,
              mailchimp_resubscribe_pending: false,
            }
          : // Failed: unknown remote state; an explicit re-subscribe stays pending.
            { mailchimp_synced_choice: null },
      )
      .eq("id", userId)
      .eq("marketing_version", profile.marketing_version)
      .select("id");
    if (error) return { synced: false, version: null };
    if (committed && committed.length > 0) {
      return { synced: remoteOk, version: profile.marketing_version };
    }
    force = true;
  }

  // The choice kept changing: don't trust the recorded state; the next sync redoes it.
  await db.from("profiles").update({ mailchimp_synced_choice: null }).eq("id", userId);
  return { synced: false, version: null };
}

export async function reconcileForUser(
  userId: string,
  opts: { resubscribe?: boolean } = {},
): Promise<{ synced: boolean }> {
  const db = getSupabaseAdmin();
  if (!db || !mailchimpConfigured()) return { synced: false };

  const { data: userData } = await db.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (!email) return { synced: false };

  let explicit = Boolean(opts.resubscribe);
  for (let pass = 0; pass < 2; pass++) {
    const owner = crypto.randomUUID();
    // Another sync of this account is running and will apply the newest choice.
    if (!(await acquireLease(db, userId, owner))) return { synced: false };
    let outcome: { synced: boolean; version: number | null };
    try {
      outcome = await syncRounds(db, userId, email, explicit);
    } finally {
      await db.rpc("release_mailchimp_lock", { _user: userId, _owner: owner });
    }
    // A change saved in the last moments (while another request was waiting
    // for the lease and gave up) is applied now instead of being left behind.
    const latest = await readProfile(db, userId);
    if (!latest || outcome.version === null || latest.marketing_version === outcome.version) {
      return { synced: outcome.synced };
    }
    explicit = true;
  }
  return { synced: false };
}
