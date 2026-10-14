import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { reportLovableError } from "@/lib/lovable-error-reporting";

const onwardLinks = [
  { label: "Industry Insights", to: "/industry-resources" },
  { label: "Blog", to: "/blog" },
  { label: "Resources", to: "/resources" },
] as const;

function OnwardLinks() {
  return (
    <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
      {onwardLinks.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className="inline-flex min-h-6 border-b border-navy pb-0.5 text-sm font-semibold text-navy hover:border-blue hover:text-blue"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 404 inside the site layout (header and footer stay, so there's always a way on). */
export function NotFoundState() {
  return (
    <section className="page-intro">
      <div className="site-container py-20 sm:py-28">
        <p className="text-sm font-semibold text-blue">404</p>
        <h1 className="mt-4 text-4xl font-bold text-navy sm:text-5xl">Page not found</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-charcoal/80">
          This page doesn't exist or has moved. These sections are a good place to continue:
        </p>
        <OnwardLinks />
      </div>
    </section>
  );
}

/** A page that failed to load, inside the site layout. Never shows the raw error text. */
export function RouteErrorState({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "route_error_component" });
  }, [error]);

  return (
    <section className="page-intro">
      <div className="site-container py-20 sm:py-28">
        <h1 className="text-3xl font-bold text-navy sm:text-4xl">This page didn't load</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-charcoal/80">
          Something went wrong on our side. Try again, or continue to another section.
        </p>
        <Button
          type="button"
          className="mt-8 h-11"
          onClick={() => {
            void router.invalidate();
            reset();
          }}
        >
          Try again
        </Button>
        <OnwardLinks />
      </div>
    </section>
  );
}
