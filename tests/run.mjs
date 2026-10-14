// Contract skeleton (claudex-split): the Codex lane owns tests/** and fills this in.
// Runs every tests/**/*.test.{ts,mjs} with Node's test runner (TypeScript via --experimental-strip-types).
import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function collect(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...collect(full));
    else if (/\.test\.(ts|mjs)$/.test(name)) out.push(full);
  }
  return out;
}

const files = collect(root);
if (files.length === 0) {
  console.log("no tests yet");
  process.exit(0);
}
const result = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--no-warnings", "--test", ...files],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
