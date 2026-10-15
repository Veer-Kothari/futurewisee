import { slugify } from "@/lib/slug";
import { getSupabase } from "@/lib/supabase/client";

/** One CSV cell: arrays joined with "; ", formula-looking text prefixed so spreadsheets don't run it. */
function csvCell(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ""
      : Array.isArray(value)
        ? value.join("; ")
        : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(
  rows: Array<Record<string, unknown>>,
  columns: Array<[key: string, label: string]>,
): string {
  const header = columns.map(([, label]) => csvCell(label)).join(",");
  const lines = rows.map((row) => columns.map(([key]) => csvCell(row[key])).join(","));
  return [header, ...lines].join("\r\n");
}

export function downloadFile(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob(["﻿", content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking straight away cancels the download in Safari and Firefox.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export { fetchAll } from "@/lib/fetch-all";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_TYPES = [...IMAGE_TYPES, "application/pdf"];
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_FILE = 20 * 1024 * 1024;

/** Uploads to the public content-media bucket (admins only, enforced by storage policies). */
export async function uploadMedia(
  file: File,
  kind: "image" | "material",
): Promise<{ url: string; name: string } | { error: string }> {
  const allowed = kind === "image" ? IMAGE_TYPES : FILE_TYPES;
  if (!allowed.includes(file.type)) {
    return {
      error:
        kind === "image" ? "Use a JPG, PNG or WebP image." : "Use a PDF, JPG, PNG or WebP file.",
    };
  }
  if (file.size > (kind === "image" ? MAX_IMAGE : MAX_FILE)) {
    return { error: kind === "image" ? "Images can be up to 5 MB." : "Files can be up to 20 MB." };
  }
  const supabase = getSupabase();
  if (!supabase) return { error: "Uploads aren't available right now." };

  const dot = file.name.lastIndexOf(".");
  const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name) || "file";
  const extension = file.type === "application/pdf" ? "pdf" : (file.type.split("/")[1] ?? "bin");
  const path = `${kind === "image" ? "images" : "materials"}/${Date.now()}-${base.slice(0, 60)}.${extension}`;
  const { error } = await supabase.storage
    .from("content-media")
    .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
  if (error) return { error: "The upload didn't work. Please try again." };
  const { data } = supabase.storage.from("content-media").getPublicUrl(path);
  return { url: data.publicUrl, name: file.name.slice(0, 200) };
}

export function zodFieldErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
