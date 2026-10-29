import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AccountsUnavailable } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/auth-forms";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";
import { useAuth } from "@/lib/auth";
import { pageTitle, seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * Get Involved: the sign-up page that grows the FutureWise community (tutor,
 * 29 Oct 2026: "capture emails and user sign ups", no survey). Copy from Veer's
 * "Get Involved - Capture Signups and Users" doc. Signing up here creates an
 * account and joins the Mailchimp list (double opt-in), which is where the drip
 * campaigns start; /admin → Sign-ups downloads the list as a spreadsheet.
 */
export const Route = createFileRoute("/get-involved")({
  head: () =>
    seo(
      "/get-involved",
      pageTitle("Get Involved"),
      "Sign up to FutureWise to get the latest industry guides, practical content and ways to get involved, for high school students in Oman.",
    ),
  component: GetInvolvedPage,
});

type Step = "intro" | "signup" | "check-email" | "done";

function GetInvolvedPage() {
  const auth = useAuth();
  const [step, setStep] = useState<Step>("intro");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to each new step's heading (not on the first render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const heading = (text: string) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="text-2xl font-semibold leading-snug text-navy outline-none sm:text-3xl"
    >
      {text}
    </h1>
  );

  return (
    <div className="flex flex-1 items-start justify-center bg-light-blue px-4 py-12 sm:py-16">
      <div className="w-full max-w-[34rem] border border-border bg-background p-6 sm:p-10">
        <div aria-hidden="true" className="mb-8 flex gap-1.5">
          <span className={cn("h-1 flex-1", step === "intro" ? "bg-navy" : "bg-blue")} />
          <span
            className={cn(
              "h-1 flex-1",
              step === "intro" ? "bg-border" : step === "signup" ? "bg-navy" : "bg-blue",
            )}
          />
        </div>

        {step === "intro" ? (
          <div className="space-y-6">
            {heading("Before we start.")}
            <p className="text-charcoal/80">
              FutureWise is a platform built for high school students in Oman. We're just getting
              started, so to stay in touch and get the latest industry guides, practical content and
              ways you can get involved, please use this form to sign up.
            </p>
            <p className="text-charcoal/80">
              Feel free to share this with your friends. If you are a partner, please reach out to
              us through the Partners team at{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-navy underline">
                {site.email}
              </a>
              .
            </p>
            <div className="flex justify-end pt-2">
              <Button type="button" className="h-11 px-8" onClick={() => setStep("signup")}>
                Next
              </Button>
            </div>
          </div>
        ) : step === "signup" ? (
          <div className="space-y-6">
            <div>
              {heading("Complete your sign up.")}
              <p className="mt-3 text-charcoal/80">
                By signing up, you acknowledge that you will receive updates and emails with
                FutureWise content, resources and partner information, in line with our{" "}
                <Link to="/privacy-policy" className="font-semibold text-navy underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            {auth.status === "unavailable" ? (
              <AccountsUnavailable />
            ) : auth.status === "signed-in" ? (
              <p className="border-l-2 border-blue bg-light-blue p-4 text-sm leading-6 text-navy">
                You're already signed up. Manage your email updates on{" "}
                <Link to="/account" className="font-semibold underline">
                  your account page
                </Link>
                .
              </p>
            ) : (
              <SignUpForm
                emailUpdates="included"
                submitLabel="Sign up"
                onSuccess={({ needsConfirmation }) =>
                  setStep(needsConfirmation ? "check-email" : "done")
                }
                footer={
                  <p className="border-t border-border pt-5 text-sm text-charcoal/80">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      search={{ redirect: "/account" }}
                      className="font-semibold text-navy underline-offset-2 hover:underline"
                    >
                      Log in
                    </Link>
                  </p>
                }
              />
            )}
            <button
              type="button"
              onClick={() => setStep("intro")}
              className="text-sm font-semibold text-navy underline-offset-2 hover:underline"
            >
              Back
            </button>
          </div>
        ) : step === "check-email" ? (
          <div className="space-y-6">
            {heading("Check your inbox.")}
            <p className="text-charcoal/80">
              We've sent you an email. Open the link in it to confirm your address and finish
              signing up. If it doesn't arrive in a few minutes, check your spam folder.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {heading("You're signed up.")}
            <p className="text-charcoal/80">
              Welcome to FutureWise. Look out for a short email asking you to confirm your email
              updates.
            </p>
            <Link to="/industry-resources" className="text-link">
              Explore Industry Insights
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
