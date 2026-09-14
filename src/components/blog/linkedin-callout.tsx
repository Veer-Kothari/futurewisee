import { Linkedin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LINKEDIN_URL } from "@/data/blog-posts";

export function LinkedInCallout({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <aside className="rounded-card bg-light-blue p-6">
        <div className="flex size-11 items-center justify-center rounded-xl bg-background text-navy">
          <Linkedin aria-hidden="true" className="size-5" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-navy">
          Weekly career and finance tips
        </p>
        <p className="mt-2 text-sm leading-6 text-charcoal/80">
          Follow FutureWise on LinkedIn for bite-sized guidance for students in Oman.
        </p>
        <Button
          asChild
          className="mt-5 w-full rounded-full bg-teal text-navy hover:bg-teal/90"
        >
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer noopener">
            Follow on LinkedIn
          </a>
        </Button>
      </aside>
    );
  }

  return (
    <section className="rounded-card bg-light-blue p-8 sm:p-10">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background text-navy">
            <Linkedin aria-hidden="true" className="size-6" />
          </div>
          <p className="max-w-xl font-display text-xl font-semibold leading-8 text-navy">
            Follow FutureWise on LinkedIn for weekly bite-sized career and finance tips
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full bg-teal text-navy hover:bg-teal/90">
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer noopener">
            Visit our LinkedIn
          </a>
        </Button>
      </div>
    </section>
  );
}
