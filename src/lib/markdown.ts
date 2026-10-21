/**
 * A small, safe Markdown subset for the blog and Industry Insights text Veer
 * writes in /admin. It produces a tree (never HTML), so whatever is typed can
 * only ever render as text, headings, lists, quotes and checked links.
 *
 * Supported: blank-line paragraphs, "## " / "### " headings ("# " counts as
 * "## "), "- " / "* " bullets, "1. " numbered lists, "> " quotes, **bold**,
 * *italic* / _italic_, [text](https://…), mailto: and site links ("/blog").
 */
// The .ts extension keeps this file importable by the plain-Node unit tests.
import { slugify } from "./slug.ts";

export type MdInline =
  | { type: "text"; text: string }
  | { type: "strong"; children: MdInline[] }
  | { type: "em"; children: MdInline[] }
  | { type: "link"; href: string; children: MdInline[] };

export type MdBlock =
  | { type: "heading"; level: 2 | 3; children: MdInline[] }
  | { type: "paragraph"; children: MdInline[] }
  | { type: "list"; ordered: boolean; items: MdInline[][] }
  | { type: "quote"; children: MdInline[] };

const MAX_DEPTH = 4;

export function isSafeHref(href: string): boolean {
  for (const ch of href) {
    const code = ch.charCodeAt(0);
    // Spaces and control characters never belong in a link target.
    if (code <= 0x20 || code === 0x7f || /\s/.test(ch)) return false;
  }
  if (/^https?:\/\/[^/]/i.test(href)) return true;
  if (/^mailto:[^@\s]+@[^@\s]+$/i.test(href)) return true;
  return /^\/(?![/\\])/.test(href);
}

function pushText(out: MdInline[], text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.type === "text") last.text += text;
  else out.push({ type: "text", text });
}

const isWordChar = (ch: string | undefined) => ch !== undefined && /[A-Za-z0-9]/.test(ch);

/** Index of the ")" that closes a link target starting at `from`, allowing nested "(…)". */
function matchingParen(text: string, from: number): number {
  let depth = 0;
  for (let j = from; j < text.length; j++) {
    const c = text[j];
    if (c === "(") depth += 1;
    else if (c === ")") {
      if (depth === 0) return j;
      depth -= 1;
    }
  }
  return -1;
}

function parseInline(text: string, depth = 0): MdInline[] {
  const out: MdInline[] = [];
  if (depth > MAX_DEPTH) {
    pushText(out, text);
    return out;
  }

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2 && text[i + 2] !== " ") {
        out.push({ type: "strong", children: parseInline(text.slice(i + 2, end), depth + 1) });
        i = end + 2;
        continue;
      }
    }

    if ((ch === "*" || ch === "_") && text[i + 1] !== ch) {
      const opensWord = ch === "*" || !isWordChar(text[i - 1]);
      const next = text[i + 1];
      if (opensWord && next !== undefined && next !== " ") {
        let end = text.indexOf(ch, i + 1);
        while (end !== -1 && ch === "_" && isWordChar(text[end + 1])) {
          end = text.indexOf(ch, end + 1);
        }
        if (end > i + 1 && text[end - 1] !== " ") {
          out.push({ type: "em", children: parseInline(text.slice(i + 1, end), depth + 1) });
          i = end + 1;
          continue;
        }
      }
    }

    if (ch === "[") {
      const close = text.indexOf("](", i + 1);
      const end = close === -1 ? -1 : matchingParen(text, close + 2);
      if (close > i && end > close) {
        const label = text.slice(i + 1, close);
        const href = text.slice(close + 2, end).trim();
        if (isSafeHref(href)) {
          out.push({ type: "link", href, children: parseInline(label, depth + 1) });
        } else {
          for (const node of parseInline(label, depth + 1)) {
            if (node.type === "text") pushText(out, node.text);
            else out.push(node);
          }
        }
        i = end + 1;
        continue;
      }
    }

    pushText(out, ch ?? "");
    i += 1;
  }
  return out;
}

export function parseMarkdownLite(source: string): MdBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length)
      blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushQuote = () => {
    if (quote.length) blocks.push({ type: "quote", children: parseInline(quote.join(" ")) });
    quote = [];
  };
  const flushList = () => {
    if (list && list.items.length) {
      blocks.push({
        type: "list",
        ordered: list.ordered,
        items: list.items.map((item) => parseInline(item)),
      });
    }
    list = null;
  };
  const flushAll = () => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flushAll();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushAll();
      const level = (heading[1] ?? "").length === 3 ? 3 : 2;
      blocks.push({ type: "heading", level, children: parseInline((heading[2] ?? "").trim()) });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = bullet ? null : line.match(/^\d{1,3}[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const text = ((bullet ?? numbered)?.[1] ?? "").trim();
      flushParagraph();
      flushQuote();
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(text);
      continue;
    }

    const quoted = line.match(/^>\s?(.*)$/);
    if (quoted) {
      flushParagraph();
      flushList();
      const text = (quoted[1] ?? "").trim();
      if (text) quote.push(text);
      continue;
    }

    if (list) {
      const current: { ordered: boolean; items: string[] } = list;
      const lastIndex = current.items.length - 1;
      current.items[lastIndex] = `${current.items[lastIndex] ?? ""} ${line}`;
      continue;
    }
    if (quote.length) {
      quote.push(line);
      continue;
    }
    paragraph.push(line);
  }
  flushAll();
  return blocks;
}

/** The plain text of inline nodes, without the bold/italic/link markers. */
export function inlineText(nodes: MdInline[]): string {
  return nodes
    .map((node) => (node.type === "text" ? node.text : inlineText(node.children)))
    .join("");
}

export type MdHeading = { index: number; id: string; text: string };

/**
 * The "## " headings with anchor ids for a table of contents
 * ("Main Areas of Law" → "main-areas-of-law"; a repeated heading gets -2, -3).
 * `index` is the heading's position in `blocks`.
 */
export function outlineHeadings(blocks: MdBlock[]): MdHeading[] {
  const used = new Set<string>();
  const headings: MdHeading[] = [];
  blocks.forEach((block, index) => {
    if (block.type !== "heading" || block.level !== 2) return;
    const text = inlineText(block.children).trim();
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    headings.push({ index, id, text });
  });
  return headings;
}
