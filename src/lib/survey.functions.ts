import { createServerFn } from "@tanstack/react-start";

import { claimSchema, surveySubmissionSchema } from "@/lib/survey";
import { attachAuthToken } from "@/lib/supabase/auth-attach";
import { resolveUser } from "@/lib/supabase/auth-resolve";

export type SubmitSurveyResult =
  | { ok: true; id: string; claimToken: string | null }
  | { ok: false; reason: "invalid" | "busy" | "unavailable" | "error" };

export type ClaimResult =
  { ok: true } | { ok: false; reason: "invalid" | "not_found" | "unavailable" | "error" };

const CLAIM_WINDOW_MS = 7 * 86_400_000;

/**
 * Stores one survey response. Signed in → linked to the account. Visitor →
 * stored without a name or email, plus a one-time claim token (only its hash
 * is kept) so the answers can be attached to an account created or signed
 * into right after (email confirmation can take a while).
 */
export const submitSurvey = createServerFn({ method: "POST" })
  .middleware([attachAuthToken, resolveUser])
  .validator((data: unknown) => data)
  .handler(async ({ data, context }): Promise<SubmitSurveyResult> => {
    const parsed = surveySubmissionSchema.safeParse(data);
    if (!parsed.success) return { ok: false, reason: "invalid" };
    // Honeypot filled in: looks like success to the bot, nothing is stored.
    if (parsed.data.website) return { ok: true, id: crypto.randomUUID(), claimToken: null };

    const guard = await import("@/lib/guard.server");
    if (!guard.sameOrigin()) return { ok: false, reason: "invalid" };
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const db = getSupabaseAdmin();
    if (!db) return { ok: false, reason: "unavailable" };

    try {
      if (await guard.overLimit("survey", 10, 60)) return { ok: false, reason: "busy" };
      const userId = context.userId;
      const claimToken = userId ? null : guard.randomToken();
      const answers = parsed.data.answers;
      const { data: row, error } = await db
        .from("survey_responses")
        .insert({
          user_id: userId,
          source: answers.source,
          respondent_role: answers.role,
          industries: answers.industries,
          needs: answers.needs,
          confidence: answers.confidence,
          claim_token_hash: claimToken ? await guard.sha256Hex(claimToken) : null,
        })
        .select("id")
        .single();
      const id = (row as { id?: string } | null)?.id;
      if (error || !id) return { ok: false, reason: "error" };

      if (userId) {
        const { reconcileForUser } = await import("@/lib/marketing.server");
        await reconcileForUser(userId).catch(() => undefined);
      }
      return { ok: true, id, claimToken };
    } catch {
      return { ok: false, reason: "error" };
    }
  });

/** Attaches an anonymous response to the signed-in account (once, within 7 days). */
export const claimSurveyResponse = createServerFn({ method: "POST" })
  .middleware([attachAuthToken, resolveUser])
  .validator((data: unknown) => data)
  .handler(async ({ data, context }): Promise<ClaimResult> => {
    const parsed = claimSchema.safeParse(data);
    if (!parsed.success || !context.userId) return { ok: false, reason: "invalid" };

    const guard = await import("@/lib/guard.server");
    if (!guard.sameOrigin()) return { ok: false, reason: "invalid" };
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const db = getSupabaseAdmin();
    if (!db) return { ok: false, reason: "unavailable" };

    try {
      if (await guard.overLimit("claim", 20, 60)) return { ok: false, reason: "error" };
      const { data: rows, error } = await db
        .from("survey_responses")
        .update({ user_id: context.userId, claim_token_hash: null })
        .eq("id", parsed.data.id)
        .is("user_id", null)
        .eq("claim_token_hash", await guard.sha256Hex(parsed.data.claimToken))
        .gte("created_at", new Date(Date.now() - CLAIM_WINDOW_MS).toISOString())
        .select("id");
      if (error) return { ok: false, reason: "error" };
      if (!rows || rows.length === 0) return { ok: false, reason: "not_found" };

      const { reconcileForUser } = await import("@/lib/marketing.server");
      await reconcileForUser(context.userId).catch(() => undefined);
      return { ok: true };
    } catch {
      return { ok: false, reason: "error" };
    }
  });
