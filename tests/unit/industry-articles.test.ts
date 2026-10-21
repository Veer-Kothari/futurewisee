import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { INDUSTRY_SLUGS } from "../../src/lib/content-schema.ts";
import { outlineHeadings, parseMarkdownLite } from "../../src/lib/markdown.ts";

const dir = fileURLToPath(new URL("../../src/content/industries/", import.meta.url));
const read = (slug: string) => readFileSync(`${dir}${slug}.md`, "utf8");

test("there is one article file per industry", () => {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
    .sort();
  assert.deepEqual(files, [...INDUSTRY_SLUGS].sort());
});

test("articles leave out the cheat-sheet template's notes and the Expert FAQs", () => {
  const leftovers = [
    /\[(?:RESEARCH|EXPERT|LINK TO|ANSWER|CONFIRM|DATE|IN PERSON)/i,
    /expert faqs?/i,
    /meet the expert/i,
    /\\[[\]&]/, // Google Docs export escapes
    /^# /m, // the page has the h1
    /^-{3,}$/m, // the separator before the FAQs
  ];
  for (const slug of INDUSTRY_SLUGS) {
    const text = read(slug);
    for (const pattern of leftovers) assert.doesNotMatch(text, pattern, `${slug}.md: ${pattern}`);
  }
});

test("articles open with a section heading and have unique anchors", () => {
  for (const slug of INDUSTRY_SLUGS) {
    const blocks = parseMarkdownLite(read(slug));
    assert.equal(blocks[0]?.type, "heading", slug);
    const ids = outlineHeadings(blocks).map((heading) => heading.id);
    assert.ok(ids.length >= 3, slug);
    assert.equal(new Set(ids).size, ids.length, slug);
    // Taken by the Useful Links panel and the page's own sections.
    for (const id of ids) assert.ok(!/^(useful-links|section-|item-|main$)/.test(id), id);
  }
});
