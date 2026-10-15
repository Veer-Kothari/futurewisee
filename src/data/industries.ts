import type { IndustrySlug } from "@/lib/content-schema";

/**
 * The seven Industry Insights areas. The slugs are also the database values
 * (insight_items.industry) and the page addresses (/industry-resources/<slug>).
 * Veer adds the videos, course material, guides and links in /admin.
 */
export interface Industry {
  slug: IndustrySlug;
  /** Page title and card name. */
  name: string;
  /** Shorter label for the navigation menu. */
  navLabel: string;
  description: string;
  /**
   * Shown in the Industry Insights menus (desktop and phone). Set to false to
   * take a category out of both menus; its page still works.
   */
  inMenu: boolean;
}

export const industries: Industry[] = [
  {
    slug: "law",
    name: "Law",
    navLabel: "Law",
    description: "Explore pathways, roles, and practical insights for a future in law.",
    inMenu: true,
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship",
    navLabel: "Entrepreneurship",
    description: "Explore the ideas, skills, and decisions behind building a business.",
    inMenu: true,
  },
  {
    slug: "investment-banking-and-trading",
    name: "Investment Banking & Trading",
    navLabel: "Investment Banking & Trading",
    description: "Explore the work, skills, and pathways across investment banking and trading.",
    inMenu: true,
  },
  {
    slug: "other-finance",
    name: "Finance",
    navLabel: "Finance",
    description: "Explore the many career paths available across the wider finance sector.",
    inMenu: true,
  },
  {
    slug: "tax",
    name: "Tax",
    navLabel: "Tax",
    description: "Explore how tax professionals support people, businesses, and economies.",
    inMenu: true,
  },
  {
    slug: "economics",
    name: "Economics",
    navLabel: "Economics",
    description: "Explore how economists understand choices, markets, and public policy.",
    inMenu: true,
  },
  {
    slug: "operations",
    name: "Operations",
    navLabel: "Operations",
    description: "Explore the people and systems that keep organisations working effectively.",
    inMenu: true,
  },
];

/** The one list both navigation menus use (AGENTS.md: availability-aware industry menu). */
export const menuIndustries: Industry[] = industries.filter((industry) => industry.inMenu);

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
