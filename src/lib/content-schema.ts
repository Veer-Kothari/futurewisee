import { z } from "zod";

/**
 * Validation for Veer's editor (/admin). Mirrors the CHECK constraints in
 * supabase/migrations/20261014120000_futurewise_accounts_content.sql — change
 * both together. Exception: the database still accepts "my-journey"; that
 * section was removed from the site (Herdy, 23 Oct 2026), so it is left out here
 * and its posts are never listed or shown.
 */
export const BLOG_CATEGORIES = [
  { slug: "personal-finance", label: "Personal Finance", defaultAuthor: "Veer Kothari" },
  // Formerly the Living Independently guide; written with William Darker (Veer, 25 Oct 2026).
  {
    slug: "practical-skills",
    label: "Practical Skills",
    defaultAuthor: "William Darker",
  },
] as const;
export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];
export const defaultAuthorFor = (slug: BlogCategorySlug): string =>
  BLOG_CATEGORIES.find((c) => c.slug === slug)?.defaultAuthor ?? BLOG_CATEGORIES[0].defaultAuthor;
export const BLOG_CATEGORY_SLUGS = BLOG_CATEGORIES.map((c) => c.slug) as [
  BlogCategorySlug,
  ...BlogCategorySlug[],
];

export const INDUSTRY_SLUGS = [
  "law",
  "entrepreneurship",
  "investment-banking-and-trading",
  "other-finance",
  "tax",
  "economics",
  "operations",
] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export const INSIGHT_KINDS = [
  { value: "video", label: "Video" },
  { value: "course", label: "Course material" },
  { value: "guide", label: "Guide" },
  { value: "link", label: "Link" },
] as const;
export type InsightKind = (typeof INSIGHT_KINDS)[number]["value"];
export const INSIGHT_KIND_VALUES = INSIGHT_KINDS.map((k) => k.value) as [
  InsightKind,
  ...InsightKind[],
];

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** A real https address with a host name (rejects "https://?", spaces, other schemes). */
export function isHttpsUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname);
  } catch {
    return false;
  }
}

/** Optional https URL: "" / whitespace → null; anything else must be https:// and ≤ 500 chars. */
const optionalHttpsUrl = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || isHttpsUrl(value), {
    message: "Use a full https:// link",
  })
  .nullable()
  .transform((value) => value ?? null);

export const postInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(SLUG_PATTERN, "Lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1).max(160),
  category: z.enum(BLOG_CATEGORY_SLUGS),
  author_name: z.string().trim().min(1).max(80),
  excerpt: z.string().trim().max(300),
  body: z.string().trim().max(50000),
  cover_image_url: optionalHttpsUrl,
  cover_image_alt: z.string().trim().max(200),
  video_url: optionalHttpsUrl,
  published: z.boolean(),
});
export type PostInput = z.infer<typeof postInputSchema>;

export const insightInputSchema = z
  .object({
    industry: z.enum(INDUSTRY_SLUGS),
    kind: z.enum(INSIGHT_KIND_VALUES),
    title: z.string().trim().min(1).max(160),
    summary: z.string().trim().max(500),
    body: z.string().trim().max(30000),
    video_url: optionalHttpsUrl,
    link_url: optionalHttpsUrl,
    file_url: optionalHttpsUrl,
    file_name: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .transform((value) => (value ? value : null)),
    position: z.number().int().min(0).max(10000),
    published: z.boolean(),
  })
  .superRefine((item, ctx) => {
    if (item.kind === "video" && !item.video_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["video_url"],
        message: "Add the video link",
      });
    }
    if (item.kind === "course" && !item.file_url && !item.link_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["file_url"],
        message: "Upload a file or add a link to the material",
      });
    }
    if (item.kind === "link" && !item.link_url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["link_url"], message: "Add the link" });
    }
    if (item.kind === "guide" && item.body.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body"],
        message: "Write the guide text",
      });
    }
  });
export type InsightInput = z.infer<typeof insightInputSchema>;
