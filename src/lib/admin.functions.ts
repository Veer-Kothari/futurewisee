import { createServerFn } from "@tanstack/react-start";

import { attachAuthToken } from "@/lib/supabase/auth-attach";
import { resolveUser } from "@/lib/supabase/auth-resolve";

export type Signup = {
  name: string;
  email: string;
  signed_up: string;
  email_confirmed: boolean;
  email_updates: boolean;
};

export type SignupsResult =
  { ok: true; signups: Signup[] } | { ok: false; reason: "forbidden" | "unavailable" | "error" };

/** Most accounts one export reads (100 pages of Supabase's 1,000-user maximum). */
const MAX_PAGES = 100;

/**
 * Everyone who has signed up (Get Involved or Create an account), newest
 * first, for /admin → Sign-ups and its spreadsheet. Email addresses live in
 * auth.users, which only the service role can read, so the admin check is
 * done here against user_roles; the page's own check protects nothing.
 */
export const listSignups = createServerFn({ method: "POST" })
  .middleware([attachAuthToken, resolveUser])
  .handler(async ({ context }): Promise<SignupsResult> => {
    if (!context.userId) return { ok: false, reason: "forbidden" };
    const guard = await import("@/lib/guard.server");
    if (!guard.sameOrigin()) return { ok: false, reason: "forbidden" };
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const db = getSupabaseAdmin();
    if (!db) return { ok: false, reason: "unavailable" };

    try {
      const { data: role, error: roleError } = await db
        .from("user_roles")
        .select("id")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (roleError) return { ok: false, reason: "error" };
      if (!role) return { ok: false, reason: "forbidden" };
      if (await guard.overLimit("account", 30, 60, `signups:${context.userId}`)) {
        return { ok: false, reason: "error" };
      }

      const users: Array<{ id: string; email: string; created_at: string; confirmed: boolean }> =
        [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) return { ok: false, reason: "error" };
        for (const user of data.users) {
          users.push({
            id: user.id,
            email: user.email ?? "",
            created_at: user.created_at,
            confirmed: Boolean(user.email_confirmed_at),
          });
        }
        if (data.users.length < 1000) break;
      }

      const profiles = new Map<string, { full_name: string; marketing_opt_in: boolean }>();
      for (let from = 0; ; from += 1000) {
        const { data, error } = await db
          .from("profiles")
          .select("id, full_name, marketing_opt_in")
          .range(from, from + 999);
        if (error) return { ok: false, reason: "error" };
        for (const row of data as Array<{
          id: string;
          full_name: string;
          marketing_opt_in: boolean;
        }>) {
          profiles.set(row.id, row);
        }
        if (data.length < 1000) break;
      }

      const signups = users
        .map((user) => ({
          name: profiles.get(user.id)?.full_name ?? "",
          email: user.email,
          signed_up: user.created_at,
          email_confirmed: user.confirmed,
          email_updates: profiles.get(user.id)?.marketing_opt_in ?? false,
        }))
        .sort((a, b) => b.signed_up.localeCompare(a.signed_up));
      return { ok: true, signups };
    } catch {
      return { ok: false, reason: "error" };
    }
  });
