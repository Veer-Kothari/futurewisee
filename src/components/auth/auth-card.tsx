import type { ReactNode } from "react";

/** The squared panel every sign-in page sits in. */
export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 justify-center bg-light-blue px-4 py-12 sm:py-16">
      <div className="w-full max-w-[30rem] border border-border border-t-2 border-t-navy bg-background p-6 sm:p-10">
        <h1 className="text-2xl font-semibold leading-snug text-navy sm:text-3xl">{title}</h1>
        {intro ? <div className="mt-3 text-charcoal/80">{intro}</div> : null}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export function AccountsUnavailable() {
  return (
    <p className="border-l-2 border-blue bg-light-blue p-4 text-sm leading-6 text-navy">
      Accounts aren't available right now. Please try again later.
    </p>
  );
}

/** Only same-site paths are accepted as a place to return to after signing in. */
export function safeRedirect(value: unknown): string | undefined {
  return typeof value === "string" && /^\/(?![/\\])[A-Za-z0-9/_\-?=&#.]*$/.test(value)
    ? value
    : undefined;
}
