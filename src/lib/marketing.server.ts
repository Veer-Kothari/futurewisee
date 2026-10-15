/**
 * Keeps Mailchimp in step with an account's stored email choice
 * (profiles.marketing_opt_in). Safe to run any time; every run converges on
 * the newest choice, and anything left unfinished is redone by the next run
 * (sign-in, survey, claim or a preference change).
 *
 * The rules that keep it correct when runs overlap, fail or are cut off:
 * - One run per account at a time: a short lease in the database, renewed
 *   every round; only the lease holder may write the sync columns.
 * - Write first, then act: before any Mailchimp call the recorded state is set
 *   to "unknown" (and a possible member is recorded), so a run cut off half
 *   way always leaves "needs sync" behind, never a stale "synced".
 * - Confirm only what is current: a round records "synced" only for the
 *   choice version it read; a newer choice (profiles.marketing_version,
 *   bumped by a trigger) sends it round again.
 * - After the lease is released, a choice that changed meanwhile (from a
 *   request that couldn't get the lease) is applied before returning, and so
 *   is the tag for a survey saved meanwhile (it starts the drip).
 *
 * An explicit "email me" sets mailchimp_resubscribe_pending: it re-subscribes
 * someone who had unsubscribed through an email link, and is cleared as soon
 * as Mailchimp has applied it. Plain sign-ins never re-subscribe on their own.
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

export type ReconcileResult = {
  synced: boolean;
  deferred?: boolean;
  /** Mailchimp turned the subscription down; trying again won't help. */
  refused?: boolean;
};

const SYNC_COLUMNS =
  "marketing_opt_in, marketing_version, mailchimp_member, mailchimp_synced_choice, mailchimp_survey_tagged, mailchimp_resubscribe_pending";
/** Longer than one round (3 Mailchimp calls × 8 s + database calls); renewed every round. */
const LEASE_SECONDS = 45;
const MAX_ROUNDS = 3;
const MAX_PASSES = 3;
const DEADLINE_MS = 30_000;

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

type LeaseAnswer = "ok" | "busy" | "stop";

async function takeLease(db: Db, userId: string, owner: string): Promise<LeaseAnswer> {
  const { data, error } = await db.rpc("acquire_mailchimp_lock", {
    _user: userId,
    _owner: owner,
    _seconds: LEASE_SECONDS,
  });
  if (error) {
    console.error("[mailchimp sync] lease unavailable");
    return "stop";
  }
  if (data === true) return "ok";
  return data === false ? "busy" : "stop"; // null: no profile
}

/** Takes the lease, waiting a little for another run of the same account when allowed. */
async function acquireLease(
  db: Db,
  userId: string,
  owner: string,
  wait: boolean,
): Promise<LeaseAnswer> {
  const attempts = wait ? 5 : 1;
  for (let attempt = 1; ; attempt++) {
    const answer = await takeLease(db, userId, owner);
    if (answer !== "busy" || attempt >= attempts) return answer;
    await pause(1500);
  }
}

type PassResult = {
  synced: boolean;
  /** The choice version this pass confirmed, or null if nothing was confirmed. */
  version: number | null;
  /** Mailchimp itself refused or failed: running again now won't help. */
  remoteFailed: boolean;
  /** Mailchimp turned the subscription down for good (not a timeout or outage). */
  refused?: boolean;
  lostLease: boolean;
};

/** One pass under the lease: up to MAX_ROUNDS rounds, each confirming the version it read. */
async function syncPass(
  db: Db,
  userId: string,
  email: string,
  owner: string,
  /** Redo the Mailchimp side even if the profile looks synced. */
  redoFirst: boolean,
  /** An explicit "email me" in this request (also recorded as resubscribe_pending). */
  explicitResubscribe: boolean,
  startedAt: number,
): Promise<PassResult> {
  let redo = redoFirst;

  for (let round = 0; round < MAX_ROUNDS && Date.now() - startedAt < DEADLINE_MS; round++) {
    if (round > 0 && (await takeLease(db, userId, owner)) !== "ok") {
      return { synced: false, version: null, remoteFailed: false, lostLease: true };
    }
    const profile = await readProfile(db, userId);
    if (!profile) return { synced: false, version: null, remoteFailed: false, lostLease: false };
    const choice = profile.marketing_opt_in;
    // Only an explicit choice re-subscribes; a redo never does on its own.
    const resubscribe = choice && (explicitResubscribe || profile.mailchimp_resubscribe_pending);
    const hasSurvey = choice ? await hasSurveyResponse(db, userId) : false;
    const upToDate =
      profile.mailchimp_synced_choice === choice &&
      !resubscribe &&
      (!choice || profile.mailchimp_survey_tagged || !hasSurvey);
    if (upToDate && !redo) {
      return {
        synced: true,
        version: profile.marketing_version,
        remoteFailed: false,
        lostLease: false,
      };
    }

    const nothingRemote =
      !choice && !profile.mailchimp_member && profile.mailchimp_synced_choice === null;

    // Write first: until this round confirms, the remote state is unknown,
    // and an opt-in may create a member.
    if (!nothingRemote) {
      const { data: marked, error: markError } = await db
        .from("profiles")
        .update({ mailchimp_synced_choice: null, ...(choice ? { mailchimp_member: true } : {}) })
        .eq("id", userId)
        .eq("mailchimp_lock_owner", owner)
        .select("id");
      if (markError || !marked || marked.length === 0) {
        return { synced: false, version: null, remoteFailed: false, lostLease: true };
      }
    }

    let remoteOk = true;
    let refused = false;
    if (choice) {
      const tags: string[] = [MAILCHIMP_TAGS.account];
      if (hasSurvey) tags.push(MAILCHIMP_TAGS.survey);
      const result = await mailchimpOptIn(email, tags, { resubscribe });
      remoteOk = result.ok;
      refused = result.refused;
      // The re-subscribe has happened: never repeat it, even if tagging failed.
      if (result.statusDone && profile.mailchimp_resubscribe_pending) {
        await db
          .from("profiles")
          .update({ mailchimp_resubscribe_pending: false })
          .eq("id", userId)
          .eq("marketing_version", profile.marketing_version)
          .eq("mailchimp_lock_owner", owner);
      }
    } else if (!nothingRemote) {
      remoteOk = await mailchimpOptOut(email);
    }

    // Confirm only the version this round applied, and only while holding the lease.
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
              ...(choice ? { mailchimp_resubscribe_pending: false } : {}),
            }
          : { mailchimp_synced_choice: null },
      )
      .eq("id", userId)
      .eq("marketing_version", profile.marketing_version)
      .eq("mailchimp_lock_owner", owner)
      .select("id");
    if (error) return { synced: false, version: null, remoteFailed: false, lostLease: false };
    if (committed && committed.length > 0) {
      return {
        synced: remoteOk,
        version: profile.marketing_version,
        remoteFailed: !remoteOk,
        refused,
        lostLease: false,
      };
    }
    // The choice changed (or the lease was lost) meanwhile: go round with the newest one.
    redo = true;
  }
  return { synced: false, version: null, remoteFailed: false, lostLease: false };
}

export async function reconcileForUser(
  userId: string,
  opts: { resubscribe?: boolean; wait?: boolean } = {},
): Promise<ReconcileResult> {
  const db = getSupabaseAdmin();
  if (!db || !mailchimpConfigured()) return { synced: false };

  const { data: userData } = await db.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (!email) return { synced: false };

  const startedAt = Date.now();
  const owner = crypto.randomUUID();
  const explicitResubscribe = Boolean(opts.resubscribe);
  let redo = explicitResubscribe;

  for (let pass = 0; pass < MAX_PASSES && Date.now() - startedAt < DEADLINE_MS; pass++) {
    const lease = await acquireLease(db, userId, owner, opts.wait !== false);
    // Another run of this account is working and will apply the newest choice;
    // if it can't, the next sign-in or change does ("needs sync" stays recorded).
    if (lease === "busy") return { synced: false, deferred: true };
    if (lease === "stop") {
      // The answer may have been lost after the lease was taken: hand it back
      // (does nothing when this run doesn't hold it).
      await db.rpc("release_mailchimp_lock", { _user: userId, _owner: owner });
      return { synced: false };
    }

    let result: PassResult;
    try {
      result = await syncPass(db, userId, email, owner, redo, explicitResubscribe, startedAt);
    } finally {
      await db.rpc("release_mailchimp_lock", { _user: userId, _owner: owner });
    }
    if (result.remoteFailed) return { synced: false, refused: result.refused === true };

    // A change saved while this run held the lease is applied now, and so is
    // the tag for a survey saved meanwhile (its own sync couldn't get the lease).
    const latest = await readProfile(db, userId);
    if (!latest) return { synced: result.synced };
    const settled =
      result.version !== null &&
      latest.marketing_version === result.version &&
      latest.mailchimp_synced_choice === latest.marketing_opt_in &&
      !(latest.marketing_opt_in && latest.mailchimp_resubscribe_pending) &&
      !(
        latest.marketing_opt_in &&
        !latest.mailchimp_survey_tagged &&
        (await hasSurveyResponse(db, userId))
      );
    if (settled) return { synced: result.synced };
    redo = true;
  }
  return { synced: false, deferred: true };
}
