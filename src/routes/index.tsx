import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import blogCareerFinanceAsset from "@/assets/blog-career-finance.jpg.asset.json";
import blogBudgetingAsset from "@/assets/blog-budgeting-basics.jpg.asset.json";
import blogLifeSkillsAsset from "@/assets/blog-life-skills.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FutureWise | Build the practical knowledge school doesn't teach" },
      {
        name: "description",
        content:
          "FutureWise helps high school students in Oman aged 15-19 explore careers, industries, money, and independent adulthood.",
      },
      {
        property: "og:title",
        content: "FutureWise | Build the practical knowledge school doesn't teach",
      },
      {
        property: "og:description",
        content:
          "Practical career and life guidance for high school students in Oman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const offers = [
  {
    title: "Industry Cheat Sheets",
    description: "Plain-language introductions to seven industries and the roles students can pursue within them.",
    to: "/industry-resources" as const,
  },
  {
    title: "Personal Finance & Independent Living",
    description: "Notes on budgeting, household responsibilities, and the decisions that arrive after school.",
    to: "/living-independently-and-personal-finance" as const,
  },
  {
    title: "Curated Student Resources",
    description: "A reviewed directory of career, finance, skills, and Oman-specific resources.",
    to: "/resources" as const,
  },
  {
    title: "Take the Survey",
    description: "Tell FutureWise which decisions and responsibilities you want help understanding.",
    to: "/survey" as const,
  },
];

const posts = [
  {
    category: "Careers",
    title: "What does a career in finance actually look like?",
    excerpt: "A practical look at roles, skills, and pathways for students in Oman.",
    image: blogCareerFinanceAsset.url,
  },
  {
    category: "Money",
    title: "Budgeting basics before university",
    excerpt: "Simple habits that help you manage money confidently from day one.",
    image: blogBudgetingAsset.url,
  },
  {
    category: "Independence",
    title: "Life skills school doesn't cover",
    excerpt: "From paperwork to daily decisions: what to know before you leave home.",
    image: blogLifeSkillsAsset.url,
  },
];

function Index() {
  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="site-container grid gap-12 py-20 lg:min-h-[40rem] lg:grid-cols-[1fr_0.55fr] lg:items-end lg:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow">For students in Oman, aged 15-19</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-navy sm:text-5xl lg:text-6xl xl:text-7xl">
              Practical knowledge for life beyond school.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-charcoal/80 sm:text-xl">
              FutureWise gives students aged 15–19 in Oman clear introductions to industries,
              personal finance, and the everyday responsibilities of independent adulthood.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="survey" size="lg">
                <Link to="/survey">Take the Survey</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-navy text-navy hover:bg-navy hover:text-primary-foreground">
                <Link to="/industries">Explore Industries</Link>
              </Button>
            </div>
          </div>

          <div className="hidden border-l border-border pl-10 lg:block">
            <p className="text-sm font-semibold text-navy">What students can use now</p>
            <ol className="mt-8 space-y-6">
              {offers.slice(0, 3).map((offer, index) => (
                <li key={offer.title} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-border pb-5">
                  <span className="text-sm text-blue">0{index + 1}</span>
                  <span className="font-medium text-charcoal">{offer.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-background py-20 sm:py-24">
        <div className="site-container">
          <div className="max-w-2xl text-center sm:text-left">
            <p className="eyebrow">What we offer</p>
            <h2 className="mt-4 text-3xl font-semibold text-navy sm:text-4xl">
              Four starting points for students in Oman
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {offers.map(({ title, description, to }, index) => (
              <Link key={to} to={to} className="offer-card group">
                <span className="text-sm text-blue">0{index + 1}</span>
                <h3 className="mt-8 text-xl font-semibold text-navy">{title}</h3>
                <p className="mt-3 leading-7 text-charcoal/75">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue">
                  Learn more
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Oman Vision 2040 Strip */}
      <section className="vision-strip">
        <div className="site-container py-14 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Supporting Oman Vision 2040
              </h2>
              <p className="mt-4 leading-7 text-white/80">
                FutureWise empowers young Omanis with the knowledge, confidence, and practical skills
                they need to shape a capable, competitive, and future-ready generation.
              </p>
            </div>
            <Link
              to="/about"
              hash="vision-2040"
              className="shrink-0 text-base font-semibold text-teal underline-offset-4 hover:underline"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Latest from the Blog */}
      <section className="bg-light-grey py-20 sm:py-24">
        <div className="site-container">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Latest from the blog</p>
              <h2 className="mt-4 text-3xl font-semibold text-navy sm:text-4xl">
                Recent notes from FutureWise
              </h2>
            </div>
            <Button asChild variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
              <Link to="/blog">View all posts</Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(({ category, title, excerpt, image }) => (
              <Link key={title} to="/blog" className="blog-card group">
                <div className="blog-card-image">
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  <span className="border-l-2 border-blue pl-3 text-xs font-semibold text-navy">
                    {category}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-navy group-hover:text-blue">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-charcoal/70">{excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-background py-20 sm:py-24">
        <div className="site-container text-center">
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
              Which topics should FutureWise cover next?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-charcoal/75">
            Share the career, money, and independent-living questions you want answered. The
            survey takes less than two minutes.
          </p>
          <Button asChild variant="survey" size="lg" className="mt-8">
            <Link to="/survey">Take the Survey</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
