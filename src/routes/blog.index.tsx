import { Link, createFileRoute } from "@tanstack/react-router";

import { CategoryHeader, CategoryPosts } from "@/components/blog/category-views";
import { LinkedInCallout } from "@/components/blog/linkedin-callout";
import { BLOG_CATEGORIES, type BlogCategorySlug } from "@/lib/content-schema";
import { formatDate, listPublishedPosts } from "@/lib/content";
import { pageTitle, seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const description =
  "Student-written notes on managing money, preparing to live independently, and making the move from school into further study and work.";

const categoryTitles: Record<BlogCategorySlug, { title: string; description: string }> = {
  "personal-finance": {
    title: "Personal Finance Blog",
    description:
      "Practical perspectives to help students understand, manage, and plan their money.",
  },
  "practical-skills": {
    title: "The Practical Skills Guide",
    description:
      "Hands-on guidance for everyday skills that help students live more independently.",
  },
};

function isCategory(value: unknown): value is BlogCategorySlug {
  return BLOG_CATEGORIES.some((category) => category.slug === value);
}

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): { category?: BlogCategorySlug } =>
    isCategory(search["category"]) ? { category: search["category"] } : {},
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: async ({ deps }) => ({
    posts: await listPublishedPosts(deps.category ? { category: deps.category } : {}),
  }),
  head: ({ match }) => {
    const category = match.search.category;
    const heading = category ? categoryTitles[category] : null;
    return seo(
      "/blog",
      pageTitle(heading ? heading.title : "Blog"),
      heading ? heading.description : description,
      { crumbs: [{ name: "Blog", path: "/blog" }] },
    );
  },
  component: BlogHub,
});

function BlogHub() {
  const { posts } = Route.useLoaderData();
  const { category } = Route.useSearch();
  const heading = category ? categoryTitles[category] : null;

  const nav = (
    <nav aria-label="Blog sections" className="flex flex-wrap gap-2">
      <FilterLink active={!category} label="All posts" />
      {BLOG_CATEGORIES.map((entry) => (
        <FilterLink
          key={entry.slug}
          active={category === entry.slug}
          label={entry.label}
          category={entry.slug}
        />
      ))}
    </nav>
  );

  return (
    <>
      {heading ? (
        <CategoryHeader title={heading.title} description={heading.description} nav={nav} />
      ) : (
        <section className="page-intro">
          <div className="site-container py-16 sm:py-24">
            <h1 className="max-w-3xl text-4xl font-bold text-navy sm:text-5xl">
              Notes for life beyond school
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">{description}</p>
            <div className="mt-9 border-b border-border pb-2">{nav}</div>
          </div>
        </section>
      )}

      <section className="site-container py-16 sm:py-20">
        {heading ? (
          <CategoryPosts title={heading.title} posts={posts} />
        ) : posts.length === 0 ? (
          <div className="max-w-2xl border border-border border-t-2 border-t-navy p-8">
            <h2 className="text-2xl font-semibold text-navy">First posts coming soon</h2>
            <p className="mt-3 leading-7 text-charcoal/75">
              New posts appear here as soon as they're published. Follow FutureWise on LinkedIn to
              hear when they go up.
            </p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex h-full flex-col border border-border bg-background hover:border-navy/50"
                >
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.cover_image_alt}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="border-l-2 border-blue pl-3 text-xs font-semibold text-navy">
                      {BLOG_CATEGORIES.find((entry) => entry.slug === post.category)?.label}
                    </span>
                    <h2 className="mt-4 text-xl font-semibold text-navy group-hover:text-blue">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm text-charcoal/65">
                      {post.author_name} · {formatDate(post.published_at)}
                    </p>
                    {post.excerpt ? (
                      <p className="mt-3 text-sm leading-6 text-charcoal/80">{post.excerpt}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-16">
          <LinkedInCallout />
        </div>
      </section>
    </>
  );
}

function FilterLink({
  active,
  label,
  category,
}: {
  active: boolean;
  label: string;
  category?: BlogCategorySlug;
}) {
  return (
    <Link
      to="/blog"
      search={category ? { category } : {}}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center px-5 text-sm transition-colors",
        active
          ? "bg-navy text-primary-foreground"
          : "text-charcoal/75 hover:bg-light-blue hover:text-navy",
      )}
    >
      {label}
    </Link>
  );
}
