import { useId, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Email updates through Mailchimp (double opt-in). Only rendered when
 * Mailchimp is connected (see getIntegrationStatus).
 */
export function NewsletterForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const dark = tone === "dark";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    if (!consent) {
      setStatus("error");
      setMessage("Tick the box to agree to receive emails.");
      return;
    }
    setStatus("sending");
    setMessage("");
    const result = await subscribeNewsletter({
      data: { email: email.trim(), consent: true, website: honeypotRef.current?.value ?? "" },
    }).catch(() => null);
    if (result?.ok) {
      setStatus("done");
      setMessage("Almost done: check your inbox and confirm your email address.");
      setEmail("");
      setConsent(false);
      return;
    }
    setStatus("error");
    setMessage(
      result && !result.ok && result.reason === "busy"
        ? "Too many sign-ups from this connection. Please try again later."
        : "That didn't work. Please try again in a moment.",
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor={`${id}-email`} className={cn("sr-only")}>
            Email address
          </Label>
          <Input
            ref={emailRef}
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={cn(
              "h-11",
              dark &&
                "border-primary-foreground/40 bg-transparent text-primary-foreground placeholder:text-primary-foreground/60",
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={status === "sending"}
          variant={dark ? "secondary" : "default"}
          className="h-11 px-6"
        >
          {status === "sending" ? "Sending…" : "Get updates"}
        </Button>
      </div>
      {/* Honeypot: hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          ref={honeypotRef}
          id={`${id}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label
        htmlFor={`${id}-consent`}
        className={cn(
          "flex cursor-pointer items-start gap-3 text-sm leading-6",
          dark ? "text-primary-foreground/85" : "text-charcoal/80",
        )}
      >
        <input
          id={`${id}-consent`}
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[var(--navy)]"
        />
        <span>
          Email me new FutureWise guides and resources. I can unsubscribe at any time. Emails are
          sent with Mailchimp.
        </span>
      </label>
      <p
        role={status === "error" ? "alert" : "status"}
        className={cn(
          "min-h-6 text-sm",
          status === "error" ? (dark ? "text-primary-foreground" : "text-destructive") : "",
          status === "done" && (dark ? "text-primary-foreground" : "text-navy"),
        )}
      >
        {message}
      </p>
    </form>
  );
}
