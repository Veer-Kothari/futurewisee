import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import {
  CheckField,
  MARKDOWN_HINT,
  SelectField,
  StatusLine,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { uploadMedia, zodFieldErrors } from "@/components/admin/admin-utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { BLOG_CATEGORIES, postInputSchema, type BlogCategorySlug } from "@/lib/content-schema";
import { formatDate, type Post } from "@/lib/content";
import { slugify } from "@/lib/slug";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Draft = {
  id: string | null;
  slug: string;
  slugEdited: boolean;
  title: string;
  category: BlogCategorySlug;
  author_name: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  cover_image_alt: string;
  video_url: string;
  published: boolean;
};

const emptyDraft = (author: string): Draft => ({
  id: null,
  slug: "",
  slugEdited: false,
  title: "",
  category: "personal-finance",
  author_name: author,
  excerpt: "",
  body: "",
  cover_image_url: "",
  cover_image_alt: "",
  video_url: "",
  published: false,
});

const fromPost = (post: Post): Draft => ({
  id: post.id,
  slug: post.slug,
  slugEdited: true,
  title: post.title,
  category: post.category,
  author_name: post.author_name,
  excerpt: post.excerpt,
  body: post.body,
  cover_image_url: post.cover_image_url ?? "",
  cover_image_alt: post.cover_image_alt,
  video_url: post.video_url ?? "",
  published: post.published,
});

export function PostsPanel() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ message: string; tone: "ok" | "error" | "idle" }>({
    message: "",
    tone: "idle",
  });
  const [busy, setBusy] = useState<"save" | "delete" | "upload" | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      setStatus({ message: "Posts couldn't be loaded. Refresh to try again.", tone: "error" });
      setPosts([]);
      return;
    }
    setPosts((data as Post[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value };
      if (key === "title" && !current.slugEdited) next.slug = slugify(String(value));
      if (key === "slug") next.slugEdited = true;
      return next;
    });

  async function save() {
    if (!draft) return;
    const parsed = postInputSchema.safeParse({
      slug: draft.slug,
      title: draft.title,
      category: draft.category,
      author_name: draft.author_name,
      excerpt: draft.excerpt,
      body: draft.body,
      cover_image_url: draft.cover_image_url,
      cover_image_alt: draft.cover_image_alt,
      video_url: draft.video_url,
      published: draft.published,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error.issues));
      setStatus({ message: "Please fix the highlighted fields.", tone: "error" });
      return;
    }
    if (parsed.data.cover_image_url && !parsed.data.cover_image_alt) {
      setErrors({ cover_image_alt: "Describe the image for people who can't see it." });
      setStatus({ message: "Please fix the highlighted fields.", tone: "error" });
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setErrors({});
    setBusy("save");
    const result = draft.id
      ? await supabase.from("posts").update(parsed.data).eq("id", draft.id).select("*").single()
      : await supabase.from("posts").insert(parsed.data).select("*").single();
    setBusy(null);
    if (result.error) {
      if (result.error.code === "23505") {
        setErrors({ slug: "Another post already uses this web address." });
        setStatus({ message: "Please fix the highlighted fields.", tone: "error" });
      } else {
        setStatus({ message: "The post couldn't be saved. Please try again.", tone: "error" });
      }
      return;
    }
    const saved = result.data as Post;
    setDraft(fromPost(saved));
    setStatus({
      message: saved.published
        ? "Saved and published."
        : "Saved as a draft (not visible on the site).",
      tone: "ok",
    });
    void load();
  }

  async function remove() {
    if (!draft?.id || !window.confirm(`Delete “${draft.title}”? This can't be undone.`)) return;
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy("delete");
    const { error } = await supabase.from("posts").delete().eq("id", draft.id);
    setBusy(null);
    if (error) {
      setStatus({ message: "The post couldn't be deleted. Please try again.", tone: "error" });
      return;
    }
    setDraft(null);
    setStatus({ message: "Post deleted.", tone: "ok" });
    void load();
  }

  async function onCover(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    const result = await uploadMedia(file, "image");
    setBusy(null);
    if ("error" in result) {
      setErrors((current) => ({ ...current, cover_image_url: result.error }));
      return;
    }
    update("cover_image_url", result.url);
    setErrors((current) => ({ ...current, cover_image_url: "" }));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
      <div>
        <Button
          type="button"
          className="h-11 w-full"
          onClick={() => {
            setDraft(emptyDraft(profile?.full_name || "FutureWise"));
            setErrors({});
            setStatus({ message: "", tone: "idle" });
          }}
        >
          New post
        </Button>
        <ul className="mt-6 divide-y divide-border border border-border">
          {posts === null ? (
            <li className="p-4 text-sm text-charcoal/70">Loading…</li>
          ) : posts.length === 0 ? (
            <li className="p-4 text-sm text-charcoal/70">No posts yet.</li>
          ) : (
            posts.map((post) => (
              <li key={post.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(fromPost(post));
                    setErrors({});
                    setStatus({ message: "", tone: "idle" });
                  }}
                  className={cn(
                    "w-full p-4 text-left hover:bg-light-blue",
                    draft?.id === post.id && "bg-light-blue",
                  )}
                >
                  <span className="block font-semibold text-navy">{post.title}</span>
                  <span className="mt-1 block text-xs text-charcoal/65">
                    {!post.published
                      ? "Draft"
                      : post.published_at && Date.parse(post.published_at) > Date.now()
                        ? `Scheduled for ${formatDate(post.published_at)}`
                        : `Published ${formatDate(post.published_at)}`}{" "}
                    · {BLOG_CATEGORIES.find((category) => category.slug === post.category)?.label}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {draft ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
          className="space-y-5 border border-border border-t-2 border-t-navy p-6 sm:p-8"
        >
          <h2 className="text-xl font-semibold text-navy">{draft.id ? "Edit post" : "New post"}</h2>
          <TextField
            label="Title"
            value={draft.title}
            onChange={(v) => update("title", v)}
            error={errors["title"]}
            maxLength={160}
          />
          <TextField
            label="Web address"
            value={draft.slug}
            onChange={(v) => update("slug", v)}
            error={errors["slug"]}
            maxLength={100}
            hint={`futurewise…/blog/${draft.slug || "your-post"} · lowercase letters, numbers and dashes`}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Section"
              value={draft.category}
              onChange={(v) => update("category", v as BlogCategorySlug)}
              options={BLOG_CATEGORIES.map((category) => ({
                value: category.slug,
                label: category.label,
              }))}
              error={errors["category"]}
            />
            <TextField
              label="Author"
              value={draft.author_name}
              onChange={(v) => update("author_name", v)}
              error={errors["author_name"]}
              maxLength={80}
            />
          </div>
          <TextAreaField
            label="Short summary"
            value={draft.excerpt}
            onChange={(v) => update("excerpt", v)}
            error={errors["excerpt"]}
            maxLength={300}
            rows={2}
            hint="Shown on the blog page and in search results (up to 300 characters)."
          />
          <TextAreaField
            label="Post"
            value={draft.body}
            onChange={(v) => update("body", v)}
            error={errors["body"]}
            rows={16}
            hint={MARKDOWN_HINT}
          />

          <fieldset className="space-y-3 border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-navy">Cover image (optional)</legend>
            {draft.cover_image_url ? (
              <img
                src={draft.cover_image_url}
                alt=""
                className="aspect-[16/9] w-full max-w-sm border border-border object-cover"
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-11 cursor-pointer items-center border border-navy px-4 text-sm font-semibold text-navy hover:bg-light-blue">
                {busy === "upload"
                  ? "Uploading…"
                  : draft.cover_image_url
                    ? "Replace image"
                    : "Upload image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={busy !== null}
                  onChange={(event) => {
                    void onCover(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              {draft.cover_image_url ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11"
                  onClick={() => update("cover_image_url", "")}
                >
                  Remove image
                </Button>
              ) : null}
            </div>
            {errors["cover_image_url"] ? (
              <p className="text-sm text-destructive">{errors["cover_image_url"]}</p>
            ) : null}
            <TextField
              label="Image description (alt text)"
              value={draft.cover_image_alt}
              onChange={(v) => update("cover_image_alt", v)}
              error={errors["cover_image_alt"]}
              maxLength={200}
              hint="What the picture shows, in one sentence. Use only photos you have permission to use; anyone under 18 shown needs a parent's or guardian's consent."
            />
          </fieldset>

          <TextField
            label="Video link (optional)"
            value={draft.video_url}
            onChange={(v) => update("video_url", v)}
            error={errors["video_url"]}
            hint="A YouTube or Vimeo link, shown above the post."
          />
          <CheckField
            label="Published (visible on the site)"
            checked={draft.published}
            onChange={(v) => update("published", v)}
          />

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={busy !== null} className="h-11">
              {busy === "save" ? "Saving…" : "Save"}
            </Button>
            {draft.id ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy !== null}
                onClick={() => void remove()}
                className="h-11"
              >
                {busy === "delete" ? "Deleting…" : "Delete"}
              </Button>
            ) : null}
            {draft.id && draft.published ? (
              <Link
                to="/blog/$slug"
                params={{ slug: draft.slug }}
                target="_blank"
                className="text-link"
              >
                View on the site
              </Link>
            ) : null}
          </div>
          <StatusLine message={status.message} tone={status.tone} />
        </form>
      ) : (
        <div className="border border-dashed border-border p-8 text-charcoal/75">
          Choose a post to edit, or start a new one.
          <StatusLine message={status.message} tone={status.tone} />
        </div>
      )}
    </div>
  );
}
