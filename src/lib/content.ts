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

/**
 * Public content changes rarely, so each server instance (and browser tab)
 * keeps a fetched list for a minute instead of asking the database on every
 * page view. Only successful answers are kept; a failed query is retried on
 * the next view. Side effect: a newly published post can take up to a minute
 * to appear.
 */
const CACHE_MS = 60_000;
const contentCache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, load: () => Promise<T>, fallback: T): Promise<T> {
  const hit = contentCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as T;
  try {
    const value = await load();
    contentCache.set(key, { at: Date.now(), value });
    return value;
  } catch {
    return fallback;
  }
}

/**
 * Posts appear once they are published AND their publish date has arrived, so
 * Veer can schedule posts by giving them a future date.
 */
export async function listPublishedPosts(
  opts: { category?: BlogCategorySlug; limit?: number } = {},
): Promise<PostSummary[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  return cached(
    `posts:${opts.category ?? "all"}:${opts.limit ?? 60}`,
    async () => {
      let query = supabase
        .from("posts")
        .select(POST_SUMMARY_COLUMNS)
        .eq("published", true)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(opts.limit ?? 60);
      query = opts.category
        ? query.eq("category", opts.category)
        : query.in("category", BLOG_CATEGORY_SLUGS);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PostSummary[];
    },
    [],
  );
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  const supabase = getSupabase();
  if (!supabase || !/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  return cached(
    `post:${slug}`,
    async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(POST_COLUMNS)
        .eq("slug", slug)
        .eq("published", true)
        .lte("published_at", new Date().toISOString())
        .in("category", BLOG_CATEGORY_SLUGS)
        .maybeSingle();
      if (error) throw error;
      return (data as Post | null) ?? null;
    },
    null,
  );
}

export async function listPublishedInsights(industry?: IndustrySlug): Promise<InsightItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  return cached(
    `insights:${industry ?? "all"}`,
    async () => {
      let query = supabase
        .from("insight_items")
        .select(INSIGHT_COLUMNS)
        .eq("published", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(500);
      if (industry) query = query.eq("industry", industry);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as InsightItem[];
    },
    [],
  );
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
