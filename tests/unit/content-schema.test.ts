import test from "node:test";
import assert from "node:assert/strict";
import {
  BLOG_CATEGORIES,
  defaultAuthorFor,
  INDUSTRY_SLUGS,
  INSIGHT_KINDS,
  postInputSchema,
  insightInputSchema,
} from "../../src/lib/content-schema.ts";

const post = {
  slug: "student-guide",
  title: "Student guide",
  category: "personal-finance",
  author_name: "Student author",
  excerpt: "",
  body: "",
  cover_image_url: null,
  cover_image_alt: "",
  video_url: null,
  published: false,
};
const insight = {
  industry: "law",
  kind: "guide",
  title: "Getting started",
  summary: "",
  body: "Read this guide.",
  video_url: null,
  link_url: null,
  file_url: null,
  file_name: null,
  position: 0,
  published: false,
};

test("each blog section has its own byline", () => {
  assert.equal(defaultAuthorFor("personal-finance"), "Veer Kothari");
  assert.equal(defaultAuthorFor("practical-skills"), "William Darker");
});

test("content enums match the publishing contract", () => {
  assert.deepEqual(BLOG_CATEGORIES, [
    { slug: "personal-finance", label: "Personal Finance", defaultAuthor: "Veer Kothari" },
    {
      slug: "practical-skills",
      label: "The Practical Skills Guide",
      defaultAuthor: "William Darker",
    },
  ]);
  assert.deepEqual(INDUSTRY_SLUGS, [
    "law",
    "entrepreneurship",
    "investment-banking-and-trading",
    "other-finance",
    "tax",
    "economics",
    "operations",
  ]);
  assert.deepEqual(INSIGHT_KINDS, [
    { value: "video", label: "Video" },
    { value: "course", label: "Course material" },
    { value: "guide", label: "Guide" },
    { value: "link", label: "Link" },
  ]);
});
test("content accepts each category and industry, rejects unknown enums", () => {
  for (const { slug } of BLOG_CATEGORIES)
    assert.ok(postInputSchema.safeParse({ ...post, category: slug }).success);
  for (const industry of INDUSTRY_SLUGS)
    assert.ok(insightInputSchema.safeParse({ ...insight, industry }).success);
  assert.equal(postInputSchema.safeParse({ ...post, category: "unknown" }).success, false);
  assert.equal(insightInputSchema.safeParse({ ...insight, industry: "medicine" }).success, false);
  assert.equal(insightInputSchema.safeParse({ ...insight, kind: "podcast" }).success, false);
});
test("content trims input strings including body", () => {
  const result = postInputSchema.parse({
    ...post,
    slug: " student-guide ",
    title: " Title ",
    author_name: " Author ",
    excerpt: " Excerpt ",
    body: " Body ",
    cover_image_alt: " Alt ",
  });
  for (const [key, expected] of Object.entries({
    slug: "student-guide",
    title: "Title",
    author_name: "Author",
    excerpt: "Excerpt",
    body: "Body",
    cover_image_alt: "Alt",
  }))
    assert.equal(result[key], expected, key);
  const item = insightInputSchema.parse({
    ...insight,
    title: " Title ",
    summary: " Summary ",
    body: " Body ",
    file_name: " File.pdf ",
  });
  for (const [key, expected] of Object.entries({
    title: "Title",
    summary: "Summary",
    body: "Body",
    file_name: "File.pdf",
  }))
    assert.equal(item[key], expected, key);
});
test("post slug is lowercase ASCII, separated by single dashes, at most 100 characters", () => {
  for (const slug of ["a", "guide-2026", "a".repeat(100)])
    assert.ok(postInputSchema.safeParse({ ...post, slug }).success);
  for (const slug of [
    "",
    "   ",
    "Uppercase",
    "café",
    "has space",
    "under_score",
    "-start",
    "end-",
    "double--dash",
    "a".repeat(101),
  ])
    assert.equal(postInputSchema.safeParse({ ...post, slug }).success, false, slug);
});
test("post enforces all text limits with inclusive upper boundaries", () => {
  for (const [field, max] of Object.entries({
    title: 160,
    author_name: 80,
    excerpt: 300,
    body: 50000,
    cover_image_alt: 200,
  })) {
    assert.ok(
      postInputSchema.safeParse({ ...post, [field]: "a".repeat(max) }).success,
      field + " at limit",
    );
    assert.equal(
      postInputSchema.safeParse({ ...post, [field]: "a".repeat(max + 1) }).success,
      false,
      field + " above limit",
    );
  }
  for (const field of ["title", "author_name"])
    for (const value of ["", "  "])
      assert.equal(postInputSchema.safeParse({ ...post, [field]: value }).success, false, field);
});
test("insight enforces text limits and position integer 0–10000", () => {
  for (const [field, max] of Object.entries({
    title: 160,
    summary: 500,
    body: 30000,
    file_name: 200,
  })) {
    assert.ok(
      insightInputSchema.safeParse({ ...insight, [field]: "a".repeat(max) }).success,
      field + " at limit",
    );
    assert.equal(
      insightInputSchema.safeParse({ ...insight, [field]: "a".repeat(max + 1) }).success,
      false,
      field + " above limit",
    );
  }
  for (const title of ["", "   "])
    assert.equal(insightInputSchema.safeParse({ ...insight, title }).success, false);
  for (const position of [0, 1, 10000])
    assert.ok(insightInputSchema.safeParse({ ...insight, position }).success);
  for (const position of [-1, 10001, 2.5, "1", NaN, Infinity])
    assert.equal(insightInputSchema.safeParse({ ...insight, position }).success, false);
});
test("all optional URLs trim, normalise empty to null, and require valid HTTPS within 500 characters", () => {
  for (const [schema, base, fields] of [
    [postInputSchema, post, ["cover_image_url", "video_url"]],
    [insightInputSchema, insight, ["video_url", "link_url", "file_url"]],
  ]) {
    for (const field of fields) {
      for (const value of [null, "", "   "])
        assert.equal(schema.parse({ ...base, [field]: value })[field], null, field);
      assert.equal(
        schema.parse({ ...base, [field]: " https://example.org/path?q=1#x " })[field],
        "https://example.org/path?q=1#x",
      );
      const atLimit = "https://example.org/" + "a".repeat(480);
      assert.equal(atLimit.length, 500);
      assert.ok(schema.safeParse({ ...base, [field]: atLimit }).success, field);
      for (const url of [
        atLimit + "a",
        "http://example.org",
        "//example.org",
        "/file.pdf",
        "javascript:alert(1)",
        "data:text/plain,hello",
        "https://",
        "https://example.org/has space",
        "https://?",
        "not-a-url",
      ])
        assert.equal(
          schema.safeParse({ ...base, [field]: url }).success,
          false,
          field + ": " + url,
        );
    }
  }
});
test("insight kind-specific content is required", () => {
  const empty = { ...insight, body: "" };
  for (const kind of ["video", "course", "link", "guide"])
    assert.equal(insightInputSchema.safeParse({ ...empty, kind }).success, false, kind);
  assert.equal(
    insightInputSchema.safeParse({ ...empty, kind: "guide", body: "   " }).success,
    false,
  );
  for (const item of [
    { ...empty, kind: "video", video_url: "https://youtu.be/abcdefghijk" },
    { ...empty, kind: "course", file_url: "https://example.org/course.pdf" },
    { ...empty, kind: "course", link_url: "https://example.org/course" },
    { ...empty, kind: "link", link_url: "https://example.org/" },
    { ...empty, kind: "guide", body: "Guide text" },
  ])
    assert.ok(insightInputSchema.safeParse(item).success, item.kind);
  assert.equal(
    insightInputSchema.safeParse({ ...empty, kind: "video", link_url: "https://example.org/" })
      .success,
    false,
  );
  assert.equal(
    insightInputSchema.safeParse({
      ...empty,
      kind: "link",
      file_url: "https://example.org/file.pdf",
    }).success,
    false,
  );
});
test("published must be boolean in both schemas", () => {
  for (const [schema, base] of [
    [postInputSchema, post],
    [insightInputSchema, insight],
  ]) {
    for (const published of [true, false])
      assert.ok(schema.safeParse({ ...base, published }).success);
    for (const published of ["true", 1, null, undefined])
      assert.equal(schema.safeParse({ ...base, published }).success, false);
  }
});
