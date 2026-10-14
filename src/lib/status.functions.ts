import { createServerFn } from "@tanstack/react-start";

export type IntegrationStatus = { accounts: boolean; newsletter: boolean };

/** Which optional services are connected, so pages can hide what isn't. Booleans only, never values. */
export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationStatus> => {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin.server");
    const { mailchimpConfigured } = await import("@/lib/mailchimp.server");
    const { isSupabaseConfigured } = await import("@/lib/supabase/client");
    return {
      accounts: isSupabaseConfigured() && getSupabaseAdmin() !== null,
      newsletter: mailchimpConfigured(),
    };
  },
);
