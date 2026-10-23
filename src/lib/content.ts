import {
  BLOG_CATEGORY_SLUGS,
  type BlogCategorySlug,
  type IndustrySlug,
  type InsightKind,
} from "@/lib/content-schema";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Public reads of what Veer publishes in /admin. Every function returns an
 * empty result (never throws) when Lovable Cloud isn't connected or a request
 * fails, so pages show their designed empty state instead of an error.
 * Public pages always filter on published = true: a signed-in admin can read
 * drafts through RLS, and drafts must never appear on the public pages.
 */
export type Post = {
  id: string;
  slug: string;
  title: string;
  category: BlogCategorySlug;
  author_name: string;
  excerpt: string;
  body: string;
  cover_image_url: string | null;
  cover_image_alt: string;
  video_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostSummary = Pick<
  Post,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "author_name"
  | "excerpt"
  | "cover_image_url"
  | "cover_image_alt"
  | "published_at"
  | "created_at"
>;

export type InsightItem = {
  id: string;
  industry: IndustrySlug;
  kind: InsightKind;
  title: string;
  summary: string;
  body: string;
  video_url: string | null;
  link_url: string | null;
  file_url: string | null;
  file_name: string | null;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const POST_SUMMARY_COLUMNS =
  "id, slug, title, category, author_name, excerpt, cover_image_url, cover_image_alt, published_at, created_at";
const POST_COLUMNS = `${POST_SUMMARY_COLUMNS}, body, video_url, published, updated_at`;
const INSIGHT_COLUMNS =
  "id, industry, kind, title, summary, body, video_url, link_url, file_url, file_name, position, published, created_at, updated_at";

export async function listPublishedPosts(
  opts: { category?: BlogCategorySlug; limit?: number } = {},
): Promise<PostSummary[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("posts")
      .select(POST_SUMMARY_COLUMNS)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(opts.limit ?? 60);
    query = opts.category
      ? query.eq("category", opts.category)
      : query.in("category", BLOG_CATEGORY_SLUGS);
    const { data, error } = await query;
    return error ? [] : ((data ?? []) as PostSummary[]);
  } catch {
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  const supabase = getSupabase();
  if (!supabase || !/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(POST_COLUMNS)
      .eq("slug", slug)
      .eq("published", true)
      .in("category", BLOG_CATEGORY_SLUGS)
      .maybeSingle();
    return error ? null : ((data as Post | null) ?? null);
  } catch {
    return null;
  }
}

export async function listPublishedInsights(industry?: IndustrySlug): Promise<InsightItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("insight_items")
      .select(INSIGHT_COLUMNS)
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(500);
    if (industry) query = query.eq("industry", industry);
    const { data, error } = await query;
    return error ? [] : ((data ?? []) as InsightItem[]);
  } catch {
    return [];
  }
}

export function countByIndustry(items: Pick<InsightItem, "industry">[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) counts[item.industry] = (counts[item.industry] ?? 0) + 1;
  return counts;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Muscat",
  }).format(date);
}
