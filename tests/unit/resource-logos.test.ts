import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resources } from "../../src/data/resources.ts";

const dir = fileURLToPath(new URL("../../src/assets/resource-logos/", import.meta.url));
const files = readdirSync(dir);
const ids = new Set(resources.map((resource) => resource.id));
const idOf = (name: string) => name.replace(/\.(?:png|ico|jpe?g|webp)(?:\.asset\.json)?$/, "");

test("every logo file belongs to a resource", () => {
  for (const name of files) assert.ok(ids.has(idOf(name)), `${name}: no resource with that id`);
});

// Plain files are checked by their bytes (an SVG or error page saved as .png fails);
// Lovable uploads only by their recorded type, since their bytes live on Lovable's host.
test("logo files are images of the type their name says", () => {
  const signatures: Record<string, number[]> = {
    png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    jpg: [0xff, 0xd8, 0xff],
    jpeg: [0xff, 0xd8, 0xff],
  };
  for (const name of files) {
    if (name.endsWith(".asset.json")) {
      const asset = JSON.parse(readFileSync(`${dir}${name}`, "utf8"));
      assert.match(asset.content_type, /^image\//, `${name}: ${asset.content_type}`);
      continue;
    }
    const signature = signatures[name.split(".").at(-1) ?? ""];
    if (!signature) continue;
    const head = [...readFileSync(`${dir}${name}`).subarray(0, signature.length)];
    assert.deepEqual(head, signature, `${name} is not the image type its name says`);
  }
});
