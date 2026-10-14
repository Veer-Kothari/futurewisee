import test from "node:test";
import assert from "node:assert/strict";

import { jsonLdText } from "../../src/lib/json-ld.ts";

test("JSON-LD text can't close its script block", () => {
  const text = jsonLdText({ headline: "</script><script>alert(1)</script> & <!-- x" });
  assert.ok(!text.includes("<"));
  assert.ok(!text.includes(">"));
  assert.ok(!text.includes("&"));
  assert.equal(JSON.parse(text).headline, "</script><script>alert(1)</script> & <!-- x");
});

test("line and paragraph separators are escaped and the JSON still parses", () => {
  const value = { a: "one\u2028two\u2029three" };
  const text = jsonLdText(value);
  assert.ok(!text.includes("\u2028") && !text.includes("\u2029"));
  assert.deepEqual(JSON.parse(text), value);
});
