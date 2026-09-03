import { readFileSync, existsSync } from "node:fs";

// Next 15.5.25 (webpack) emits the App Router first-load map here. Each value is
// the ordered list of chunks a route ships on first load, relative to `.next/`.
const manifestPath = ".next/app-build-manifest.json";
if (!existsSync(manifestPath)) {
  console.error("assert-bundle: run `next build` first");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const firstLoad = new Set();
for (const files of Object.values(manifest.pages ?? {})) {
  for (const f of files) firstLoad.add(f);
}

const offenders = [];
for (const chunk of firstLoad) {
  if (!chunk.endsWith(".js")) continue;
  const path = `.next/${chunk}`;
  if (!existsSync(path)) continue;
  const src = readFileSync(path, "utf8");
  if (/three\/build\/three|@react-three\/fiber/.test(src)) offenders.push(chunk);
}

if (offenders.length) {
  console.error("assert-bundle: `three` leaked into first-load chunks:");
  for (const o of offenders) console.error("  - " + o);
  process.exit(1);
}
console.log(`assert-bundle: OK — ${firstLoad.size} first-load chunks, no three.js`);
