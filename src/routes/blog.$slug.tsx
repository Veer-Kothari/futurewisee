import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";

import { LinkedInCallout } from "@/components/blog/linkedin-callout";
import { getPostBySlug, getRelatedPosts } from "@/data/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post, related: getRelatedPosts(params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Post unavailable | FutureWise" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} | FutureWise Blog` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: `${post.title} | FutureWise Blog` },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  component: BlogPostPage,
});

function PostNotFound() {
  return (
    <section className="page-intro">
      <div className="site-container py-24">
        <h1 className="text-4xl font-bold text-navy">Post not found</h1>
        <p className="mt-4 text-lg text-charcoal/80">This article may have moved or been renamed.</p>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-blue">
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to the blog
        </Link>
      </div>
    </section>
  );
}

function BlogPostPage() {
  const { post, related } = Route.useLoaderData();

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-20">
          <div className="mx-auto max-w-[700px]">
            <span className="inline-flex rounded-full bg-teal px-3 py-1 text-xs font-semibold text-navy">
              {post.category}
            </span>
            <h1 className="mt-5 text-3xl font-bold text-navy sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-sm text-charcoal/60">
              By {post.author} · <time dateTime={post.date}>{post.displayDate}</time>
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-[860px]">
            <div className="blog-card-image rounded-card">
              <FileText aria-hidden="true" className="size-10" />
            </div>
          </div>
        </div>
      </section>

      <article className="site-container py-16">
        <div className="mx-auto max-w-[700px] space-y-6 text-lg leading-9 text-charcoal/85">
          {post.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-[700px]">
          <LinkedInCallout compact />
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-semibold text-navy">Related posts</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to="/blog/$slug"
                  params={{ slug: item.slug }}
                  className="blog-card"
                >
                  <div className="blog-card-image">
                    <FileText aria-hidden="true" className="size-8" />
                  </div>
                  <div className="p-6">
                    <span className="inline-flex rounded-full bg-teal px-3 py-1 text-xs font-semibold text-navy">
                      {item.category}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-navy">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-charcoal/80">{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link to="/blog" className="mt-16 inline-flex items-center gap-2 text-blue">
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to all posts
        </Link>
      </article>
    </>
  );
}
