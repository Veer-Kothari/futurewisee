import { createFileRoute, Link } from "@tanstack/react-router";
import { Image, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import veerKothariPhoto from "@/assets/team/veer-kothari.png.asset.json";

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
    name: "Veer Kothari",
    role: "Founder & Project Lead",
    photo: veerKothariPhoto.url,
    bio: [
      "I am Veer Kothari, a Year 12 student at British School Muscat in Muscat, Oman. I have a strong interest in mathematics, economics, careers and practical education, and I am particularly interested in business and finance. I am in the high school graduating class of 2028, and look to apply to the UK, the United States and wider Europe to pursue a career in finance.",
      "Through my academic and extracurricular experiences, including the Harvard Secondary School Program in Microeconomics, an internship at one of the largest college investment funds globally, and articulating essays to answer economic queries far beyond the classroom, I have developed an interest in understanding how education can better prepare young people for the world beyond school and exams.",
      "I founded FutureWise because I noticed that students, including myself, often receive strong academic preparation but have fewer opportunities to learn about different industries, career pathways, financial literacy and independent adulthood in a practical and accessible way.",
      "Through FutureWise, I aim to make practical knowledge more accessible to young people and help students make more informed decisions about their futures. The project initially focuses on students in Oman, with the long-term goal of growing our impact further into the GCC and beyond.",
    ],
  },
  {
    name: "William Darker",
    role: "Blog Writing",
    photo: null,
    photoAlt: null,
    bio: [],
  },
];

const stats = [
  { label: "7 industries covered" },
  { label: "Built for Oman" },
  { label: "Student-led" },
];

const pillars = [
  {
    title: "Education & Knowledge",
    description: "We turn complex career and life topics into clear, practical learning students can use right away.",
  },
  {
    title: "Economic Diversification",
    description: "By introducing students to emerging industries, we help prepare a workforce ready for Oman’s future economy.",
  },
  {
    title: "Youth Empowerment",
    description: "We give young Omanis the confidence, tools, and language to make informed decisions about their futures.",
  },
  {
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
                  className={`shrink-0 rounded-sm border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-navy bg-navy text-primary-foreground"
                      : "border-transparent bg-transparent text-charcoal hover:bg-light-blue hover:text-navy"
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
        <div className="min-h-[22rem] border-l-2 border-blue bg-light-blue p-8">
          <p className="text-sm font-semibold text-navy">FutureWise focuses on</p>
          <div className="mt-10 space-y-6 text-xl text-charcoal">
            <p>Industry knowledge before choosing a path.</p>
            <p>Financial literacy before managing money alone.</p>
            <p>Practical skills before leaving school.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {stats.map((stat) => (
          <span
            key={stat.label}
            className="inline-flex items-center border-l-2 border-blue bg-light-blue px-5 py-2.5 text-sm font-semibold text-navy"
          >
            {stat.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function TeamSection() {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  return (
    <section id="team" className="scroll-mt-32">
      <p className="eyebrow">Our People</p>
      <h2 className="mt-3 text-3xl font-semibold text-navy sm:text-4xl">The Team</h2>
      <div className="mt-10 grid gap-x-9 gap-y-12 sm:grid-cols-2">
        {team.map((member) => {
          const isExpanded = expandedMember === member.name;
          const panelId = `bio-${member.name.toLowerCase().replaceAll(" ", "-")}`;

          return (
            <article key={member.name} className="min-w-0">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-top"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-light-grey">
                  <div className="flex flex-col items-center gap-3 text-blue/60">
                    <Image aria-hidden="true" className="size-10" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-charcoal/55">Photo coming soon</span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-4 border-b border-border py-5">
                <div>
                  <h3 className="text-xl font-semibold uppercase text-navy sm:text-2xl">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-blue sm:text-base">{member.role}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  aria-label={`${isExpanded ? "Close" : "Read"} ${member.name}'s biography`}
                  onClick={() => setExpandedMember(isExpanded ? null : member.name)}
                  className="mt-0.5 shrink-0 text-navy hover:bg-light-blue"
                >
                  <Plus
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${isExpanded ? "rotate-45" : ""}`}
                  />
                </Button>
              </div>

              {isExpanded && (
                <div id={panelId} className="border-b border-border py-6 text-charcoal/80">
                  {member.bio.length > 0 ? (
                    <div className="space-y-5 text-base leading-8">
                      {member.bio.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base italic leading-8 text-charcoal/60">
                      Biography coming soon.
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
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
        {pillars.map(({ title, description }, index) => (
          <div key={title} className="rounded-sm border-t-2 border-navy bg-light-blue p-6">
            <span className="text-xs text-blue">0{index + 1}</span>
            <h3 className="mt-8 text-lg font-semibold text-navy">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-charcoal/75">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
