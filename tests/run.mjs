import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

function collect(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collect(full);
    return /\.test\.(ts|mjs)$/.test(entry.name) ? [full] : [];
  });
}

const files = collect(root).sort();
if (files.length === 0) {
  console.log("no tests yet");
  process.exit(0);
}
const result = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--no-warnings", "--test", ...files],
  { stdio: "inherit" },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
