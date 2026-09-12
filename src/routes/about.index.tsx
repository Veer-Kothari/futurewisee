import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about/")({
  head: () => ({
    meta: [
      { title: "About FutureWise | FutureWise" },
      {
        name: "description",
        content:
          "Meet the team behind FutureWise, learn about the project, and see how we support Oman Vision 2040.",
      },
      { property: "og:title", content: "About FutureWise | FutureWise" },
      {
        property: "og:description",
        content:
          "Meet the team behind FutureWise, learn about the project, and see how we support Oman Vision 2040.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const tabs = [
  { id: "project", label: "The Project" },
  { id: "team", label: "The Team" },
  { id: "vision-2040", label: "Oman Vision 2040" },
];

const team = [
  {
    name: "Amna Al-Rashidiya",
    role: "Founder & Project Lead",
    bio: "Amna started FutureWise to bridge the gap between school curricula and real-world readiness for students in Oman. She oversees strategy, partnerships, and content direction.",
  },
  {
    name: "Youssef Al-Mamari",
    role: "Content & Research Lead",
    bio: "Youssef researches careers, industries, and student pathways, then turns complex topics into clear, practical guides that young people can act on.",
  },
  {
    name: "Sara Al-Balushi",
    role: "Personal Finance Editor",
    bio: "Sara makes money topics approachable for students, covering budgeting, saving, and the financial decisions that come with independence.",
  },
  {
    name: "Khalid Al-Saadi",
    role: "Industry Insights Editor",
    bio: "Khalid interviews professionals and maps out what different industries actually look like day to day, from law and finance to operations and entrepreneurship.",
  },
  {
    name: "Maya Al-Harthy",
    role: "Community & Outreach",
    bio: "Maya builds relationships with schools, mentors, and student ambassadors to make sure FutureWise reaches the people who need it most.",
  },
  {
    name: "Omar Al-Zadjali",
    role: "Product & Design",
    bio: "Omar designs the FutureWise experience, making every page, tool, and resource feel clear, credible, and easy to use across devices.",
  },
];

const stats = [
  { label: "7 industries covered" },
  { label: "Built for Oman" },
  { label: "Student-led" },
];

const pillars = [
  {
    icon: GraduationCap,
    title: "Education & Knowledge",
    description: "We turn complex career and life topics into clear, practical learning students can use right away.",
  },
  {
    icon: TrendingUp,
    title: "Economic Diversification",
    description: "By introducing students to emerging industries, we help prepare a workforce ready for Oman’s future economy.",
  },
  {
    icon: Users,
    title: "Youth Empowerment",
    description: "We give young Omanis the confidence, tools, and language to make informed decisions about their futures.",
  },
  {
    icon: HeartHandshake,
    title: "Community Partnership",
    description: "We collaborate with educators, professionals, and families to support students beyond the classroom.",
  },
];

function AboutPage() {
  const [activeTab, setActiveTab] = useState("project");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (tabs.some((t) => t.id === hash)) {
      setActiveTab(hash);
      window.setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  }, []);

  const selectTab = (id: string) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.location.hash = id;
    }
  };

  return (
    <div className="bg-background">
      {/* Intro */}
      <section className="page-intro">
        <div className="site-container py-16 sm:py-20">
          <p className="eyebrow">About Us</p>
          <h1 className="mt-4 text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">
            About FutureWise
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/80">
            FutureWise is an educational platform built to help high school students in Oman
            navigate careers, industries, money, and independent life with clarity and
            confidence.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-20 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="site-container">
          <div
            className="flex gap-2 overflow-x-auto py-3"
            role="tablist"
            aria-label="About sections"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectTab(tab.id)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-navy text-white"
                      : "bg-transparent text-charcoal hover:bg-light-blue hover:text-blue"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab panels */}
      <div className="site-container min-h-[30rem] py-16 sm:py-20">
        {activeTab === "project" && <ProjectSection />}
        {activeTab === "team" && <TeamSection />}
        {activeTab === "vision-2040" && <VisionSection />}
      </div>

      {/* Final CTA */}
      <section className="bg-light-grey py-16 sm:py-20">
        <div className="site-container text-center">
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
            Want to be part of what we’re building?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-charcoal/75">
            Take our short survey and help us shape resources that actually matter to students in
            Oman.
          </p>
          <Button asChild variant="survey" size="lg" className="mt-8">
            <Link to="/survey">Take the Survey</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ProjectSection() {
  return (
    <section id="project" className="scroll-mt-32">
      <h2 className="text-3xl font-semibold text-navy sm:text-4xl">About FutureWise</h2>
      <div className="mt-10 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 text-lg leading-8 text-charcoal/80">
          <p>
            FutureWise was created to answer a question we kept hearing from students: “School
            teaches me subjects, but who teaches me how to choose a career, manage money, or live
            on my own?”
          </p>
          <p>
            Our platform brings together practical industry guides, personal finance basics,
            independent living tips, and curated tools — all designed specifically for high school
            students aged 15–19 in Oman.
          </p>
          <p>
            We believe that readiness is not something students should figure out alone. By working
            with educators, industry professionals, and young people themselves, FutureWise turns
            overwhelming decisions into clear, confident next steps.
          </p>
        </div>
        <div
          className="relative flex min-h-[22rem] items-center justify-center overflow-hidden rounded-card bg-light-blue p-8"
          aria-hidden="true"
        >
          <div className="blob -right-16 -top-16 size-64 opacity-40" />
          <div className="blob bottom-0 left-0 size-56 bg-teal opacity-30" />
          <div className="relative rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <span className="offer-card-icon">
                <Lightbulb aria-hidden="true" className="size-5" />
              </span>
              <div>
                <div className="h-2.5 w-32 rounded-full bg-navy" />
                <div className="mt-2 h-2 w-20 rounded-full bg-light-blue" />
              </div>
            </div>
            <div className="mt-6 space-y-2.5">
              <div className="h-2 w-full rounded-full bg-light-grey" />
              <div className="h-2 w-5/6 rounded-full bg-light-grey" />
              <div className="h-2 w-4/5 rounded-full bg-light-grey" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {stats.map((stat) => (
          <span
            key={stat.label}
            className="inline-flex items-center gap-2 rounded-full bg-light-blue px-5 py-2.5 text-sm font-semibold text-navy"
          >
            <Target aria-hidden="true" className="size-4 text-blue" />
            {stat.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section id="team" className="scroll-mt-32">
      <h2 className="text-3xl font-semibold text-navy sm:text-4xl">Meet the Team</h2>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-charcoal/80">
        A small, student-centered team working to make career and life guidance accessible across
        Oman.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <div
            key={member.name}
            className="rounded-card bg-light-grey p-6 text-center transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-light-blue">
              <Users aria-hidden="true" className="size-10 text-blue/70" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-navy">{member.name}</h3>
            <p className="mt-1 text-sm font-semibold text-blue">{member.role}</p>
            <p className="mt-4 text-sm leading-7 text-charcoal/75">{member.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VisionSection() {
  return (
    <section id="vision-2040" className="scroll-mt-32">
      <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
        How We Contribute to Oman Vision 2040
      </h2>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-charcoal/80">
        Oman Vision 2040 places people, knowledge, and economic resilience at the heart of the
        country’s future. FutureWise supports that vision by preparing young Omanis with the
        practical skills, career awareness, and confidence they need to participate in a
        diversified economy.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-card bg-light-blue p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white text-navy shadow-sm">
              <Icon aria-hidden="true" className="size-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-navy">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-charcoal/75">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
