import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FutureWise | Build your future with confidence" },
      {
        name: "description",
        content: "FutureWise helps high school students in Oman explore careers, personal finance, and independent living.",
      },
      { property: "og:title", content: "FutureWise | Build your future with confidence" },
      {
        property: "og:description",
        content: "Practical career and life guidance for high school students in Oman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const pathways = [
    {
      icon: Compass,
      title: "Explore industries",
      text: "Discover what different careers involve and where they could take you.",
      to: "/industry-resources" as const,
    },
    {
      icon: WalletCards,
      title: "Prepare for independence",
      text: "Build practical knowledge for money, decisions, and life beyond school.",
      to: "/living-independently-and-personal-finance" as const,
    },
    {
      icon: BookOpen,
      title: "Use practical tools",
      text: "Turn ideas into next steps with resources designed for students in Oman.",
      to: "/tools-and-resources" as const,
    },
  ];

  return (
    <>
      <section className="hero-gradient overflow-hidden">
        <div className="site-container grid min-h-[34rem] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">For students in Oman</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.08] text-navy sm:text-6xl lg:text-7xl">
              Build your future with confidence.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-charcoal/80 sm:text-xl">
              Clear, practical guidance for exploring careers, managing money, and preparing for
              life beyond school.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="lg">
                <Link to="/tools-and-resources">
                  Explore resources <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">About FutureWise</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden min-h-80 lg:block" aria-hidden="true">
            <div className="absolute inset-8 rounded-card border border-navy/10 bg-background/80 shadow-soft backdrop-blur-sm" />
            <div className="absolute left-0 top-20 w-52 rounded-card bg-background p-6 shadow-soft">
              <Compass className="size-8 text-blue" />
              <div className="mt-8 h-2 w-24 rounded-full bg-teal" />
              <div className="mt-3 h-2 w-36 rounded-full bg-light-blue" />
            </div>
            <div className="absolute bottom-7 right-0 w-60 rounded-card bg-navy p-7 shadow-soft">
              <BookOpen className="size-8 text-teal" />
              <div className="mt-9 h-2 w-28 rounded-full bg-primary-foreground/80" />
              <div className="mt-3 h-2 w-40 rounded-full bg-primary-foreground/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="eyebrow">Start exploring</p>
            <h2 className="mt-4 text-3xl font-semibold text-navy sm:text-4xl">
              Practical knowledge for what comes next
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pathways.map(({ icon: Icon, title, text, to }) => (
              <Link key={to} to={to} className="resource-card group">
                <span className="flex size-12 items-center justify-center rounded-xl bg-light-blue text-blue">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-7 text-xl font-semibold text-navy">{title}</h3>
                <p className="mt-3 leading-7 text-charcoal/75">{text}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue">
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
    </>
  );
}
