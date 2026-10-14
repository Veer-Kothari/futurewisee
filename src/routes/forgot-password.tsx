import { Link, createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";

import { AccountsUnavailable, AuthCard } from "@/components/auth/auth-card";
import { authErrorMessage } from "@/components/auth/auth-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/data/site";
import { authRedirectBase, useAuth } from "@/lib/auth";
import { privateHead } from "@/lib/seo";
import { getSupabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => privateHead("Reset your password"),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { status } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: resetError } = await supabase.auth
      .resetPasswordForEmail(email.trim(), {
        redirectTo: `${authRedirectBase(site.siteUrl)}/reset-password`,
      })
      .catch((caught: Error) => ({ error: caught }));
    setBusy(false);
    // Same answer whether or not the address has an account.
    if (resetError && authErrorMessage(resetError).startsWith("Too many")) {
      setError(authErrorMessage(resetError));
      return;
    }
    setSent(true);
  }

  return (
    <AuthCard
      title="Reset your password"
      intro="Enter the email you signed up with and we'll send you a link to choose a new password."
    >
      {status === "unavailable" ? (
        <AccountsUnavailable />
      ) : sent ? (
        <div role="status" className="space-y-4">
          <p className="leading-7 text-charcoal/80">
            If an account uses that address, a reset link is on its way. Open it to choose a new
            password.
          </p>
          <Link to="/login" className="text-link">
            Go to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              ref={emailRef}
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "reset-email-error" : undefined}
              className="h-11"
            />
            {error ? (
              <p id="reset-email-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Sending…" : "Send the reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
