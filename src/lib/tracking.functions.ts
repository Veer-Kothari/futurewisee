import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { resources } from "@/data/resources";
import { attachAuthToken } from "@/lib/supabase/auth-attach";
import { resolveUser } from "@/lib/supabase/auth-resolve";

const knownResourceIds = new Set(resources.map((resource) => resource.id));

const Input = z.object({
  resourceId: z.string().regex(/^[a-z0-9-]{1,80}$/),
  path: z.string().max(200).optional(),
});

/**
 * Records one click on a resource link (which resource, the page, the time,
 * and the account when signed in). Never blocks the visitor: the link opens
 * in a new tab whatever this returns.
 */
export const trackResourceClick = createServerFn({ method: "POST" })
  .middleware([attachAuthToken, resolveUser])
  .inputValidator((data: unknown) => data)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const parsed = Input.safeParse(data);
    if (!parsed.success || !knownResourceIds.has(parsed.data.resourceId)) return { ok: false };

    const guard = await import("@/lib/guard.server");
    if (!guard.sameOrigin()) return { ok: false };
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const db = getSupabaseAdmin();
    if (!db) return { ok: false };

    try {
      if (await guard.overLimit("click", 120, 60)) return { ok: false };
      const path = parsed.data.path?.startsWith("/") ? parsed.data.path : null;
      const { error } = await db.from("resource_clicks").insert({
        resource_id: parsed.data.resourceId,
        user_id: context.userId,
        source_path: path,
      });
      return { ok: !error };
    } catch {
      return { ok: false };
    }
  });
