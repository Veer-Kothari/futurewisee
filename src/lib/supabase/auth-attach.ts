import { createMiddleware } from "@tanstack/react-start";

import { getSupabase } from "./client";

/**
 * Client half of the auth pair: sends the signed-in person's access token
 * with a server-function call. Used per function (with resolveUser), not
 * globally, so pages without accounts don't send tokens anywhere.
 */
export const attachAuthToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const supabase = getSupabase();
  let token: string | undefined;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
  }
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
