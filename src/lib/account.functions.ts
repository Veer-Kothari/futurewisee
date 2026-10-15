import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { attachAuthToken } from "@/lib/supabase/auth-attach";
import { resolveUser } from "@/lib/supabase/auth-resolve";

export type AccountResult =
  { ok: true } | { ok: false; reason: "invalid" | "unavailable" | "error" };

export type PreferenceResult =
  | {
      ok: true;
      /** Mailchimp already reflects the new choice. */
      synced: boolean;
      /** Mailchimp isn't connected: the choice is only stored. */
      configured: boolean;
    }
  | { ok: false; reason: "invalid" | "unavailable" | "error" };

const PreferenceInput = z.object({ optIn: z.boolean() });
const DeleteInput = z.object({ confirm: z.literal("DELETE") });

/**
 * The only way an account's email choice changes after sign-up: stores it,
 * then brings Mailchimp in line (an explicit "yes" also re-subscribes someone
 * who had unsubscribed through an email link).
 */
export const updateMarketingPreference = createServerFn({ method: "POST" })
  .middleware([attachAuthToken, resolveUser])
  .validator((data: unknown) => data)
  .handler(async ({ data, context }): Promise<PreferenceResult> => {
    const parsed = PreferenceInput.safeParse(data);
    if (!parsed.success || !context.userId) return { ok: false, reason: "invalid" };

    const guard = await import("@/lib/guard.server");
    if (!guard.sameOrigin()) return { ok: false, reason: "invalid" };
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const db = getSupabaseAdmin();
    if (!db) return { ok: false, reason: "unavailable" };

    try {
      if (await guard.overLimit("account", 30, 60, `user:${context.userId}`)) {
        return { ok: false, reason: "error" };
      }
      const { error } = await db
        .from("profiles")
        .update({
          marketing_opt_in: parsed.data.optIn,
          // An explicit "yes" may re-subscribe; it stays pending until Mailchimp confirms it.
          mailchimp_resubscribe_pending: parsed.data.optIn,
        })
        .eq("id", context.userId);
      if (error) return { ok: false, reason: "error" };

      const { reconcileForUser } = await import("@/lib/marketing.server");
      const { mailchimpConfigured } = await import("@/lib/mailchimp.server");
      const sync = await reconcileForUser(context.userId, { resubscribe: parsed.data.optIn }).catch(
        () => ({ synced: false }),
      );
      return { ok: true, synced: sync.synced, configured: mailchimpConfigured() };
    } catch {
      return { ok: false, reason: "error" };
    }
  });

/** Called after each sign-in: retries any Mailchimp sync that hasn't happened yet. */
export const reconcileMarketing = createServerFn({ method: "POST" })
  .middleware([attachAuthToken, resolveUser])
  .handler(
    async ({
      context,
    }): Promise<
      | { ok: true; synced: boolean; configured: boolean }
      | { ok: false; reason: "unavailable" | "error" }
    > => {
      if (!context.userId) return { ok: false, reason: "error" };
      const guard = await import("@/lib/guard.server");
      if (!guard.sameOrigin()) return { ok: false, reason: "error" };
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
      if (!getSupabaseAdmin()) return { ok: false, reason: "unavailable" };

      try {
        if (await guard.overLimit("account", 30, 60, `user:${context.userId}`)) {
          return { ok: false, reason: "error" };
        }
        const { reconcileForUser } = await import("@/lib/marketing.server");
        const { mailchimpConfigured } = await import("@/lib/mailchimp.server");
        const { synced } = await reconcileForUser(context.userId);
        return { ok: true, synced, configured: mailchimpConfigured() };
      } catch {
        return { ok: false, reason: "error" };
      }
    },
  );

/**
 * Deletes the account. The profile, roles and linked survey answers go with
 * it (database cascades); resource clicks stay without the account link. An
 * address this account added to Mailchimp is removed there too (best effort).
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([attachAuthToken, resolveUser])
  .validator((data: unknown) => data)
  .handler(async ({ data, context }): Promise<AccountResult> => {
    const parsed = DeleteInput.safeParse(data);
    if (!parsed.success || !context.userId) return { ok: false, reason: "invalid" };

    const guard = await import("@/lib/guard.server");
    if (!guard.sameOrigin()) return { ok: false, reason: "invalid" };
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const db = getSupabaseAdmin();
    if (!db) return { ok: false, reason: "unavailable" };

    try {
      if (await guard.overLimit("account", 30, 60, `user:${context.userId}`)) {
        return { ok: false, reason: "error" };
      }
      const { data: profile } = await db
        .from("profiles")
        .select("mailchimp_member, mailchimp_synced_choice")
        .eq("id", context.userId)
        .maybeSingle();
      const mailchimpState = profile as {
        mailchimp_member: boolean;
        mailchimp_synced_choice: boolean | null;
      } | null;
      if (mailchimpState?.mailchimp_member || mailchimpState?.mailchimp_synced_choice === true) {
        const { data: userData } = await db.auth.admin.getUserById(context.userId);
        const email = userData?.user?.email;
        if (email) {
          const { mailchimpDelete } = await import("@/lib/mailchimp.server");
          await mailchimpDelete(email).catch(() => false);
        }
      }
      const { error } = await db.auth.admin.deleteUser(context.userId);
      return error ? { ok: false, reason: "error" } : { ok: true };
    } catch {
      return { ok: false, reason: "error" };
    }
  });
