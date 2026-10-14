import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { LinkedInCallout } from "@/components/blog/linkedin-callout";
import { Markdown } from "@/components/content/markdown";
import { VideoEmbed } from "@/components/content/video-embed";
import { absoluteUrl, site } from "@/data/site";
import { BLOG_CATEGORIES } from "@/lib/content-schema";
import { formatDate, getPublishedPost, listPublishedPosts } from "@/lib/content";
import { clip, pageTitle, seo } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost(params.slug);
    if (!post) throw notFound();
    const sameCategory = await listPublishedPosts({ category: post.category, limit: 4 });
    return { post, related: sameCategory.filter((entry) => entry.id !== post.id).slice(0, 3) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: pageTitle("Post not found") }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    const path = `/blog/${post.slug}`;
    const summary = post.excerpt || clip(post.body.replace(/[#*_>[\]()-]/g, " "));
    return seo(path, pageTitle(post.title), summary, {
      type: "article",
      image: post.cover_image_url,
      imageAlt: post.cover_image_alt || post.title,
      crumbs: [
        { name: "Blog", path: "/blog" },
        { name: post.title, path },
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: summary,
          ...(post.published_at ? { datePublished: post.published_at } : {}),
          dateModified: post.updated_at,
          mainEntityOfPage: absoluteUrl(path),
          ...(post.cover_image_url ? { image: post.cover_image_url } : {}),
          // The organisation, not a person: some authors are under 18.
          author: { "@type": "Organization", name: site.name, url: site.siteUrl },
          publisher: { "@id": `${site.siteUrl}/#organization` },
        },
      ],
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post, related } = Route.useLoaderData();
  const category = BLOG_CATEGORIES.find((entry) => entry.slug === post.category);

  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-20">
          <div className="mx-auto max-w-[700px]">
            <Link
              to="/blog"
              search={{ category: post.category }}
              className="border-l-2 border-blue pl-3 text-xs font-semibold text-navy hover:text-blue"
            >
              {category?.label}
            </Link>
            <h1 className="mt-5 text-3xl font-bold text-navy sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-sm text-charcoal/65">
              By {post.author_name}
              {post.published_at ? (
                <>
                  {" · "}
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </section>

      <article className="site-container py-16">
        <div className="mx-auto max-w-[700px]">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.cover_image_alt}
              className="mb-10 aspect-[16/9] w-full border border-border object-cover"
            />
          ) : null}
          {post.video_url ? (
            <div className="mb-10">
              <VideoEmbed url={post.video_url} title={post.title} />
            </div>
          ) : null}
          <Markdown source={post.body} />
        </div>

        <div className="mx-auto mt-14 max-w-[700px]">
          <LinkedInCallout compact />
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-20">
            <h2 id="related-heading" className="text-2xl font-semibold text-navy">
              More from {category?.label}
            </h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: item.slug }}
                    className="group block h-full border border-border p-6 hover:border-navy/50"
                  >
                    <h3 className="text-lg font-semibold text-navy group-hover:text-blue">
                      {item.title}
                    </h3>
                    {item.excerpt ? (
                      <p className="mt-3 text-sm leading-6 text-charcoal/80">{item.excerpt}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mx-auto mt-16 max-w-[700px]">
          <Link to="/blog" className="text-link">
            All posts
          </Link>
        </div>
      </article>
    </>
  );
}
