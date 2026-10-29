import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { Markdown } from "@/components/content/markdown";
import { VideoEmbed } from "@/components/content/video-embed";
import { UsefulLinks } from "@/components/industry/useful-links";
import { getIndustryArticle } from "@/content/industry-articles";
import { getIndustry, industries, type Industry } from "@/data/industries";
import { resourcesForIndustry } from "@/data/resources";
import { absoluteUrl, site } from "@/data/site";
import type { InsightKind } from "@/lib/content-schema";
import { formatDate, listPublishedInsights, type InsightItem } from "@/lib/content";
import { outlineHeadings, parseMarkdownLite } from "@/lib/markdown";
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
    const article = getIndustryArticle(industry.slug);
    const path = `/industry-resources/${industry.slug}`;
    return seo(path, pageTitle(industry.name), industry.description, {
      ...(article ? { type: "article" as const } : {}),
      crumbs: [
        { name: "Industry Insights", path: "/industry-resources" },
        { name: industry.name, path },
      ],
      jsonLd: [
        ...(article
          ? [
              {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: `${industry.name}: Industry Cheat Sheet`,
                description: industry.description,
                dateModified: article.updated,
                inLanguage: "en",
                about: industry.name,
                mainEntityOfPage: absoluteUrl(path),
                // The organisation, not a person: some authors are under 18.
                author: { "@type": "Organization", name: site.name, url: site.siteUrl },
                publisher: { "@id": `${site.siteUrl}/#organization` },
              },
            ]
          : []),
        ...items
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
      ],
    });
  },
  component: IndustryPage,
});

// Links added in /admin join the Useful Links panel instead of a section of their own.
const SECTIONS: Array<{ kind: Exclude<InsightKind, "link">; heading: string }> = [
  { kind: "video", heading: "Videos" },
  { kind: "course", heading: "Course material" },
  { kind: "guide", heading: "Guides" },
];

type ContentsEntry = { id: string; text: string };

function IndustryPage() {
  const { industry, items } = Route.useLoaderData();
  const article = getIndustryArticle(industry.slug);
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: items.filter((item) => item.kind === section.kind),
  })).filter((section) => section.items.length > 0);
  const contents: ContentsEntry[] = [
    ...(article ? outlineHeadings(parseMarkdownLite(article.markdown)) : []),
    ...sections.map(({ kind, heading }) => ({ id: `section-${kind}`, text: heading })),
    { id: "useful-links", text: "Useful Links" },
  ];
  const others = industries.filter((entry) => entry.slug !== industry.slug);

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-24">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-sm text-charcoal/65">
              <li>
                <Link to="/industry-resources" className="font-semibold text-navy hover:text-blue">
                  Industry Insights
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{industry.name}</li>
            </ol>
          </nav>
          <h1 className="mt-5 text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">
            {industry.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">
            {industry.description}
          </p>
          {article ? (
            <p className="mt-6 text-sm text-charcoal/65">
              Industry cheat sheet · Updated{" "}
              <time dateTime={article.updated}>{formatDate(article.updated)}</time>
            </p>
          ) : null}
        </div>
      </section>

      <div className="site-container py-16 sm:py-20">
        <div
          className={
            article
              ? "lg:grid lg:grid-cols-[minmax(0,46rem)_13rem] lg:justify-between lg:gap-16"
              : undefined
          }
        >
          {article ? (
            <nav
              aria-label="On this page"
              className="hidden lg:col-start-2 lg:row-start-1 lg:block"
            >
              <div className="sticky top-28">
                <p className="text-sm font-semibold text-navy">On this page</p>
                <Contents entries={contents} className="mt-4" />
              </div>
            </nav>
          ) : null}

          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            {article ? (
              <>
                <details className="mb-10 border-y border-border lg:hidden">
                  <summary className="cursor-pointer py-3 text-sm font-semibold text-navy">
                    On this page
                  </summary>
                  <Contents entries={contents} className="pb-4" />
                </details>
                <article aria-label={`${industry.name}: industry cheat sheet`}>
                  <Markdown source={article.markdown} anchors className="[&>h2:first-child]:mt-0" />
                </article>
              </>
            ) : sections.length === 0 ? (
              <ComingSoon industry={industry} />
            ) : null}

            {sections.map(({ kind, heading, items: sectionItems }) => (
              <section
                key={kind}
                id={`section-${kind}`}
                aria-labelledby={`section-${kind}-heading`}
                className="mt-16 scroll-mt-28 first:mt-0"
              >
                <h2
                  id={`section-${kind}-heading`}
                  className="text-2xl font-semibold text-navy sm:text-3xl"
                >
                  {heading}
                </h2>
                <ul
                  className={kind === "video" ? "mt-8 grid gap-8 md:grid-cols-2" : "mt-8 space-y-6"}
                >
                  {sectionItems.map((item) => (
                    <li key={item.id} id={`item-${item.id}`} className="scroll-mt-28">
                      <InsightCard item={item} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        {/* Full container width, outside the reading column, so the links fill the row. */}
        <UsefulLinks
          className="mt-16"
          resources={resourcesForIndustry(industry.slug)}
          adminLinks={items.filter((item) => item.kind === "link")}
        />

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

function Contents({ entries, className }: { entries: ContentsEntry[]; className?: string }) {
  return (
    <ol className={className}>
      {entries.map((entry) => (
        <li key={entry.id}>
          <a
            href={`#${entry.id}`}
            className="block border-l-2 border-border py-1.5 pl-3 text-sm leading-5 text-charcoal/75 hover:border-navy hover:text-navy"
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

function ComingSoon({ industry }: { industry: Industry }) {
  return (
    <section className="border border-border border-t-2 border-t-navy p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-navy">
        Material for {industry.name} is on its way
      </h2>
      <p className="mt-3 max-w-3xl leading-7 text-charcoal/75">
        The {industry.name} cheat sheet, videos and course material will appear here as soon as they
        are published. Tell FutureWise what you would like covered first.
      </p>
      <Link to="/survey" className="text-link mt-6">
        Get Involved
      </Link>
    </section>
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
