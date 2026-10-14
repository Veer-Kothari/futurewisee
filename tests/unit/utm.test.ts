import test from "node:test";
import assert from "node:assert/strict";
import { UTM_DEFAULTS, withUtm, resourceHref } from "../../src/lib/utm.ts";

test("UTM defaults match the resource-link contract", () => {
  assert.deepEqual(UTM_DEFAULTS, {
    source: "futurewise",
    medium: "referral",
    campaign: "resources",
  });
});
test("UTM adds defaults and content while keeping query values and hash", () => {
  const result = new URL(
    withUtm("https://example.org/read?q=a%20b&x=1&x=2#chapter", { content: "course-one" }),
  );
  assert.equal(result.origin + result.pathname, "https://example.org/read");
  assert.equal(result.hash, "#chapter");
  assert.equal(result.searchParams.get("q"), "a b");
  assert.deepEqual(result.searchParams.getAll("x"), ["1", "2"]);
  for (const [key, value] of Object.entries({
    source: "futurewise",
    medium: "referral",
    campaign: "resources",
    content: "course-one",
  })) {
    assert.equal(result.searchParams.get("utm_" + key), value);
  }
});
test("UTM preserves existing tags, including blank and repeated tags", () => {
  const url =
    "http://example.org/?utm_source=original&utm_source=second&utm_medium=&utm_campaign=old&utm_content=kept&utm_term=term#x";
  const result = new URL(
    withUtm(url, { source: "new", medium: "new", campaign: "new", content: "new" }),
  );
  assert.deepEqual(result.searchParams.getAll("utm_source"), ["original", "second"]);
  assert.equal(result.searchParams.get("utm_medium"), "");
  assert.equal(result.searchParams.get("utm_campaign"), "old");
  assert.equal(result.searchParams.get("utm_content"), "kept");
  assert.equal(result.searchParams.get("utm_term"), "term");
  assert.equal(result.hash, "#x");
});
test("UTM honours custom options and omits content when not given", () => {
  const result = new URL(
    withUtm("https://example.org/", { source: "a b", medium: "email", campaign: "autumn" }),
  );
  assert.equal(result.searchParams.get("utm_source"), "a b");
  assert.equal(result.searchParams.get("utm_medium"), "email");
  assert.equal(result.searchParams.get("utm_campaign"), "autumn");
  assert.equal(result.searchParams.has("utm_content"), false);
});
test("UTM is idempotent", () => {
  const once = withUtm("https://example.org/a#b");
  assert.equal(withUtm(once), once);
});
test("UTM returns invalid, relative and non-http URLs unchanged", () => {
  for (const url of [
    "",
    "not a url",
    "/resource",
    "//example.org",
    "https://",
    "mailto:a@example.org",
    "ftp://example.org",
    "javascript:alert(1)",
    "data:text/plain,hi",
  ]) {
    assert.equal(withUtm(url), url, url);
  }
});
test("resource href uses a present affiliate URL exactly as supplied", () => {
  const affiliateUrl = "https://partner.example.org/?ref=fw#offer";
  assert.equal(
    resourceHref({ id: "guide", url: "https://example.org/", affiliateUrl }),
    affiliateUrl,
  );
});
test("resource href otherwise uses the id as utm_content", () => {
  for (const resource of [
    { id: "guide", url: "https://example.org/" },
    { id: "guide", url: "https://example.org/", affiliateUrl: null },
  ]) {
    assert.equal(resourceHref(resource), withUtm(resource.url, { content: resource.id }));
    assert.equal(new URL(resourceHref(resource)).searchParams.get("utm_content"), "guide");
  }
});
