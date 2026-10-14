import { Link, createFileRoute } from "@tanstack/react-router";

import { industries } from "@/data/industries";
import { absoluteUrl } from "@/data/site";
import { countByIndustry, listPublishedInsights } from "@/lib/content";
import { pageTitle, seo } from "@/lib/seo";

const description =
  "Introductions to seven industries, their roles, and the routes students can take into them.";

export const Route = createFileRoute("/industry-resources/")({
  loader: async () => ({ counts: countByIndustry(await listPublishedInsights()) }),
  head: () =>
    seo("/industry-resources", pageTitle("Industry Insights"), description, {
      crumbs: [{ name: "Industry Insights", path: "/industry-resources" }],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Industry Insights",
          description,
          hasPart: industries.map((industry) => ({
            "@type": "WebPage",
            name: industry.name,
            url: absoluteUrl(`/industry-resources/${industry.slug}`),
          })),
        },
      ],
    }),
  component: IndustryInsightsPage,
});

function IndustryInsightsPage() {
  const { counts } = Route.useLoaderData();

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-24">
          <h1 className="text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">
            Industry Insights
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">{description}</p>
        </div>
      </section>

      <section className="site-container py-16 sm:py-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => {
            const count = counts[industry.slug] ?? 0;
            return (
              <li key={industry.slug}>
                <Link
                  to="/industry-resources/$industry"
                  params={{ industry: industry.slug }}
                  className="card-flat flex h-full flex-col"
                >
                  <h2 className="text-xl font-semibold text-navy">{industry.name}</h2>
                  <p className="mt-3 leading-7 text-charcoal/75">{industry.description}</p>
                  <p className="mt-auto pt-6 text-sm font-semibold text-blue">
                    {count > 0
                      ? `${count} ${count === 1 ? "video, guide or course" : "videos, guides and courses"}`
                      : "Material coming soon"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
