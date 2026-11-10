import { createServerFn } from "@tanstack/react-start";

export type IntegrationStatus = { accounts: boolean; newsletter: boolean };

/**
 * Which optional services are connected, so pages can hide what isn't.
 * Only checks that settings exist (booleans, never values); calls no API and
 * creates no client.
 */
export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationStatus> => {
    const { kitConfigured } = await import("@/lib/kit.server");
    const { isSupabaseConfigured } = await import("@/lib/supabase/client");
    const { adminConfigured } = await import("@/lib/supabase/admin.server");
    return {
      accounts: isSupabaseConfigured() && adminConfigured(),
      // The sign-up limits live in the database: without the service-role
      // settings every sign-up would be refused, so the form stays hidden.
      newsletter: kitConfigured() && adminConfigured(),
    };
  },
);
