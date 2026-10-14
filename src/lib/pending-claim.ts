/**
 * After an anonymous survey the browser keeps the response id, its one-time
 * claim token and the email of the account it belongs to, until that person
 * signs in (email confirmation can take a while). Only a sign-in with the
 * same email claims it, so on a shared computer the answers never attach to
 * someone else's account. Cleared after the claim, on sign-out and after 7 days.
 */
const KEY = "fw-pending-survey";
const MAX_AGE_MS = 7 * 86_400_000;

export type PendingClaim = { id: string; claimToken: string; email: string; savedAt: number };

export function savePendingClaim(id: string, claimToken: string, email: string) {
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ id, claimToken, email: email.trim().toLowerCase(), savedAt: Date.now() }),
    );
  } catch {
    // Storage blocked (private mode): the answers stay saved, just not linked.
  }
}

export function readPendingClaim(): PendingClaim | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<PendingClaim>;
    if (
      typeof value.id !== "string" ||
      typeof value.claimToken !== "string" ||
      typeof value.email !== "string" ||
      typeof value.savedAt !== "number" ||
      Date.now() - value.savedAt > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return {
      id: value.id,
      claimToken: value.claimToken,
      email: value.email,
      savedAt: value.savedAt,
    };
  } catch {
    return null;
  }
}

export function clearPendingClaim() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
