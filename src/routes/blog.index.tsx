import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useState } from "react";

import { LinkedInCallout } from "@/components/blog/linkedin-callout";
import { blogPosts, type BlogCategory } from "@/data/blog-posts";
import { cn } from "@/lib/utils";

const description =
  "Practical writing on personal finance, independent living, and the road from school to a real career.";

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
            Living independently, money, and my journey
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">{description}</p>

          <div
            role="tablist"
            aria-label="Filter posts by category"
            className="mt-9 inline-flex flex-wrap gap-2 rounded-full bg-background p-1.5 shadow-soft"
          >
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={filter === item}
                onClick={() => setFilter(item)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm transition-colors",
                  filter === item
                    ? "bg-teal text-navy"
                    : "text-charcoal/70 hover:bg-light-blue hover:text-blue",
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
              <div className="blog-card-image">
                <FileText aria-hidden="true" className="size-8" />
              </div>
              <div className="p-6">
                <span className="inline-flex rounded-full bg-teal px-3 py-1 text-xs font-semibold text-navy">
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
