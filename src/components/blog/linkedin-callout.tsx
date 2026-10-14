import { Button } from "@/components/ui/button";
import { site } from "@/data/site";

export function LinkedInCallout({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <aside className="border-l-2 border-blue bg-light-blue p-6">
        <p className="font-display text-lg font-semibold text-navy">FutureWise on LinkedIn</p>
        <p className="mt-2 text-sm leading-6 text-charcoal/80">
          Follow FutureWise on LinkedIn and join our LinkedIn Community.
        </p>
        <Button asChild className="mt-5 h-11 w-full">
          <a href={site.linkedinUrl} target="_blank" rel="noopener noreferrer">
            LinkedIn Community
          </a>
        </Button>
      </aside>
    );
  }

  return (
    <section className="border-l-2 border-blue bg-light-blue p-8 sm:p-10">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl font-display text-xl font-semibold leading-8 text-navy">
          Follow FutureWise on LinkedIn and join our LinkedIn Community
        </p>
        <Button asChild size="lg" className="h-11">
          <a href={site.linkedinUrl} target="_blank" rel="noopener noreferrer">
            LinkedIn Community
          </a>
        </Button>
      </div>
    </section>
  );
}
