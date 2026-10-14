import { absoluteUrl, site } from "@/data/site";
import { jsonLdText } from "@/lib/json-ld";

// Escaped: post and insight titles come from /admin (see json-ld.ts).
const ld = (value: unknown) => ({ type: "application/ld+json", children: jsonLdText(value) });

/** Cut to ≤ 155 characters at a word boundary. */
export function clip(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, "")}…`;
}

/** "[Page] — FutureWise" (≤ 60 characters); the home page passes its full title. */
export function pageTitle(page: string): string {
  const full = `${page} — ${site.name}`;
  return full.length <= 60 ? full : page.slice(0, 60);
}

type SeoOptions = {
  type?: "website" | "article";
  image?: string | null;
  imageAlt?: string;
  noindex?: boolean;
  crumbs?: Array<{ name: string; path: string }>;
  jsonLd?: unknown[];
};

/**
 * Per-route head: title, description, robots, canonical + og:url on
 * site.siteUrl, Open Graph/Twitter with an absolute image, and JSON-LD
 * (a BreadcrumbList for inner pages plus any extra nodes).
 */
export function seo(path: string, title: string, description: string, opts: SeoOptions = {}) {
  const url = absoluteUrl(path);
  const desc = clip(description);
  const image = opts.image ? absoluteUrl(opts.image) : absoluteUrl(site.ogImage.path);
  const usingDefaultImage = !opts.image;
  const breadcrumb = opts.crumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: site.name, path: "/" }, ...opts.crumbs].map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.path),
        })),
      }
    : null;

  return {
    meta: [
      { title },
      { name: "description", content: desc },
      {
        name: "robots",
        content: opts.noindex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1",
      },
      { property: "og:type", content: opts.type ?? "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      ...(usingDefaultImage
        ? [
            { property: "og:image:width", content: String(site.ogImage.width) },
            { property: "og:image:height", content: String(site.ogImage.height) },
          ]
        : []),
      { property: "og:image:alt", content: opts.imageAlt || site.ogImage.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [...(breadcrumb ? [ld(breadcrumb)] : []), ...(opts.jsonLd ?? []).map(ld)],
  };
}

/** Private pages (account, admin, sign-in): never indexed, no canonical. */
export function privateHead(title: string) {
  return {
    meta: [{ title: pageTitle(title) }, { name: "robots", content: "noindex, nofollow" }],
  };
}

/** Root JSON-LD: the organisation and the website. No Person nodes (the founder is under 18). */
export function rootGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.siteUrl}/#organization`,
        name: site.name,
        url: site.siteUrl,
        logo: absoluteUrl("/icon-512.png"),
        image: absoluteUrl(site.ogImage.path),
        description: site.description,
        email: site.email,
        sameAs: [site.linkedinUrl],
        areaServed: {
          "@type": "Country",
          name: "Oman",
          sameAs: "https://en.wikipedia.org/wiki/Oman",
        },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
          audienceType: "High school students aged 15–19",
        },
        knowsAbout: [
          {
            "@type": "Thing",
            name: "Career guidance",
            sameAs: "https://en.wikipedia.org/wiki/Career_guidance",
          },
          {
            "@type": "Thing",
            name: "Financial literacy",
            sameAs: "https://en.wikipedia.org/wiki/Financial_literacy",
          },
          {
            "@type": "Thing",
            name: "Oman Vision 2040",
            sameAs: "https://en.wikipedia.org/wiki/Oman_Vision_2040",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${site.siteUrl}/#website`,
        name: site.name,
        url: site.siteUrl,
        inLanguage: "en",
        publisher: { "@id": `${site.siteUrl}/#organization` },
      },
    ],
  };
}

/** Public, indexable static routes (the sitemap adds industries and published posts). */
export const staticRoutes = [
  "/",
  "/about",
  "/industry-resources",
  "/blog",
  "/resources",
  "/survey",
  "/privacy-policy",
  "/terms-of-use",
];
