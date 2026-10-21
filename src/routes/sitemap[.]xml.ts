import { createFileRoute } from "@tanstack/react-router";

import { getIndustryArticle } from "@/content/industry-articles";
import { industries } from "@/data/industries";
import { absoluteUrl } from "@/data/site";
import { listPublishedInsights, listPublishedPosts } from "@/lib/content";
import { staticRoutes } from "@/lib/seo";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Public pages, the seven industries and every published post. Never /admin, /account or sign-in pages. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [posts, insights] = await Promise.all([
          listPublishedPosts({ limit: 1000 }),
          listPublishedInsights(),
        ]);
        const latestByIndustry = new Map<string, string>();
        for (const item of insights) {
          const current = latestByIndustry.get(item.industry);
          if (!current || item.updated_at > current)
            latestByIndustry.set(item.industry, item.updated_at);
        }

        const entries: Array<{ loc: string; lastmod?: string }> = [
          ...staticRoutes.map((path) => ({ loc: absoluteUrl(path) })),
          ...industries.map((industry) => {
            const dates = [
              latestByIndustry.get(industry.slug)?.slice(0, 10),
              getIndustryArticle(industry.slug)?.updated,
            ].filter((date): date is string => Boolean(date));
            const lastmod = dates.sort().at(-1);
            return {
              loc: absoluteUrl(`/industry-resources/${industry.slug}`),
              ...(lastmod ? { lastmod } : {}),
            };
          }),
          ...posts.map((post) => ({
            loc: absoluteUrl(`/blog/${post.slug}`),
            ...(post.published_at ? { lastmod: post.published_at.slice(0, 10) } : {}),
          })),
        ];

        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entries.map(
            (entry) =>
              `  <url><loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""}</url>`,
          ),
          "</urlset>",
          "",
        ].join("\n");
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
