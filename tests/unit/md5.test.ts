import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

test("MD5 helper supplies UTF-8 lowercase hashes for Mailchimp", async (t) => {
  // Import inside the test: a missing helper fails this file without stopping discovery.
  const { md5Hex } = await import("../../src/lib/md5.ts");
  const vectors = [
    ["", "d41d8cd98f00b204e9800998ecf8427e"],
    ["abc", "900150983cd24fb0d6963f7d28e17f72"],
    ["The quick brown fox jumps over the lazy dog", "9e107d9d372bb6826bd81d3542a419d6"],
    ["é", "66ddcd97cfdeabb2f6fb8a999b4bc76f"],
    ["a".repeat(1000), createHash("md5").update("a".repeat(1000), "utf8").digest("hex")],
    ["Oman 🇴🇲 café", createHash("md5").update("Oman 🇴🇲 café", "utf8").digest("hex")],
  ];
  for (const [input, expected] of vectors)
    await t.test(
      "vector: " + JSON.stringify(input.length > 80 ? input.slice(0, 20) + "…" : input),
      () => {
        assert.equal(md5Hex(input), expected);
        assert.match(md5Hex(input), /^[a-f0-9]{32}$/);
      },
    );
  await t.test("subscriber hashing uses the lowercased email", () => {
    const email = "Student@Example.ORG";
    const expected = createHash("md5").update(email.toLowerCase(), "utf8").digest("hex");
    assert.equal(md5Hex(email.toLowerCase()), expected);
    assert.notEqual(md5Hex(email), expected);
  });
});
