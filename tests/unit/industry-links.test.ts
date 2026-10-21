import test from "node:test";
import assert from "node:assert/strict";
import { INDUSTRY_SLUGS } from "../../src/lib/content-schema.ts";
import { resources, resourcesForIndustry } from "../../src/data/resources.ts";

test("resource industries are known industry slugs, each listed once", () => {
  for (const resource of resources) {
    for (const slug of resource.industries) {
      assert.ok(INDUSTRY_SLUGS.includes(slug), `${resource.id}: unknown industry ${slug}`);
    }
    assert.equal(new Set(resource.industries).size, resource.industries.length, resource.id);
  }
});

test("every industry page has Useful Links, in the resources sheet's order", () => {
  for (const slug of INDUSTRY_SLUGS) {
    const links = resourcesForIndustry(slug);
    assert.ok(links.length > 0, `${slug} has no useful links`);
    assert.ok(links.every((resource) => resource.industries.includes(slug)));
    const positions = links.map((resource) => resources.indexOf(resource));
    assert.deepEqual(
      positions,
      [...positions].sort((a, b) => a - b),
    );
  }
});
