/**
 * Keeps Mailchimp in step with an account's stored email choice
 * (profiles.marketing_opt_in). Idempotent: safe to run on every sign-in,
 * after a survey and after every preference change; a failed sync is simply
 * tried again the next time one of those happens.
 *
 * Runs can overlap (two tabs, or a sign-in sync still talking to Mailchimp
 * while the person changes their mind). Every change of the choice bumps
 * profiles.marketing_version (database trigger). A run records its result
 * only if the version is still the one it read; otherwise it goes round
 * again and applies the newest choice — even if the profile already looks
 * synced, because its own late Mailchimp call may have just undone it.
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
};

type Db = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

const SYNC_COLUMNS =
  "marketing_opt_in, marketing_version, mailchimp_member, mailchimp_synced_choice, mailchimp_survey_tagged";
const MAX_ROUNDS = 3;

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

export async function reconcileForUser(
  userId: string,
  opts: { resubscribe?: boolean } = {},
): Promise<{ synced: boolean }> {
  const db = getSupabaseAdmin();
  if (!db || !mailchimpConfigured()) return { synced: false };

  const { data: userData } = await db.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (!email) return { synced: false };

  // An explicit choice (or redoing work a late call undid) may re-subscribe.
  let force = Boolean(opts.resubscribe);

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const profile = await readProfile(db, userId);
    if (!profile) return { synced: false };
    const choice = profile.marketing_opt_in;
    const hasSurvey = choice ? await hasSurveyResponse(db, userId) : false;
    const upToDate =
      profile.mailchimp_synced_choice === choice &&
      (!choice || profile.mailchimp_survey_tagged || !hasSurvey);
    if (upToDate && !force) return { synced: true };

    let remoteOk: boolean;
    if (choice) {
      const tags: string[] = [MAILCHIMP_TAGS.account];
      if (hasSurvey) tags.push(MAILCHIMP_TAGS.survey);
      const result = await mailchimpOptIn(email, tags, { resubscribe: force });
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
            }
          : { mailchimp_synced_choice: null },
      )
      .eq("id", userId)
      .eq("marketing_version", profile.marketing_version)
      .select("id");
    if (error) return { synced: false };
    if (committed && committed.length > 0) return { synced: remoteOk };
    force = true;
  }
  return { synced: false };
}
