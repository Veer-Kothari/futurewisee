import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AccountsUnavailable, AuthCard, safeRedirect } from "@/components/auth/auth-card";
import { LogInForm } from "@/components/auth/auth-forms";
import { useAuth } from "@/lib/auth";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = safeRedirect(search["redirect"]);
    return redirect ? { redirect } : {};
  },
  head: () => privateHead("Log in"),
  component: LoginPage,
});

function LoginPage() {
  const { status } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "signed-in") void navigate({ to: redirect ?? "/account", replace: true });
  }, [status, redirect, navigate]);

  return (
    <AuthCard title="Log in" intro="Welcome back to FutureWise.">
      {status === "unavailable" ? (
        <AccountsUnavailable />
      ) : (
        <LogInForm
          onSuccess={() => navigate({ to: redirect ?? "/account", replace: true })}
          footer={
            <p className="border-t border-border pt-5 text-sm text-charcoal/80">
              New to FutureWise?{" "}
              <Link
                to="/signup"
                className="font-semibold text-navy underline-offset-2 hover:underline"
              >
                Create an account
              </Link>
            </p>
          }
        />
      )}
    </AuthCard>
  );
}
