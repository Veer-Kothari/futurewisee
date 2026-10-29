import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AccountsUnavailable, AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/auth-forms";
import { useAuth } from "@/lib/auth";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () => privateHead("Create an account"),
  component: SignUpPage,
});

function SignUpPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [checkEmail, setCheckEmail] = useState(false);

  if (checkEmail) {
    return (
      <AuthCard title="Check your inbox">
        <p className="leading-7 text-charcoal/80">
          We've sent you an email. Open the link in it to confirm your address, then you can log in.
          If it doesn't arrive in a few minutes, check your spam folder.
        </p>
        <Link to="/login" className="text-link mt-6">
          Go to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create a free account"
      intro="Save your progress and hear when new resources are ready."
    >
      {status === "unavailable" ? (
        <AccountsUnavailable />
      ) : status === "signed-in" ? (
        <p className="text-charcoal/80">
          You're already signed in.{" "}
          <Link to="/account" className="font-semibold text-navy underline">
            Go to your account
          </Link>
        </p>
      ) : (
        <SignUpForm
          onSuccess={({ needsConfirmation }) => {
            if (needsConfirmation) setCheckEmail(true);
            else void navigate({ to: "/account", search: { welcome: 1 } });
          }}
          footer={
            <p className="border-t border-border pt-5 text-sm text-charcoal/80">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-navy underline-offset-2 hover:underline"
              >
                Log in
              </Link>
            </p>
          }
        />
      )}
    </AuthCard>
  );
}
