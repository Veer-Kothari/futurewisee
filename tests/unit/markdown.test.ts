import test from "node:test";
import assert from "node:assert/strict";
import { outlineHeadings, parseMarkdownLite } from "../../src/lib/markdown.ts";

const text = (value: string) => [{ type: "text", text: value }];
function flatten(nodes): string {
  return nodes.map((node) => (node.type === "text" ? node.text : flatten(node.children))).join("");
}
function inlines(block) {
  return block.type === "list" ? block.items.flat() : block.children;
}
function links(nodes) {
  return nodes.flatMap((node) =>
    node.type === "text"
      ? []
      : [...(node.type === "link" ? [node.href] : []), ...links(node.children)],
  );
}
function assertSafe(nodes) {
  for (const node of nodes) {
    assert.ok(["text", "strong", "em", "link"].includes(node.type));
    if (node.type === "text") {
      assert.equal(typeof node.text, "string");
      assert.equal("html" in node, false);
    } else assertSafe(node.children);
  }
}
test("markdown is empty for blank input and joins paragraph newlines with spaces", () => {
  assert.deepEqual(parseMarkdownLite(""), []);
  assert.deepEqual(parseMarkdownLite(" \n\n "), []);
  assert.deepEqual(parseMarkdownLite("First line\nsecond line\n\nNext paragraph"), [
    { type: "paragraph", children: text("First line second line") },
    { type: "paragraph", children: text("Next paragraph") },
  ]);
});
test("markdown recognises h1 as h2, h2 and h3 headings", () => {
  assert.deepEqual(parseMarkdownLite("# One\n\n## Two\n\n### Three"), [
    { type: "heading", level: 2, children: text("One") },
    { type: "heading", level: 2, children: text("Two") },
    { type: "heading", level: 3, children: text("Three") },
  ]);
});
test("markdown recognises dash/star bullets, ordered lists and quotes", () => {
  assert.deepEqual(parseMarkdownLite("- First\n* Second\n\n1. One\n2. Two\n\n> A quote"), [
    { type: "list", ordered: false, items: [text("First"), text("Second")] },
    { type: "list", ordered: true, items: [text("One"), text("Two")] },
    { type: "quote", children: text("A quote") },
  ]);
});
test("markdown supports bold and both italic delimiters", () => {
  assert.deepEqual(parseMarkdownLite("**Bold** *italic* _also italic_"), [
    {
      type: "paragraph",
      children: [
        { type: "strong", children: text("Bold") },
        ...text(" "),
        { type: "em", children: text("italic") },
        ...text(" "),
        { type: "em", children: text("also italic") },
      ],
    },
  ]);
});
test("markdown allows only HTTP(S), mailto and site-relative links", () => {
  for (const href of [
    "https://example.org/a?q=1#x",
    "http://example.org/",
    "mailto:a@example.org",
    "/resources?section=tools#one",
  ]) {
    assert.deepEqual(parseMarkdownLite("[Read](" + href + ")"), [
      { type: "paragraph", children: [{ type: "link", href, children: text("Read") }] },
    ]);
  }
});
test("unsafe links stay plain text and never produce a link node", () => {
  for (const href of [
    "javascript:alert",
    "JaVaScRiPt:alert",
    "data:text/html,evil",
    "//evil.example",
    "ftp://example.org",
    "relative-path",
    "#anchor",
  ]) {
    const blocks = parseMarkdownLite("[Unsafe](" + href + ")");
    assert.equal(blocks.length, 1);
    assert.deepEqual(links(inlines(blocks[0])), [], href);
    assert.ok(
      inlines(blocks[0]).every((node) => node.type === "text"),
      href,
    );
    assert.ok(flatten(inlines(blocks[0])).includes("Unsafe"), href);
  }
});
test("raw HTML is inert text, never an HTML node or extracted link", () => {
  const source =
    '<script>alert(1)</script> <img src=x onerror=alert(1)> <a href="javascript:alert(1)">click</a>';
  const blocks = parseMarkdownLite(source);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "paragraph");
  assert.equal(flatten(inlines(blocks[0])), source);
  assertSafe(inlines(blocks[0]));
  assert.deepEqual(links(inlines(blocks[0])), []);
});
test("CRLF input produces the same blocks as LF", () => {
  const source = "## Title\n\nFirst\nsecond\n\n- Item\n- Another\n\n> Quote";
  assert.deepEqual(parseMarkdownLite(source.replace(/\n/g, "\r\n")), parseMarkdownLite(source));
});
test("outline gives each ## heading a stable, unique anchor id", () => {
  const blocks = parseMarkdownLite(
    "## Skills Needed\n\ntext\n\n### Technical skills\n\n## M&A **Basics**\n\n## Skills Needed\n\n## Skills Needed 2\n\n## !!!",
  );
  assert.deepEqual(outlineHeadings(blocks), [
    { index: 0, id: "skills-needed", text: "Skills Needed" },
    { index: 3, id: "m-and-a-basics", text: "M&A Basics" },
    { index: 4, id: "skills-needed-2", text: "Skills Needed" },
    { index: 5, id: "skills-needed-2-2", text: "Skills Needed 2" },
    { index: 6, id: "section", text: "!!!" },
  ]);
});
test("markdown reads pipe tables, with or without a separator line", () => {
  const blocks = parseMarkdownLite(
    "Intro\n| Category | Amount |\n|---|---|\n| Food | **OMR 8** |\n| Total |\n\nAfter",
  );
  assert.equal(blocks.length, 3);
  const table = blocks[1];
  assert.equal(table.type, "table");
  assert.deepEqual(table.header.map(flatten), ["Category", "Amount"]);
  assert.deepEqual(
    table.rows.map((row) => row.map(flatten)),
    [
      ["Food", "OMR 8"],
      ["Total", ""],
    ],
  );
  assert.equal(table.rows[0][1][0].type, "strong");
  assert.deepEqual(
    parseMarkdownLite("| A | B |\n| 1 | 2 |")[0].rows.map((r) => r.map(flatten)),
    [["1", "2"]],
  );
});
