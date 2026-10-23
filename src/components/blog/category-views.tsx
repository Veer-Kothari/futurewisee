import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { formatDate, type PostSummary } from "@/lib/content";

/**
 * The look of a blog section page (/blog?category=…), shared by Personal
 * Finance and The Practical Skills Guide: a grid-paper header and the posts as
 * numbered cards, so a section reads like a guide rather than the all-posts grid.
 */
export function CategoryHeader({
  title,
  description,
  nav,
}: {
  title: string;
  description: string;
  nav: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-light-blue [background-image:linear-gradient(to_right,rgb(0_0_0/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.045)_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="site-container py-16 sm:py-24">
        <div className="max-w-3xl border-l-4 border-navy bg-background p-6 sm:p-8">
          <h1 className="text-4xl font-bold text-navy sm:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-charcoal/80">{description}</p>
        </div>
        <div className="mt-9 border-b border-navy/20 pb-2">{nav}</div>
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CategoryPosts({ title, posts }: { title: string; posts: PostSummary[] }) {
  if (posts.length === 0) {
    return (
      <div className="max-w-xl border-2 border-dashed border-navy/30 p-8">
        <p aria-hidden="true" className="font-display text-5xl font-bold text-navy/20">
          01
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-navy">
          The first {title} post is on its way
        </h2>
        <p className="mt-3 leading-7 text-charcoal/75">
          New posts appear here as soon as they're published. Follow FutureWise on LinkedIn to hear
          when they go up.
        </p>
      </div>
    );
  }
  return (
    <ol className="grid gap-6 md:grid-cols-2">
      {posts.map((post, index) => (
        <li key={post.id}>
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group flex h-full gap-6 border border-border border-l-4 border-l-navy bg-background p-6 hover:border-navy/50 sm:p-8"
          >
            <span
              aria-hidden="true"
              className="font-display text-5xl font-bold leading-none text-navy/20 group-hover:text-blue/40"
            >
              {pad(index + 1)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xl font-semibold text-navy group-hover:text-blue">
                {post.title}
              </span>
              {post.excerpt ? (
                <span className="mt-3 text-sm leading-6 text-charcoal/80">{post.excerpt}</span>
              ) : null}
              <span className="mt-auto pt-5 text-sm text-charcoal/65">
                {post.author_name} · {formatDate(post.published_at)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
