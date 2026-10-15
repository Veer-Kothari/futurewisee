import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { reconcileMarketing } from "@/lib/account.functions";
import { clearPendingClaim, readPendingClaim } from "@/lib/pending-claim";
import { getSupabase } from "@/lib/supabase/client";
import { claimSurveyResponse } from "@/lib/survey.functions";

export type Profile = {
  id: string;
  full_name: string;
  marketing_opt_in: boolean;
  age_confirmed: boolean;
  mailchimp_synced_at: string | null;
  created_at: string;
};

export type AuthStatus = "loading" | "unavailable" | "signed-out" | "signed-in";

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SIGNED_OUT: AuthState = {
  status: "signed-out",
  session: null,
  profile: null,
  isAdmin: false,
};

const SYNC_MARKER = "fw-mailchimp-synced-";
const syncsInFlight = new Set<string>();

/**
 * The Mailchimp sync after sign-in runs at most once per tab session per
 * account — but only a run that worked is remembered, so a failed one is
 * retried on the next sign-in. Two sign-in events at once share one run.
 */
async function syncMarketingOnce(userId: string) {
  let done = false;
  try {
    done = window.sessionStorage.getItem(SYNC_MARKER + userId) === "1";
  } catch {
    // Storage blocked: run it (the server skips when nothing changed).
  }
  if (done || syncsInFlight.has(userId)) return;
  syncsInFlight.add(userId);
  try {
    const result = await reconcileMarketing().catch(() => null);
    if (result?.ok && (result.synced || !result.configured)) {
      try {
        window.sessionStorage.setItem(SYNC_MARKER + userId, "1");
      } catch {
        // nothing to remember it in
      }
    }
  } finally {
    syncsInFlight.delete(userId);
  }
}

function clearSyncMarkers() {
  try {
    for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith(SYNC_MARKER)) window.sessionStorage.removeItem(key);
    }
  } catch {
    // nothing stored
  }
}

/**
 * Attaches an anonymous survey kept in this browser (only when it belongs to
 * this account's email), then syncs the email choice.
 */
async function afterSignIn(session: Session, profile: Profile | null) {
  const pending = readPendingClaim();
  if (pending && pending.email === (session.user.email ?? "").trim().toLowerCase()) {
    const result = await claimSurveyResponse({
      data: { id: pending.id, claimToken: pending.claimToken },
    }).catch(() => null);
    // Keep it for a retry only when the service was unreachable.
    if (result && (result.ok || result.reason === "not_found" || result.reason === "invalid")) {
      clearPendingClaim();
    }
  }
  if (profile && (profile.marketing_opt_in || profile.mailchimp_synced_at)) {
    await syncMarketingOnce(session.user.id);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    session: null,
    profile: null,
    isAdmin: false,
  });
  const queryClient = useQueryClient();
  const followedUp = useRef<string | null>(null);
  // Bumped by every sign-out: a load that was still waiting for the database
  // when the person signed out can never put the old session back.
  const signOuts = useRef(0);

  const load = useCallback(
    async (session: Session | null): Promise<{ current: boolean; profile: Profile | null }> => {
      const ticket = signOuts.current;
      const supabase = getSupabase();
      if (!supabase) {
        setState({ ...SIGNED_OUT, status: "unavailable" });
        return { current: true, profile: null };
      }
      if (!session) {
        setState(SIGNED_OUT);
        return { current: true, profile: null };
      }
      const [profileResult, rolesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, marketing_opt_in, age_confirmed, mailchimp_synced_at, created_at")
          .eq("id", session.user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
      ]);
      if (ticket !== signOuts.current) return { current: false, profile: null };
      const profile = (profileResult.data as Profile | null) ?? null;
      const roles = (rolesResult.data as { role: string }[] | null) ?? [];
      setState({
        status: "signed-in",
        session,
        profile,
        isAdmin: roles.some((row) => row.role === "admin"),
      });
      return { current: true, profile };
    },
    [],
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setState({ ...SIGNED_OUT, status: "unavailable" });
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) void load(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // supabase-js asks callers not to await its own calls inside this callback.
      window.setTimeout(() => {
        if (!active) return;
        if (event === "SIGNED_OUT") {
          signOuts.current += 1;
          followedUp.current = null;
          setState(SIGNED_OUT);
          return;
        }
        if (event === "TOKEN_REFRESHED") {
          setState((previous) =>
            previous.status === "signed-in" ? { ...previous, session } : previous,
          );
          return;
        }
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          void load(session).then(({ current, profile }) => {
            if (
              current &&
              event === "SIGNED_IN" &&
              session &&
              followedUp.current !== session.user.id
            ) {
              followedUp.current = session.user.id;
              void afterSignIn(session, profile);
            }
          });
        }
      }, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [load]);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    await load(data.session);
  }, [load]);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    signOuts.current += 1;
    clearPendingClaim();
    clearSyncMarkers();
    queryClient.clear();
    if (supabase) await supabase.auth.signOut().catch(() => undefined);
    followedUp.current = null;
    setState(SIGNED_OUT);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, refresh, signOut }),
    [state, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

/** Where Supabase's emailed links (confirm email, reset password) send people back to. */
export function authRedirectBase(siteUrl: string): string {
  if (typeof window === "undefined") return siteUrl;
  const origin = window.location.origin;
  const trusted =
    origin === siteUrl ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.(lovable\.app|lovableproject\.com)$/.test(origin);
  // Supabase also checks the address against its own allow list.
  return trusted ? origin : siteUrl;
}
