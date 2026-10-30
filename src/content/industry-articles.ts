import type { IndustrySlug } from "@/lib/content-schema";

/**
 * The article on each Industry Insights page (/industry-resources/<slug>): the
 * "Industry Cheat Sheet" part of Veer's collated document ("FutureWise Industry
 * Insights Collated FINAL"), copied into ./industries/<slug>.md.
 *
 * Hidden on purpose: the expert interview parts (Meet the Expert, Questions for
 * the Expert and Final Advice) and the template's instructions to the writer.
 * Each sheet's "Useful Resources" list is kept at the end of the article; the
 * page's Useful Links panel (src/data/resources.ts) is a separate list.
 *
 * `published: false` takes a sheet off its page (it then shows the "on its way"
 * state). `updated` is the day the text was last copied from his document
 * (shown as "Updated …" and used in the sitemap).
 */
const articles: Record<IndustrySlug, { published: boolean; updated: string }> = {
  law: { published: true, updated: "2026-10-30" },
  entrepreneurship: { published: true, updated: "2026-10-30" },
  "investment-banking-and-trading": { published: true, updated: "2026-10-30" },
  "other-finance": { published: true, updated: "2026-10-30" },
  tax: { published: true, updated: "2026-10-30" },
  economics: { published: true, updated: "2026-10-30" },
  operations: { published: true, updated: "2026-10-30" },
};

const markdownFiles = import.meta.glob<string>("./industries/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export type IndustryArticle = {
  markdown: string;
  /** yyyy-mm-dd */
  updated: string;
};

/** The industry's article, or null while Veer's sheet for it is still in progress. */
export function getIndustryArticle(slug: IndustrySlug): IndustryArticle | null {
  const entry = articles[slug];
  const markdown = markdownFiles[`./industries/${slug}.md`];
  if (!entry.published || !markdown?.trim()) return null;
  return { markdown, updated: entry.updated };
}
