import test from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../../src/lib/slug.ts";

test("slug lowercases ASCII and strips composed and combining accents", () => {
  assert.equal(slugify("Café Déjà VU"), "cafe-deja-vu");
  assert.equal(slugify("Cafe\u0301"), "cafe");
});
test("slug replaces ampersands and collapses punctuation or whitespace", () => {
  assert.equal(slugify("  Investment Banking & Trading!  "), "investment-banking-and-trading");
  assert.equal(slugify("A&B"), "aandb");
  assert.equal(slugify("--Skills__for / 2026---"), "skills-for-2026");
});
test("slug is empty when nothing usable remains", () => {
  for (const input of ["", "   ", "!!!", "---", "你好", "😀"])
    assert.equal(slugify(input), "", input);
});
test("slug cuts long input at a word boundary when possible", () => {
  assert.equal(slugify("a".repeat(90) + "-" + "b".repeat(20)), "a".repeat(90));
  assert.equal(slugify("a".repeat(100) + "-tail"), "a".repeat(100));
  assert.equal(slugify("a".repeat(101)), "a".repeat(100));
});
test("slug always matches the grammar and remains stable", () => {
  for (const input of ["A & B", "a".repeat(99) + "---B", " - é / 42 - ", "___", "a-".repeat(200)]) {
    const slug = slugify(input);
    assert.ok(slug.length <= 100);
    assert.ok(slug === "" || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug), slug);
    assert.equal(slugify(slug), slug);
  }
});
