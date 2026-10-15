/**
 * Keeps Mailchimp in step with an account's stored email choice
 * (profiles.marketing_opt_in). Idempotent: safe to run on every sign-in,
 * after a survey and after every preference change; a failed sync is simply
 * tried again the next time one of those happens.
 *
 * Two runs can overlap (a sign-in sync still talking to Mailchimp while the
 * person unticks "email me"). So after every Mailchimp call the stored choice
 * is read again, and a "no" that arrived in the meantime wins: the member is
 * unsubscribed again before anything is recorded as synced.
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
  mailchimp_synced_at: string | null;
  mailchimp_survey_tagged: boolean;
  mailchimp_member: boolean;
};

type Db = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

async function readProfile(db: Db, userId: string): Promise<ProfileSyncRow | null> {
  const { data, error } = await db
    .from("profiles")
    .select("marketing_opt_in, mailchimp_synced_at, mailchimp_survey_tagged, mailchimp_member")
    .eq("id", userId)
    .maybeSingle();
  return error ? null : ((data as ProfileSyncRow | null) ?? null);
}

/** Unsubscribes whatever this account may have put on the audience. */
async function optOut(db: Db, userId: string, email: string): Promise<{ synced: boolean }> {
  if (!(await mailchimpOptOut(email))) return { synced: false };
  await db
    .from("profiles")
    .update({ mailchimp_synced_at: null, mailchimp_survey_tagged: false })
    .eq("id", userId);
  return { synced: true };
}

export async function reconcileForUser(
  userId: string,
  opts: { resubscribe?: boolean } = {},
): Promise<{ synced: boolean }> {
  const db = getSupabaseAdmin();
  if (!db || !mailchimpConfigured()) return { synced: false };

  const profile = await readProfile(db, userId);
  if (!profile) return { synced: false };

  const { data: userData } = await db.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (!email) return { synced: false };

  if (!profile.marketing_opt_in) {
    // Nothing of ours on the audience: nothing to undo.
    if (!profile.mailchimp_member && !profile.mailchimp_synced_at) return { synced: true };
    return optOut(db, userId, email);
  }

  const { count } = await db
    .from("survey_responses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  const hasSurvey = (count ?? 0) > 0;
  const upToDate =
    Boolean(profile.mailchimp_synced_at) && (profile.mailchimp_survey_tagged || !hasSurvey);
  if (upToDate && !opts.resubscribe) return { synced: true };

  const tags: string[] = [MAILCHIMP_TAGS.account];
  if (hasSurvey) tags.push(MAILCHIMP_TAGS.survey);
  // Only an explicit choice on the Account page re-subscribes someone who
  // unsubscribed through an email link; sign-ins and surveys only add tags.
  const result = await mailchimpOptIn(email, tags, { resubscribe: Boolean(opts.resubscribe) });

  // A member now exists even if a later step failed: record it so an opt-out
  // or account deletion always reaches Mailchimp.
  if (result.member && !profile.mailchimp_member) {
    await db.from("profiles").update({ mailchimp_member: true }).eq("id", userId);
  }

  // The choice may have changed while Mailchimp was being called.
  const latest = await readProfile(db, userId);
  if (!latest) return { synced: false };
  if (!latest.marketing_opt_in) {
    if (!result.member) return { synced: true };
    await optOut(db, userId, email);
    return { synced: false };
  }

  if (!result.ok) return { synced: false };
  await db
    .from("profiles")
    .update({
      mailchimp_synced_at: new Date().toISOString(),
      mailchimp_survey_tagged: hasSurvey || latest.mailchimp_survey_tagged,
      mailchimp_member: true,
    })
    .eq("id", userId);
  return { synced: true };
}
