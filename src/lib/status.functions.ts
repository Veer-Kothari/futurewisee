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
    const env = typeof process !== "undefined" && process.env ? process.env : undefined;
    return {
      accounts:
        isSupabaseConfigured() &&
        Boolean(env?.["SUPABASE_URL"]) &&
        Boolean(env?.["SUPABASE_SERVICE_ROLE_KEY"]),
      newsletter: kitConfigured(),
    };
  },
);
