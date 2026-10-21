import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { Resource } from "@/data/resources";
import type { InsightItem } from "@/lib/content";
import { recordResourceClick } from "@/lib/resource-clicks";
import { resourceHref } from "@/lib/utm";
import { cn } from "@/lib/utils";

/**
 * The "Useful Links" panel that ends every industry page: the resources Veer
 * tagged with the industry in his resources sheet (column F), in the sheet's
 * order, then any links added for the industry in /admin.
 */
export function UsefulLinks({
  resources,
  adminLinks,
  className,
}: {
  resources: Resource[];
  adminLinks: InsightItem[];
  className?: string;
}) {
  return (
    <section
      id="useful-links"
      aria-labelledby="useful-links-heading"
      className={cn(
        "scroll-mt-28 border border-border border-t-2 border-t-navy p-6 sm:p-8",
        className,
      )}
    >
      <h2 id="useful-links-heading" className="text-2xl font-semibold text-navy">
        Useful Links
      </h2>
      {resources.some((resource) => resource.affiliateUrl) ? (
        <p className="mt-3 text-sm leading-6 text-charcoal/70">
          Some links are referral links: FutureWise may be credited if you sign up through them.
        </p>
      ) : null}
      <ul className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <li key={resource.id}>
            <ExternalLink
              href={resourceHref(resource)}
              rel="noopener"
              onOpen={() => recordResourceClick(resource.id)}
            >
              {resource.name}
            </ExternalLink>
            <p className="text-sm leading-6 text-charcoal/65">{resource.category}</p>
          </li>
        ))}
        {adminLinks.map((item) =>
          item.link_url ? (
            <li key={item.id}>
              <ExternalLink href={item.link_url} rel="noopener noreferrer">
                {item.title}
              </ExternalLink>
              {item.summary ? (
                <p className="text-sm leading-6 text-charcoal/65">{item.summary}</p>
              ) : null}
            </li>
          ) : null,
        )}
      </ul>
      <Link to="/resources" className="text-link mt-8">
        Browse all resources
      </Link>
    </section>
  );
}

function ExternalLink({
  href,
  rel,
  onOpen,
  children,
}: {
  href: string;
  rel: string;
  onOpen?: () => void;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      onClick={onOpen}
      onAuxClick={onOpen}
      className="inline-block py-1 font-semibold text-navy underline decoration-navy/30 underline-offset-4 transition-colors hover:text-blue hover:decoration-blue"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
