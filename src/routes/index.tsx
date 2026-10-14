import { Link, createFileRoute, getRouteApi } from "@tanstack/react-router";

import { FeaturedCarousel, type FeaturedItem } from "@/components/home/featured-carousel";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Button } from "@/components/ui/button";
import { industries, getIndustry } from "@/data/industries";
import { resourceSections, resources } from "@/data/resources";
import { site } from "@/data/site";
import { BLOG_CATEGORIES, INSIGHT_KINDS } from "@/lib/content-schema";
import {
  countByIndustry,
  formatDate,
  listPublishedInsights,
  listPublishedPosts,
  type InsightItem,
  type PostSummary,
} from "@/lib/content";
import { seo } from "@/lib/seo";

const rootApi = getRouteApi("__root__");

export const Route = createFileRoute("/")({
  loader: async () => {
    const [posts, insights] = await Promise.all([
      listPublishedPosts({ limit: 6 }),
      listPublishedInsights(),
    ]);
    return { posts, insights };
  },
  head: () => seo("/", `${site.name} — Practical knowledge for students in Oman`, site.description),
  component: Index,
});

const startingPoints = [
  {
    title: "Industry Insights",
    description:
      "Plain-language introductions to seven industries and the roles students can pursue within them.",
    to: "/industry-resources",
  },
  {
    title: "Personal Finance & Independent Living",
    description:
      "Notes on budgeting, household responsibilities, and the decisions that arrive after school.",
    to: "/blog",
  },
  {
    title: "Curated Student Resources",
    description: "A reviewed directory of career, finance, skills, and Oman-specific resources.",
    to: "/resources",
  },
];

const kindLabel = (kind: InsightItem["kind"]) =>
  INSIGHT_KINDS.find((entry) => entry.value === kind)?.label ?? "Insight";
const kindAction: Record<InsightItem["kind"], string> = {
  video: "Watch",
  course: "Open the material",
  guide: "Read the guide",
  link: "Open the link",
};
const categoryLabel = (slug: string) =>
  BLOG_CATEGORIES.find((category) => category.slug === slug)?.label ?? "Blog";

function featuredFrom(posts: PostSummary[], insights: InsightItem[]): FeaturedItem[] {
  const fromPosts = posts.map((post) => ({
    key: `post-${post.id}`,
    label: categoryLabel(post.category),
    title: post.title,
    summary: post.excerpt,
    to: `/blog/${post.slug}`,
    action: "Read the post",
    date: post.published_at ?? post.created_at,
  }));
  const fromInsights = insights.map((item) => ({
    key: `insight-${item.id}`,
    label: `${getIndustry(item.industry)?.name ?? "Industry Insights"} · ${kindLabel(item.kind)}`,
    title: item.title,
    summary: item.summary,
    to: `/industry-resources/${item.industry}`,
    hash: `item-${item.id}`,
    action: kindAction[item.kind],
    date: item.created_at,
  }));
  return [...fromPosts, ...fromInsights]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6)
    .map((item) => ({ ...item, date: formatDate(item.date) }));
}

function Index() {
  const { posts, insights } = Route.useLoaderData();
  const { integrations } = rootApi.useLoaderData();
  const featured = featuredFrom(posts, insights);
  const counts = countByIndustry(insights);
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="site-container grid gap-14 py-16 sm:py-20 lg:min-h-[38rem] lg:grid-cols-[1fr_0.85fr] lg:items-center lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-[1.08] text-navy sm:text-5xl lg:text-6xl">
              Practical knowledge for life beyond school.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-charcoal/80 sm:text-xl">
              FutureWise gives students aged 15–19 in Oman clear introductions to industries,
              personal finance, and the everyday responsibilities of independent adulthood.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="survey" size="lg" className="h-11">
                <Link to="/survey">Take the Survey</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 border-navy text-navy hover:bg-navy hover:text-primary-foreground"
              >
                <Link to="/industry-resources">Explore Industry Insights</Link>
              </Button>
            </div>
          </div>

          {featured.length > 0 ? (
            <FeaturedCarousel items={featured} />
          ) : (
            <div className="border-border lg:border-l lg:pl-10">
              <h2 className="text-sm font-semibold text-navy">What students can use now</h2>
              <ol className="mt-6 space-y-5">
                {startingPoints.map((point, index) => (
                  <li key={point.title} className="border-b border-border pb-5">
                    <Link to={point.to} className="group grid grid-cols-[2rem_1fr] gap-3">
                      <span className="text-sm text-blue">0{index + 1}</span>
                      <span>
                        <span className="block font-medium text-charcoal group-hover:text-blue">
                          {point.title}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-charcoal/70">
                          {point.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="insights-heading" className="bg-background py-20 sm:py-24">
        <div className="site-container">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 id="insights-heading" className="text-3xl font-semibold text-navy sm:text-4xl">
                Industry Insights
              </h2>
              <p className="mt-4 text-lg leading-7 text-charcoal/75">
                Plain-language introductions to seven industries and the roles students can pursue
                within them.
              </p>
            </div>
            <Link to="/industry-resources" className="text-link shrink-0">
              All industries
            </Link>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => {
              const count = counts[industry.slug] ?? 0;
              return (
                <li key={industry.slug}>
                  <Link
                    to="/industry-resources/$industry"
                    params={{ industry: industry.slug }}
                    className="card-flat flex h-full flex-col p-6"
                  >
                    <h3 className="text-lg font-semibold text-navy">{industry.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-charcoal/75">
                      {industry.description}
                    </p>
                    <p className="mt-auto pt-5 text-xs font-semibold text-blue">
                      {count > 0 ? `${count} ${count === 1 ? "item" : "items"}` : "Coming soon"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {latestPosts.length > 0 ? (
        <section aria-labelledby="blog-heading" className="bg-light-grey py-20 sm:py-24">
          <div className="site-container">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <h2 id="blog-heading" className="text-3xl font-semibold text-navy sm:text-4xl">
                Latest from the blog
              </h2>
              <Link to="/blog" className="text-link shrink-0">
                All posts
              </Link>
            </div>
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group flex h-full flex-col border border-border bg-background"
                  >
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.cover_image_alt}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    ) : null}
                    <div className="flex flex-1 flex-col p-6">
                      <span className="border-l-2 border-blue pl-3 text-xs font-semibold text-navy">
                        {categoryLabel(post.category)}
                      </span>
                      <h3 className="mt-4 text-lg font-semibold text-navy group-hover:text-blue">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 text-sm leading-6 text-charcoal/75">{post.excerpt}</p>
                      ) : null}
                      <p className="mt-auto pt-4 text-xs text-charcoal/60">
                        {formatDate(post.published_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="resources-heading"
        className="border-y border-border bg-background py-20 sm:py-24"
      >
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="max-w-xl">
            <h2 id="resources-heading" className="text-3xl font-semibold text-navy sm:text-4xl">
              Resources directory
            </h2>
            <p className="mt-4 text-lg leading-7 text-charcoal/75">
              Fifty-two external resources selected for students in Oman, covering career research,
              financial literacy, practical skills, and local opportunities.
            </p>
            <Link to="/resources" className="text-link mt-6">
              Browse all resources
            </Link>
          </div>
          <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {resourceSections.map((section) => {
              const count = resources.filter((resource) =>
                resource.sections.includes(section),
              ).length;
              return (
                <li key={section} className="bg-background">
                  <Link
                    to="/resources"
                    search={{ section }}
                    className="flex h-full min-h-28 flex-col justify-between p-6 hover:bg-light-blue"
                  >
                    <span className="font-semibold text-navy">{section}</span>
                    <span className="mt-3 text-sm text-charcoal/70">
                      {count} {count === 1 ? "resource" : "resources"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="vision-strip">
        <div className="site-container py-14 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold text-primary-foreground sm:text-3xl">
                Supporting Oman Vision 2040
              </h2>
              <p className="mt-4 leading-7 text-primary-foreground/85">
                FutureWise supports Oman Vision 2040 by helping students understand the industries,
                financial decisions, and practical responsibilities they will encounter after
                school.
              </p>
            </div>
            <Link
              to="/about"
              hash="vision-2040"
              className="inline-flex min-h-11 shrink-0 items-center text-base font-semibold text-light-blue underline-offset-4 hover:underline"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div
          className={
            integrations.newsletter
              ? "site-container grid gap-12 lg:grid-cols-2 lg:items-start"
              : "site-container text-center"
          }
        >
          <div className={integrations.newsletter ? "" : "mx-auto max-w-2xl"}>
            <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
              Which topics should FutureWise cover next?
            </h2>
            <p className="mt-4 text-lg leading-7 text-charcoal/75">
              Share the career, money, and independent-living questions you want answered. The
              survey takes less than two minutes.
            </p>
            <Button asChild variant="survey" size="lg" className="mt-8 h-11">
              <Link to="/survey">Take the Survey</Link>
            </Button>
          </div>
          {integrations.newsletter ? (
            <div className="border border-border border-t-2 border-t-navy p-7">
              <h2 className="text-xl font-semibold text-navy">Get new guides by email</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal/75">
                New Industry Insights and blog posts, straight to your inbox.
              </p>
              <div className="mt-5">
                <NewsletterForm />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
