import type { AuthError } from "@supabase/supabase-js";
import { Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/data/site";
import { authRedirectBase } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

/** Friendly text for Supabase auth errors; never shows the raw message. */
export function authErrorMessage(error: AuthError | Error | null | undefined): string {
  const code = (error as AuthError | undefined)?.code ?? "";
  const status = (error as AuthError | undefined)?.status;
  if (code === "user_already_exists" || code === "email_exists") {
    return "An account with this email already exists. Log in instead.";
  }
  if (code === "weak_password") {
    return `Choose a stronger password: at least ${MIN_PASSWORD} characters and not a common one.`;
  }
  if (code === "invalid_credentials") return "That email and password don't match an account.";
  if (code === "email_not_confirmed")
    return "Confirm your email first: check your inbox for the link.";
  if (code === "same_password") return "Choose a password you haven't used here before.";
  if (code === "signup_disabled")
    return "New accounts are paused right now. Please try again later.";
  if (code.startsWith("over_") || status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (code === "unexpected_failure") {
    return "We couldn't create the account. Check the age confirmation box and try again.";
  }
  return "That didn't work. Please try again.";
}

type FieldErrors = Partial<Record<"name" | "email" | "password" | "age", string>>;

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

function FormAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className={cn(
        "text-sm",
        message ? "border-l-2 border-destructive pl-3 text-destructive" : "",
      )}
    >
      {message}
    </p>
  );
}

export type SignUpOutcome = { needsConfirmation: boolean; email: string };

/**
 * Create an account: name, email, password, the age confirmation (16+, or a
 * parent/guardian agreed — also enforced by the database) and an optional
 * email-updates choice. `beforeSignUp` lets the survey save its answers first.
 * `emailUpdates="included"` (Get Involved): signing up is joining the email
 * list, so the choice isn't offered and the page says so above the form.
 */
export function SignUpForm({
  submitLabel = "Create account",
  emailUpdates = "optional",
  beforeSignUp,
  onSuccess,
  onBusyChange,
  footer,
}: {
  submitLabel?: string;
  emailUpdates?: "optional" | "included";
  /** Tells the page while the form is saving, so other actions can wait. */
  onBusyChange?: (busy: boolean) => void;
  beforeSignUp?: () => Promise<{ ok: true } | { ok: false; message: string }>;
  onSuccess: (outcome: SignUpOutcome) => void;
  footer?: ReactNode;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(false);
  const [marketing, setMarketing] = useState(emailUpdates === "included");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  // If the form disappears mid-request (the page switches view), it's no longer busy.
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    age: useRef<HTMLInputElement>(null),
  };

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Enter your name.";
    else if (name.trim().length > 120) next.name = "Use 120 characters or fewer.";
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD) next.password = `Use at least ${MIN_PASSWORD} characters.`;
    if (!age) next.age = "Please confirm this to create an account.";
    return next;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError("");
    const first = (["name", "email", "password", "age"] as const).find((key) => found[key]);
    if (first) {
      setFormError("Please fix the highlighted fields.");
      refs[first].current?.focus();
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setFormError("Accounts aren't available right now. Please try again later.");
      return;
    }
    setBusy(true);
    try {
      if (beforeSignUp) {
        const ready = await beforeSignUp();
        if (!ready.ok) {
          setFormError(ready.message);
          return;
        }
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim(), age_confirmed: true, marketing_opt_in: marketing },
          emailRedirectTo: `${authRedirectBase(site.siteUrl)}/account?welcome=1`,
        },
      });
      if (error) {
        setFormError(authErrorMessage(error));
        return;
      }
      onSuccess({ needsConfirmation: !data.session, email: email.trim() });
    } catch {
      setFormError("That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const describedBy = (key: keyof FieldErrors) => (errors[key] ? `${id}-${key}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${id}-name`}>Name</Label>
        <Input
          ref={refs.name}
          id={`${id}-name`}
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy("name")}
          className="h-11"
        />
        <FieldError id={`${id}-name-error`} message={errors.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-email`}>Email</Label>
        <Input
          ref={refs.email}
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy("email")}
          className="h-11"
        />
        <FieldError id={`${id}-email-error`} message={errors.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-password`}>Create a password</Label>
        <Input
          ref={refs.password}
          id={`${id}-password`}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={`${id}-password-hint${errors.password ? ` ${id}-password-error` : ""}`}
          className="h-11"
        />
        <p id={`${id}-password-hint`} className="text-xs text-charcoal/65">
          At least {MIN_PASSWORD} characters.
        </p>
        <FieldError id={`${id}-password-error`} message={errors.password} />
      </div>

      <div className="space-y-1">
        <label
          htmlFor={`${id}-age`}
          className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-charcoal"
        >
          <input
            ref={refs.age}
            id={`${id}-age`}
            type="checkbox"
            checked={age}
            onChange={(event) => setAge(event.target.checked)}
            aria-invalid={Boolean(errors.age)}
            aria-describedby={describedBy("age")}
            className="mt-1 size-4 shrink-0 accent-[var(--navy)]"
          />
          <span>
            I am 16 or older, or my parent or guardian has agreed to me creating this account.
          </span>
        </label>
        <FieldError id={`${id}-age-error`} message={errors.age} />
      </div>
      {emailUpdates === "optional" ? (
        <label
          htmlFor={`${id}-marketing`}
          className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-charcoal/80"
        >
          <input
            id={`${id}-marketing`}
            type="checkbox"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[var(--navy)]"
          />
          <span>
            Optional: email me when new FutureWise resources are ready. I can stop at any time.
          </span>
        </label>
      ) : null}

      <p className="text-xs leading-5 text-charcoal/65">
        By creating an account you agree to the{" "}
        <Link to="/terms-of-use" className="underline">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link to="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>

      <FormAlert message={formError} />
      <Button type="submit" disabled={busy} className="h-11 w-full">
        {busy ? "Please wait…" : submitLabel}
      </Button>
      {footer}
    </form>
  );
}

export function LogInForm({
  submitLabel = "Log in",
  onSuccess,
  onBusyChange,
  footer,
}: {
  submitLabel?: string;
  /** Tells the page while the form is signing in, so other actions can wait. */
  onBusyChange?: (busy: boolean) => void;
  onSuccess: (signedIn: { email: string }) => void | Promise<void>;
  footer?: ReactNode;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  // If the form disappears mid-request (the page switches view), it's no longer busy.
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: FieldErrors = {};
    if (!EMAIL.test(email.trim())) found.email = "Enter a valid email address.";
    if (!password) found.password = "Enter your password.";
    setErrors(found);
    setFormError("");
    if (found.email || found.password) {
      setFormError("Please fix the highlighted fields.");
      (found.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setFormError("Accounts aren't available right now. Please try again later.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setFormError(authErrorMessage(error));
        return;
      }
      await onSuccess({ email: email.trim() });
    } catch {
      setFormError("That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${id}-email`}>Email</Label>
        <Input
          ref={emailRef}
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${id}-email-error` : undefined}
          className="h-11"
        />
        <FieldError id={`${id}-email-error`} message={errors.email} />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={`${id}-password`}>Password</Label>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-navy underline-offset-2 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Input
          ref={passwordRef}
          id={`${id}-password`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? `${id}-password-error` : undefined}
          className="h-11"
        />
        <FieldError id={`${id}-password-error`} message={errors.password} />
      </div>
      <FormAlert message={formError} />
      <Button type="submit" disabled={busy} className="h-11 w-full">
        {busy ? "Please wait…" : submitLabel}
      </Button>
      {footer}
    </form>
  );
}
