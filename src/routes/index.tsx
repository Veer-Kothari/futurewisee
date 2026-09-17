import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ClipboardList,
  FileText,
  Newspaper,
  WalletCards,
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
    icon: Briefcase,
    title: "Industry Cheat Sheets",
    description: "Quick, clear guides to different industries and careers in Oman.",
    to: "/industry-resources" as const,
  },
  {
    icon: WalletCards,
    title: "Personal Finance & Independent Living",
    description: "Build skills for money, decisions, and life beyond school.",
    to: "/living-independently-and-personal-finance" as const,
  },
  {
    icon: Building2,
    title: "Curated Student Resources",
    description: "Tools, reads, and links chosen specifically for students in Oman.",
    to: "/resources" as const,
  },
  {
    icon: ClipboardList,
    title: "Take the Survey",
    description: "Tell us what you need so we can build content that matters to you.",
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-light-blue">
        <div
          className="blob -right-24 -top-24 size-[28rem] lg:size-[36rem]"
          aria-hidden="true"
        />
        <div
          className="blob right-20 top-40 size-72 bg-teal opacity-30 lg:top-24"
          aria-hidden="true"
        />
        <div className="site-container relative grid items-center gap-12 py-20 lg:min-h-[44rem] lg:grid-cols-[1fr_0.55fr] lg:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow">For students in Oman, aged 15-19</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-navy sm:text-5xl lg:text-6xl xl:text-7xl">
              Build the practical knowledge school doesn't teach.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-charcoal/80 sm:text-xl">
              FutureWise helps high school students in Oman explore careers, industries, money,
              and what it means to live independently as a young adult.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="survey" size="lg">
                <Link to="/survey">Take the Survey</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-navy text-navy hover:bg-navy hover:text-white">
                <Link to="/industries">Explore Industries</Link>
              </Button>
            </div>
          </div>

          <div
            className="relative hidden min-h-[24rem] items-center justify-center lg:flex"
            aria-hidden="true"
          >
            <div className="relative w-full max-w-sm rounded-card bg-white p-8 shadow-soft">
              <div className="flex items-center gap-4">
                <span className="offer-card-icon">
                  <FileText aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <div className="h-2.5 w-32 rounded-full bg-navy" />
                  <div className="mt-2 h-2 w-20 rounded-full bg-light-blue" />
                </div>
              </div>
              <div className="mt-7 space-y-3">
                <div className="h-2 w-full rounded-full bg-light-grey" />
                <div className="h-2 w-5/6 rounded-full bg-light-grey" />
                <div className="h-2 w-4/5 rounded-full bg-light-grey" />
              </div>
              <div className="mt-8 flex gap-3">
                <span className="inline-block h-9 flex-1 rounded-lg bg-teal" />
                <span className="inline-block h-9 flex-1 rounded-lg border border-navy/20 bg-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-background py-20 sm:py-24">
        <div className="site-container">
          <div className="max-w-2xl text-center sm:text-left">
            <p className="eyebrow">What we offer</p>
            <h2 className="mt-4 text-3xl font-semibold text-navy sm:text-4xl">
              Practical guidance designed for students like you
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {offers.map(({ icon: Icon, title, description, to }) => (
              <Link key={to} to={to} className="offer-card group">
                <span className="offer-card-icon">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-navy">{title}</h3>
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
                Ideas, tips, and student stories
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
                  ) : (
                    <Newspaper aria-hidden="true" className="size-12 opacity-60" />
                  )}
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-light-blue px-3 py-1 text-xs font-semibold text-blue">
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
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-charcoal/75">
            Take our short survey and tell us what topics matter most to you. It takes less than
            two minutes.
          </p>
          <Button asChild variant="survey" size="lg" className="mt-8">
            <Link to="/survey">Take the Survey</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
