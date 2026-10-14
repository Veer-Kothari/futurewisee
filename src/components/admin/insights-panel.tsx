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
import { getIndustry, industries } from "@/data/industries";
import {
  INSIGHT_KINDS,
  insightInputSchema,
  type IndustrySlug,
  type InsightKind,
} from "@/lib/content-schema";
import type { InsightItem } from "@/lib/content";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Draft = {
  id: string | null;
  industry: IndustrySlug;
  kind: InsightKind;
  title: string;
  summary: string;
  body: string;
  video_url: string;
  link_url: string;
  file_url: string;
  file_name: string;
  position: string;
  published: boolean;
};

const emptyDraft = (industry: IndustrySlug): Draft => ({
  id: null,
  industry,
  kind: "video",
  title: "",
  summary: "",
  body: "",
  video_url: "",
  link_url: "",
  file_url: "",
  file_name: "",
  position: "0",
  published: false,
});

const fromItem = (item: InsightItem): Draft => ({
  id: item.id,
  industry: item.industry,
  kind: item.kind,
  title: item.title,
  summary: item.summary,
  body: item.body,
  video_url: item.video_url ?? "",
  link_url: item.link_url ?? "",
  file_url: item.file_url ?? "",
  file_name: item.file_name ?? "",
  position: String(item.position),
  published: item.published,
});

const kindLabel = (kind: InsightKind) =>
  INSIGHT_KINDS.find((entry) => entry.value === kind)?.label ?? kind;

export function InsightsPanel() {
  const [industry, setIndustry] = useState<IndustrySlug>("law");
  const [items, setItems] = useState<InsightItem[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ message: string; tone: "ok" | "error" | "idle" }>({
    message: "",
    tone: "idle",
  });
  const [busy, setBusy] = useState<"save" | "delete" | "upload" | null>(null);

  const load = useCallback(async (slug: IndustrySlug) => {
    const supabase = getSupabase();
    if (!supabase) return;
    setItems(null);
    const { data, error } = await supabase
      .from("insight_items")
      .select("*")
      .eq("industry", slug)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      setStatus({ message: "Items couldn't be loaded. Refresh to try again.", tone: "error" });
      setItems([]);
      return;
    }
    setItems((data as InsightItem[]) ?? []);
  }, []);

  useEffect(() => {
    void load(industry);
  }, [industry, load]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  async function save() {
    if (!draft) return;
    const position = Number.parseInt(draft.position, 10);
    const parsed = insightInputSchema.safeParse({
      industry: draft.industry,
      kind: draft.kind,
      title: draft.title,
      summary: draft.summary,
      body: draft.kind === "guide" ? draft.body : "",
      video_url: draft.kind === "video" ? draft.video_url : "",
      link_url: draft.kind === "course" || draft.kind === "link" ? draft.link_url : "",
      file_url: draft.kind === "course" ? draft.file_url : "",
      file_name: draft.kind === "course" ? draft.file_name : "",
      position: Number.isFinite(position) ? position : -1,
      published: draft.published,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error.issues));
      setStatus({ message: "Please fix the highlighted fields.", tone: "error" });
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setErrors({});
    setBusy("save");
    const result = draft.id
      ? await supabase
          .from("insight_items")
          .update(parsed.data)
          .eq("id", draft.id)
          .select("*")
          .single()
      : await supabase.from("insight_items").insert(parsed.data).select("*").single();
    setBusy(null);
    if (result.error) {
      setStatus({ message: "The item couldn't be saved. Please try again.", tone: "error" });
      return;
    }
    const saved = result.data as InsightItem;
    setDraft(fromItem(saved));
    setStatus({
      message: saved.published
        ? "Saved and published."
        : "Saved as a draft (not visible on the site).",
      tone: "ok",
    });
    if (saved.industry !== industry) setIndustry(saved.industry);
    else void load(industry);
  }

  async function remove() {
    if (!draft?.id || !window.confirm(`Delete “${draft.title}”? This can't be undone.`)) return;
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy("delete");
    const { error } = await supabase.from("insight_items").delete().eq("id", draft.id);
    setBusy(null);
    if (error) {
      setStatus({ message: "The item couldn't be deleted. Please try again.", tone: "error" });
      return;
    }
    setDraft(null);
    setStatus({ message: "Item deleted.", tone: "ok" });
    void load(industry);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    const result = await uploadMedia(file, "material");
    setBusy(null);
    if ("error" in result) {
      setErrors((current) => ({ ...current, file_url: result.error }));
      return;
    }
    setDraft((current) =>
      current ? { ...current, file_url: result.url, file_name: result.name } : current,
    );
    setErrors((current) => ({ ...current, file_url: "" }));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
      <div className="space-y-5">
        <SelectField
          label="Industry"
          value={industry}
          onChange={(value) => {
            setIndustry(value as IndustrySlug);
            setDraft(null);
          }}
          options={industries.map((entry) => ({ value: entry.slug, label: entry.name }))}
        />
        <Button
          type="button"
          className="h-11 w-full"
          onClick={() => {
            setDraft(emptyDraft(industry));
            setErrors({});
            setStatus({ message: "", tone: "idle" });
          }}
        >
          New item for {getIndustry(industry)?.name}
        </Button>
        <ul className="divide-y divide-border border border-border">
          {items === null ? (
            <li className="p-4 text-sm text-charcoal/70">Loading…</li>
          ) : items.length === 0 ? (
            <li className="p-4 text-sm text-charcoal/70">Nothing for this industry yet.</li>
          ) : (
            items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(fromItem(item));
                    setErrors({});
                    setStatus({ message: "", tone: "idle" });
                  }}
                  className={cn(
                    "w-full p-4 text-left hover:bg-light-blue",
                    draft?.id === item.id && "bg-light-blue",
                  )}
                >
                  <span className="block font-semibold text-navy">{item.title}</span>
                  <span className="mt-1 block text-xs text-charcoal/65">
                    {kindLabel(item.kind)} · {item.published ? "Published" : "Draft"} · order{" "}
                    {item.position}
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
          <h2 className="text-xl font-semibold text-navy">{draft.id ? "Edit item" : "New item"}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Industry"
              value={draft.industry}
              onChange={(value) => update("industry", value as IndustrySlug)}
              options={industries.map((entry) => ({ value: entry.slug, label: entry.name }))}
              error={errors["industry"]}
            />
            <SelectField
              label="Type"
              value={draft.kind}
              onChange={(value) => update("kind", value as InsightKind)}
              options={INSIGHT_KINDS}
              error={errors["kind"]}
            />
          </div>
          <TextField
            label="Title"
            value={draft.title}
            onChange={(v) => update("title", v)}
            error={errors["title"]}
            maxLength={160}
          />
          <TextAreaField
            label="Short description"
            value={draft.summary}
            onChange={(v) => update("summary", v)}
            error={errors["summary"]}
            maxLength={500}
            rows={3}
          />

          {draft.kind === "video" ? (
            <TextField
              label="Video link"
              value={draft.video_url}
              onChange={(v) => update("video_url", v)}
              error={errors["video_url"]}
              hint="A YouTube or Vimeo link. It plays on the page only when a visitor presses play."
            />
          ) : null}

          {draft.kind === "course" ? (
            <fieldset className="space-y-3 border border-border p-4">
              <legend className="px-1 text-sm font-semibold text-navy">Course material</legend>
              <p className="text-sm text-charcoal/75">
                Upload a file (PDF or image, up to 20 MB), add a link to an online course, or both.
              </p>
              {draft.file_url ? (
                <p className="text-sm text-charcoal">
                  File:{" "}
                  <a
                    href={draft.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-navy underline"
                  >
                    {draft.file_name || "uploaded file"}
                  </a>
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex h-11 cursor-pointer items-center border border-navy px-4 text-sm font-semibold text-navy hover:bg-light-blue">
                  {busy === "upload"
                    ? "Uploading…"
                    : draft.file_url
                      ? "Replace file"
                      : "Upload file"}
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={busy !== null}
                    onChange={(event) => {
                      void onFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                {draft.file_url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11"
                    onClick={() =>
                      setDraft((current) =>
                        current ? { ...current, file_url: "", file_name: "" } : current,
                      )
                    }
                  >
                    Remove file
                  </Button>
                ) : null}
              </div>
              {errors["file_url"] ? (
                <p className="text-sm text-destructive">{errors["file_url"]}</p>
              ) : null}
              <TextField
                label="Course link (optional)"
                value={draft.link_url}
                onChange={(v) => update("link_url", v)}
                error={errors["link_url"]}
              />
            </fieldset>
          ) : null}

          {draft.kind === "link" ? (
            <TextField
              label="Link"
              value={draft.link_url}
              onChange={(v) => update("link_url", v)}
              error={errors["link_url"]}
            />
          ) : null}

          {draft.kind === "guide" ? (
            <TextAreaField
              label="Guide"
              value={draft.body}
              onChange={(v) => update("body", v)}
              error={errors["body"]}
              rows={16}
              hint={MARKDOWN_HINT}
            />
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Order on the page"
              type="number"
              value={draft.position}
              onChange={(v) => update("position", v)}
              error={errors["position"]}
              hint="Lower numbers show first."
            />
          </div>
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
                to="/industry-resources/$industry"
                params={{ industry: draft.industry }}
                hash={`item-${draft.id}`}
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
          Choose an item to edit, or add a new one for {getIndustry(industry)?.name}.
          <StatusLine message={status.message} tone={status.tone} />
        </div>
      )}
    </div>
  );
}
