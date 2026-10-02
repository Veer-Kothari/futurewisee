import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { LinkedInCallout } from "@/components/blog/linkedin-callout";
import { blogPosts, type BlogCategory } from "@/data/blog-posts";
import { cn } from "@/lib/utils";

const description =
  "Student-written notes on managing money, preparing to live independently, and making the move from school into further study and work.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Personal Finance & My Journey | FutureWise" },
      { name: "description", content: description },
      { property: "og:title", content: "Blog — Personal Finance & My Journey | FutureWise" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogHub,
});

const filters: Array<"All" | BlogCategory> = ["All", "Personal Finance", "My Journey"];

function BlogHub() {
  const [filter, setFilter] = useState<"All" | BlogCategory>("All");
  const posts = filter === "All" ? blogPosts : blogPosts.filter((p) => p.category === filter);

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-24">
          <p className="eyebrow">FutureWise Blog</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold text-navy sm:text-5xl">
            Notes for life beyond school
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">{description}</p>

          <div
            role="tablist"
            aria-label="Filter posts by category"
            className="mt-9 inline-flex flex-wrap gap-2 border-b border-border pb-2"
          >
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={filter === item}
                onClick={() => setFilter(item)}
                className={cn(
                  "rounded-sm px-5 py-2 text-sm transition-colors",
                  filter === item
                    ? "bg-navy text-primary-foreground"
                    : "text-charcoal/70 hover:bg-light-blue hover:text-navy",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} to="/blog/$slug" params={{ slug: post.slug }} className="blog-card">
              <div className="p-6">
                <span className="border-l-2 border-blue pl-3 text-xs font-semibold text-navy">
                  {post.category}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-navy">{post.title}</h2>
                <p className="mt-2 text-sm text-charcoal/60">
                  {post.author} · {post.displayDate}
                </p>
                <p className="mt-3 text-sm leading-6 text-charcoal/80">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <LinkedInCallout />
        </div>
      </section>
    </>
  );
}
