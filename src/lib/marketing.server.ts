/**
 * Keeps Mailchimp in step with an account's stored email choice
 * (profiles.marketing_opt_in). Idempotent: safe to run on every sign-in,
 * after a survey and after every preference change; a failed sync is simply
 * tried again the next time one of those happens.
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
};

export async function reconcileForUser(
  userId: string,
  opts: { resubscribe?: boolean } = {},
): Promise<{ synced: boolean }> {
  const db = getSupabaseAdmin();
  if (!db || !mailchimpConfigured()) return { synced: false };

  const { data: profileData, error: profileError } = await db
    .from("profiles")
    .select("marketing_opt_in, mailchimp_synced_at, mailchimp_survey_tagged")
    .eq("id", userId)
    .maybeSingle();
  const profile = profileData as ProfileSyncRow | null;
  if (profileError || !profile) return { synced: false };

  const { data: userData } = await db.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (!email) return { synced: false };

  if (!profile.marketing_opt_in) {
    if (!profile.mailchimp_synced_at) return { synced: true };
    if (!(await mailchimpOptOut(email))) return { synced: false };
    await db
      .from("profiles")
      .update({ mailchimp_synced_at: null, mailchimp_survey_tagged: false })
      .eq("id", userId);
    return { synced: true };
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
  if (!(await mailchimpOptIn(email, tags, { resubscribe: Boolean(opts.resubscribe) }))) {
    return { synced: false };
  }
  await db
    .from("profiles")
    .update({
      mailchimp_synced_at: new Date().toISOString(),
      mailchimp_survey_tagged: hasSurvey || profile.mailchimp_survey_tagged,
      mailchimp_member: true,
    })
    .eq("id", userId);
  return { synced: true };
}
