import { Link, createFileRoute } from "@tanstack/react-router";

import { resourceSections, resources, type Resource, type ResourceSection } from "@/data/resources";
import { recordResourceClick } from "@/lib/resource-clicks";
import { pageTitle, seo } from "@/lib/seo";
import { resourceHref } from "@/lib/utm";
import { cn } from "@/lib/utils";

type ResourceLogoAsset = {
  default: { url: string };
};

const resourceLogoModules = import.meta.glob<ResourceLogoAsset>(
  "/src/assets/resource-logos/*.asset.json",
  { eager: true },
);

const resourceLogos = Object.fromEntries(
  Object.entries(resourceLogoModules).map(([path, module]) => {
    const filename = path.split("/").at(-1) ?? "";
    const resourceId = filename.replace(/\.(?:png|ico)\.asset\.json$/, "");
    return [resourceId, module.default.url];
  }),
);

const description =
  "A curated directory of useful external sites for students and young people in Oman.";

function isSection(value: unknown): value is ResourceSection {
  return resourceSections.includes(value as ResourceSection);
}

export const Route = createFileRoute("/resources")({
  validateSearch: (search: Record<string, unknown>): { section?: ResourceSection } =>
    isSection(search["section"]) ? { section: search["section"] } : {},
  head: () =>
    seo("/resources", pageTitle("Resources"), description, {
      crumbs: [{ name: "Resources", path: "/resources" }],
    }),
  component: ResourcesPage,
});

const hasReferralLinks = resources.some((resource) => resource.affiliateUrl);

function ResourcesPage() {
  const { section } = Route.useSearch();
  const shown = section
    ? resources.filter((resource) => resource.sections.includes(section))
    : resources;

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-24">
          <h1 className="text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">Resources</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">
            Fifty-two external resources selected for students in Oman, covering career research,
            financial literacy, practical skills, and local opportunities.
          </p>
          {hasReferralLinks ? (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-charcoal/70">
              Some links are referral links: FutureWise may be credited if you sign up through them.
            </p>
          ) : null}
        </div>
      </section>

      <section className="bg-background pb-24 pt-4 sm:pb-28">
        <div className="site-container">
          <nav aria-label="Resource sections" className="flex flex-wrap gap-2 py-8">
            <SectionLink label="All" active={!section} />
            {resourceSections.map((entry) => (
              <SectionLink key={entry} label={entry} section={entry} active={section === entry} />
            ))}
          </nav>

          {shown.length === 0 ? (
            <p className="border border-border py-16 text-center text-charcoal/70">
              No resources in this section yet.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((resource) => (
                <li key={resource.id}>
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function SectionLink({
  label,
  section,
  active,
}: {
  label: string;
  section?: ResourceSection;
  active: boolean;
}) {
  return (
    <Link
      to="/resources"
      search={section ? { section } : {}}
      replace
      resetScroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-navy bg-navy text-primary-foreground"
          : "border-border bg-background text-charcoal hover:border-navy hover:text-navy",
      )}
    >
      {label}
    </Link>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const logoUrl = resourceLogos[resource.id];
  const visibleUrl = new URL(resource.url).hostname.replace(/^www\./, "");

  const onClick = () => recordResourceClick(resource.id);

  return (
    <article className="flex h-full flex-col border border-border bg-background p-6">
      <div className="flex items-center gap-4">
        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden border border-border bg-light-grey text-sm font-bold text-navy">
          <span aria-hidden="true">{resource.name.slice(0, 2).toUpperCase()}</span>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="absolute inset-0 size-full bg-background object-contain p-2"
              loading="lazy"
              // A logo that failed before the page became interactive never fires onError.
              ref={(image) => {
                if (image && image.complete && image.naturalWidth === 0) image.hidden = true;
              }}
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          ) : null}
        </div>
        <h2 className="min-w-0 text-lg font-semibold text-navy">{resource.name}</h2>
      </div>

      <p className="mt-5 flex-1 text-sm leading-6 text-charcoal/80">{resource.description}</p>

      <a
        href={resourceHref(resource)}
        target="_blank"
        rel="noopener"
        onClick={onClick}
        onAuxClick={onClick}
        className="text-link mt-6 w-fit"
        aria-label={`${resource.name}: ${visibleUrl} (opens in a new tab)`}
      >
        {visibleUrl}
      </a>
    </article>
  );
}
