/**
 * After an anonymous survey the browser keeps the response id and its
 * one-time claim token until the person signs in, so the answers can be
 * attached to their account (email confirmation can take a while). Cleared
 * after the claim, on sign-out, and after 7 days.
 */
const KEY = "fw-pending-survey";
const MAX_AGE_MS = 7 * 86_400_000;

export type PendingClaim = { id: string; claimToken: string; savedAt: number };

export function savePendingClaim(id: string, claimToken: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ id, claimToken, savedAt: Date.now() }));
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
      typeof value.savedAt !== "number" ||
      Date.now() - value.savedAt > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return { id: value.id, claimToken: value.claimToken, savedAt: value.savedAt };
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
