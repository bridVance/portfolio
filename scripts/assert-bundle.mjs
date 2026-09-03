import { readFileSync, existsSync } from "node:fs";

// Next 15.5.25 (webpack) emits the App Router first-load map here. Each value is
// the ordered list of chunks a route ships on first load, relative to `.next/`.
const manifestPath = ".next/app-build-manifest.json";
if (!existsSync(manifestPath)) {
  console.error("assert-bundle: run `next build` first");
  process.exit(1);
}

// three.js / R3F must never reach a first-load chunk (spec §4.3). A single
// case-sensitive alternation covering three marker families so the gate works on
// BOTH unminified (dev) and minified (production) client chunks — minification
// strips import *paths* but keeps class names and injected string literals:
//
//   (1) bare module-path strings   — survive only in dev / unminified output
//   (2) three.js identifiers       — renderer / scene-graph / camera ctor names
//                                    and the `THREE.` namespace; kept verbatim
//                                    by minifiers as they are property lookups
//   (3) @react-three/* runtime     — package paths, the `react-three-fiber`
//                                    rendererPackageName literal fiber passes to
//                                    react-reconciler, and the `R3F` tag the
//                                    fiber renderer stamps on its root container.
//                                    (`react-reconciler` alone is NOT a marker —
//                                    react-dom itself embeds that string.)
const THREE_MARKERS = new RegExp(
  [
    // (1) module paths
    "three/build/three",
    "@react-three/(?:fiber|drei)",
    // (2) three.js class / namespace identifiers
    "THREE\\.",
    "WebGLRenderer",
    "WebGLRenderTarget",
    "BufferGeometry",
    "PerspectiveCamera",
    "Object3D",
    // (3) react-three-fiber runtime markers
    "react-three-fiber",
    "\\bR3F\\b",
  ].join("|")
);

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
  const hit = readFileSync(path, "utf8").match(THREE_MARKERS);
  if (hit) offenders.push(`${chunk} (matched ${JSON.stringify(hit[0])})`);
}

if (offenders.length) {
  console.error("assert-bundle: three.js / R3F leaked into first-load chunks:");
  for (const o of offenders) console.error("  - " + o);
  process.exit(1);
}
console.log(`assert-bundle: OK — ${firstLoad.size} first-load chunks, no three.js`);
