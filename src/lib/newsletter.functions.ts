import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
  /** Honeypot: a hidden field people never fill in. */
  website: z.string().max(200).optional(),
});

export type NewsletterResult =
  { ok: true } | { ok: false; reason: "invalid" | "busy" | "unavailable" | "error" };

/**
 * Newsletter sign-up → Kit as "inactive" (Kit emails a
 * confirmation link first). The answer is the same whether or not the
 * address was already on the list, so the form never reveals who is.
 */
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<NewsletterResult> => {
    const parsed = Input.safeParse(data);
    if (!parsed.success) return { ok: false, reason: "invalid" };
    if (parsed.data.website) return { ok: true };

    const guard = await import("@/lib/guard.server");
    if (!guard.sameOrigin()) return { ok: false, reason: "invalid" };
    const kit = await import("@/lib/kit.server");
    if (!kit.kitConfigured()) return { ok: false, reason: "unavailable" };

    try {
      if (await guard.overLimit("newsletter", 5, 15)) return { ok: false, reason: "busy" };
      // At most 3 confirmation emails a day to any one address, whoever asks.
      const emailKey = `email:${(await guard.sha256Hex(parsed.data.email)).slice(0, 40)}`;
      if (await guard.overLimit("newsletter", 3, 1440, emailKey)) return { ok: true };
      const { ok, refused } = await kit.kitOptIn(parsed.data.email, [kit.KIT_TAGS.website], {
        resubscribe: true,
      });
      // An address that unsubscribed earlier gets the same answer as any other.
      return ok || refused ? { ok: true } : { ok: false, reason: "error" };
    } catch {
      return { ok: false, reason: "error" };
    }
  });
