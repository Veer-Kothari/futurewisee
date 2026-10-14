import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { Markdown } from "@/components/content/markdown";
import { VideoEmbed } from "@/components/content/video-embed";
import { getIndustry, industries } from "@/data/industries";
import type { InsightKind } from "@/lib/content-schema";
import { listPublishedInsights, type InsightItem } from "@/lib/content";
import { pageTitle, seo } from "@/lib/seo";

export const Route = createFileRoute("/industry-resources/$industry")({
  loader: async ({ params }) => {
    const industry = getIndustry(params.industry);
    if (!industry) throw notFound();
    return { industry, items: await listPublishedInsights(industry.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: pageTitle("Page not found") }, { name: "robots", content: "noindex" }],
      };
    const { industry, items } = loaderData;
    const path = `/industry-resources/${industry.slug}`;
    return seo(path, pageTitle(industry.name), industry.description, {
      crumbs: [
        { name: "Industry Insights", path: "/industry-resources" },
        { name: industry.name, path },
      ],
      jsonLd: items
        .filter((item) => item.kind === "course" || item.kind === "guide")
        .map((item) => ({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: item.title,
          ...(item.summary ? { description: item.summary } : {}),
          learningResourceType: item.kind === "course" ? "Course material" : "Guide",
          educationalLevel: "High school",
          inLanguage: "en",
          about: industry.name,
        })),
    });
  },
  component: IndustryPage,
});

const SECTIONS: Array<{ kind: InsightKind; heading: string }> = [
  { kind: "video", heading: "Videos" },
  { kind: "course", heading: "Course material" },
  { kind: "guide", heading: "Guides" },
  { kind: "link", heading: "Links" },
];

function IndustryPage() {
  const { industry, items } = Route.useLoaderData();
  const others = industries.filter((entry) => entry.slug !== industry.slug);

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-24">
          <h1 className="text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">{industry.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">
            {industry.description}
          </p>
        </div>
      </section>

      <div className="site-container py-16 sm:py-20">
        {items.length === 0 ? (
          <section className="max-w-2xl border border-border border-t-2 border-t-navy p-8">
            <h2 className="text-2xl font-semibold text-navy">
              Material for {industry.name} is on its way
            </h2>
            <p className="mt-3 leading-7 text-charcoal/75">
              Videos, course material and guides for this industry will appear here as soon as they
              are published. Tell FutureWise what you would like covered first.
            </p>
            <Link to="/survey" className="text-link mt-6">
              Take the Survey
            </Link>
          </section>
        ) : (
          <div className="space-y-16">
            {SECTIONS.map(({ kind, heading }) => {
              const sectionItems = items.filter((item) => item.kind === kind);
              if (sectionItems.length === 0) return null;
              return (
                <section key={kind} aria-labelledby={`section-${kind}`}>
                  <h2
                    id={`section-${kind}`}
                    className="text-2xl font-semibold text-navy sm:text-3xl"
                  >
                    {heading}
                  </h2>
                  <ul
                    className={
                      kind === "video" ? "mt-8 grid gap-8 md:grid-cols-2" : "mt-8 space-y-6"
                    }
                  >
                    {sectionItems.map((item) => (
                      <li key={item.id} id={`item-${item.id}`} className="scroll-mt-28">
                        <InsightCard item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <nav aria-label="Other industries" className="mt-20 border-t border-border pt-10">
          <h2 className="text-lg font-semibold text-navy">Other industries</h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {others.map((entry) => (
              <li key={entry.slug}>
                <Link
                  to="/industry-resources/$industry"
                  params={{ industry: entry.slug }}
                  className="text-link"
                >
                  {entry.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

function InsightCard({ item }: { item: InsightItem }) {
  if (item.kind === "video") {
    return (
      <article>
        {item.video_url ? <VideoEmbed url={item.video_url} title={item.title} /> : null}
        <h3 className="mt-4 text-lg font-semibold text-navy">{item.title}</h3>
        {item.summary ? (
          <p className="mt-2 text-sm leading-6 text-charcoal/75">{item.summary}</p>
        ) : null}
      </article>
    );
  }

  return (
    <article className="border border-border p-6 sm:p-8">
      <h3 className="text-xl font-semibold text-navy">{item.title}</h3>
      {item.summary ? <p className="mt-3 leading-7 text-charcoal/75">{item.summary}</p> : null}
      {item.kind === "guide" && item.body ? <Markdown source={item.body} className="mt-6" /> : null}
      {item.kind !== "guide" && (item.file_url || item.link_url) ? (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {item.file_url ? (
            <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-link">
              {item.file_name ? `Open ${item.file_name}` : "Open the material"}
            </a>
          ) : null}
          {item.link_url ? (
            <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="text-link">
              {item.kind === "course" ? "Go to the course" : "Open the link"}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
