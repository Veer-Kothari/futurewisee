import type { IndustrySlug } from "@/lib/content-schema";

/**
 * The article on each Industry Insights page (/industry-resources/<slug>): the
 * "Industry Cheat Sheet" part of Veer's Google Doc for that industry (Drive ›
 * Cheat Sheets › "<Industry> Cheat Sheet"), copied into ./industries/<slug>.md.
 *
 * Left out on purpose: the Expert FAQs, the template's bracketed RESEARCH,
 * EXPERT INPUT and LINK TO notes, instructions to the writer, sections with
 * nothing filled in yet (Leading Firms) and "Useful Resources" — the page's
 * Useful Links panel takes its place (src/data/resources.ts).
 *
 * `published` stays false until Veer says that sheet is complete; until then
 * the page shows its "on its way" state. `updated` is the day the text was last
 * copied from his sheet (shown as "Updated …" and used in the sitemap).
 */
const articles: Record<IndustrySlug, { published: boolean; updated: string }> = {
  law: { published: false, updated: "2026-10-21" },
  entrepreneurship: { published: false, updated: "2026-10-21" },
  "investment-banking-and-trading": { published: false, updated: "2026-10-21" },
  "other-finance": { published: false, updated: "2026-10-21" },
  tax: { published: false, updated: "2026-10-21" },
  economics: { published: false, updated: "2026-10-21" },
  operations: { published: false, updated: "2026-10-21" },
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
