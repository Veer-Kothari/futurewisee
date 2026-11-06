import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { MIN_PASSWORD, authErrorMessage } from "@/components/auth/auth-forms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { privateHead } from "@/lib/seo";
import { getSupabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => privateHead("Choose a new password"),
  component: ResetPasswordPage,
});

type Phase = "checking" | "ready" | "expired" | "done";

/** Opened from the emailed reset link: Supabase signs the person in for recovery (PASSWORD_RECOVERY). */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setPhase("expired");
      return;
    }
    const recovering = /type=recovery/.test(window.location.hash);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPhase("ready");
    });
    // A recovery link that already signed in before this page mounted, or a stale one.
    const timer = window.setTimeout(async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setPhase((current) =>
        current !== "checking" ? current : sessionData.session && recovering ? "ready" : "expired",
      );
    }, 1500);
    return () => {
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters.`);
      passwordRef.current?.focus();
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(authErrorMessage(updateError));
      return;
    }
    setPhase("done");
    window.setTimeout(() => void navigate({ to: "/account", replace: true }), 1500);
  }

  if (phase === "expired") {
    return (
      <AuthCard title="This link has expired">
        <p className="leading-7 text-charcoal/80">
          Reset links work once and only for a short time. Ask for a new one.
        </p>
        <Link to="/forgot-password" className="text-link mt-6">
          Send a new reset link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      {phase === "checking" ? (
        <p role="status" className="text-charcoal/75">
          Checking your link…
        </p>
      ) : phase === "done" ? (
        <p role="status" className="text-charcoal/80">
          Your password has been changed. Taking you to your account…
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              ref={passwordRef}
              id="new-password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={`new-password-hint${error ? " new-password-error" : ""}`}
              className="h-11"
            />
            <p id="new-password-hint" className="text-xs text-charcoal/65">
              At least {MIN_PASSWORD} characters.
            </p>
            {error ? (
              <p id="new-password-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Saving…" : "Save new password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
