import { Button } from "@/components/ui/button";
import { LINKEDIN_URL } from "@/data/blog-posts";

export function LinkedInCallout({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <aside className="rounded-sm border-l-2 border-blue bg-light-blue p-6">
        <p className="font-display text-lg font-semibold text-navy">
          FutureWise on LinkedIn
        </p>
        <p className="mt-2 text-sm leading-6 text-charcoal/80">
          Follow FutureWise on LinkedIn for bite-sized guidance for students in Oman.
        </p>
        <Button
          asChild
          className="mt-5 w-full"
        >
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer noopener">
            Follow on LinkedIn
          </a>
        </Button>
      </aside>
    );
  }

  return (
    <section className="rounded-sm border-l-2 border-blue bg-light-blue p-8 sm:p-10">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <p className="max-w-xl font-display text-xl font-semibold leading-8 text-navy">
            Follow FutureWise on LinkedIn for new student guides and project updates
          </p>
        </div>
        <Button asChild size="lg">
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer noopener">
            Visit our LinkedIn
          </a>
        </Button>
      </div>
    </section>
  );
}
