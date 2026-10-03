import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { resourceSections, resources, type ResourceSection } from "@/data/resources";
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

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources | FutureWise" },
      { name: "description", content: "A curated directory of useful external sites for students and young people in Oman." },
      { property: "og:title", content: "Resources | FutureWise" },
      { property: "og:description", content: "A curated directory of useful external sites for students and young people in Oman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceSection | "All">("All");

  const filteredResources = useMemo(() => {
    if (activeCategory === "All") return resources;
    return resources.filter((resource) => resource.sections.includes(activeCategory));
  }, [activeCategory]);

  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="site-container py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow">Get Prepared</p>
            <h1 className="mt-5 text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">
              Resources
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">
              Fifty-two external resources selected for students in Oman, covering career
              research, financial literacy, practical skills, and local opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background pb-24 pt-4 sm:pb-28">
        <div className="site-container">
          <div className="flex flex-wrap gap-2 py-8">
            <FilterPill
              label="All"
              active={activeCategory === "All"}
              onClick={() => setActiveCategory("All")}
            />
            {resourceSections.map((category) => (
              <FilterPill
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="mt-12 rounded-sm border border-border bg-white py-16 text-center">
              <p className="text-charcoal/70">
                No resources in this category yet. Check back soon or explore another filter.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-navy bg-navy text-primary-foreground"
          : "border-border bg-white text-charcoal hover:border-navy hover:text-navy",
      )}
    >
      {label}
    </button>
  );
}

function ResourceCard({ resource }: { resource: (typeof resources)[number] }) {
  const logoUrl = resourceLogos[resource.id];
  const visibleUrl = new URL(resource.url).hostname.replace(/^www\./, "");

  return (
    <article className="flex flex-col rounded-sm border border-border bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-sm border border-border bg-light-grey text-sm font-bold text-navy">
          <span aria-hidden="true">{resource.name.slice(0, 2).toUpperCase()}</span>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={`${resource.name} logo`}
              className="absolute inset-0 size-full bg-white object-contain p-2"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-navy">{resource.name}</h2>
          <p className="mt-1 text-xs font-medium text-charcoal/60">{resource.category}</p>
        </div>
      </div>

      <p className="mt-5 flex-1 text-sm leading-6 text-charcoal/80">{resource.description}</p>

      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex w-fit items-center border-b border-navy pb-1 text-sm font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
        aria-label={`Visit ${resource.name} at ${visibleUrl} (opens in a new tab)`}
      >
        {visibleUrl}
        <span aria-hidden="true" className="ml-1.5">↗</span>
      </a>
    </article>
  );
}
