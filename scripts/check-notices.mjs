// Verifies that THIRD_PARTY_NOTICES.md still matches what is actually bundled into lib/*.js.
//
// Read-only: it runs the esbuild builds of src/host/index.ts and src/client.tsx in memory
// (write: false) with the same settings as ./build.mjs, collects every input under
// node_modules/**, and compares the result with the machine-readable marker in
// THIRD_PARTY_NOTICES.md.
//
// Two things are compared, not one:
//   1. the set of bundled packages, and
//   2. which artifact each package lands in: `host` = lib/index.js (from src/host/index.ts),
//      `client` = lib/client.js (from src/client.tsx).
// The second comparison exists because a package can be reachable from only one entry point:
// `zod` comes in through src/host/projection.ts and is absent from the client bundle, while every
// React Flow / d3 package is absent from the host bundle. Attributing one of them to the wrong
// artifact is a real licensing statement error, so it must fail this check.
//
// It is intentionally NOT part of `npm run check`. `npm run check` proves that the code typechecks,
// tests and builds; this script adds a second, in-memory pair of esbuild builds purely to compare
// their input graph against THIRD_PARTY_NOTICES.md. That is a documentation-consistency check run by
// hand on a license change, not part of the code pipeline: folding it in would rebuild both bundles
// a second time on every run and make the check command fail for reasons unrelated to code health.
// Run it manually after changing a bundled dependency, a build setting, or the notice file:
//
//   node scripts/check-notices.mjs
//
// The notices file can be overridden for testing without touching the repository copy:
//
//   node scripts/check-notices.mjs path/to/temporary-copy.md
//
// Exit code 0 = the marker matches the bundled packages and their artifacts. Exit code 1 = drift.

import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

const NOTICES = process.argv[2] ?? 'THIRD_PARTY_NOTICES.md';
const ARTIFACTS = { host: 'lib/index.js', client: 'lib/client.js' };

function packageOf(inputPath) {
  const marker = 'node_modules/';
  const at = inputPath.lastIndexOf(marker);
  if (at < 0) return null;
  const rest = inputPath.slice(at + marker.length).split('/');
  return rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0];
}

async function buildBoth() {
  const host = await build({
    entryPoints: ['src/host/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    write: false,
    metafile: true,
  });
  const client = await build({
    entryPoints: ['src/client.tsx'],
    bundle: true,
    platform: 'browser',
    format: 'cjs',
    target: 'chrome120',
    write: false,
    metafile: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
    loader: { '.css': 'text' },
    minify: true,
  });
  return { host, client };
}

// artifact -> Set(package)
function bundledByArtifact(results) {
  const byArtifact = new Map();
  for (const [artifact, result] of Object.entries(results)) {
    const found = new Set();
    for (const input of Object.keys(result.metafile.inputs)) {
      const name = packageOf(input);
      if (name) found.add(name);
    }
    byArtifact.set(artifact, found);
  }
  return byArtifact;
}

// The marker under the "Bundled components" table records "<package>=<artifact>" entries, for
// example `zod=host` and `reactflow=client`.
function listedAttribution(markdown) {
  const match = markdown.match(/<!-- bundled-packages: ([^>]*?) -->/);
  if (!match) {
    console.log(`FAIL: no "bundled-packages" marker found in ${NOTICES}`);
    process.exit(1);
  }
  const listed = new Map();
  for (const entry of match[1].split(/\s+/).filter(Boolean)) {
    const [name, artifact] = entry.split('=');
    if (!name || !artifact) {
      console.log(`FAIL: marker entry "${entry}" is not in <package>=<artifact> form`);
      process.exit(1);
    }
    if (!(artifact in ARTIFACTS)) {
      console.log(`FAIL: marker entry "${entry}" names an unknown artifact "${artifact}"`);
      process.exit(1);
    }
    listed.set(name, artifact);
  }
  return listed;
}

const bundled = bundledByArtifact(await buildBoth());
const listed = listedAttribution(await readFile(NOTICES, 'utf8'));

const bundledUnion = new Set([...bundled.values()].flatMap((s) => [...s]));

const missing = [...bundledUnion].filter((p) => !listed.has(p)).sort();
const extra = [...listed.keys()].filter((p) => !bundledUnion.has(p)).sort();
const mismatched = [];
for (const [name, artifact] of listed) {
  const actual = [...bundled.entries()].filter(([, set]) => set.has(name)).map(([a]) => a).sort();
  if (actual.length && (actual.length !== 1 || actual[0] !== artifact)) {
    mismatched.push(`${name}: notices say ${ARTIFACTS[artifact]} (${artifact}), build says ${actual.map((a) => ARTIFACTS[a]).join(' + ')}`);
  }
}

console.log(`${NOTICES}: ${listed.size} packages listed in the marker`);
for (const [artifact, set] of bundled) {
  console.log(`esbuild metafile (${artifact} -> ${ARTIFACTS[artifact]}): ${set.size} packages`);
  console.log(`  ${[...set].sort().join(', ')}`);
}

let failed = false;
if (missing.length) {
  console.log(`FAIL: MISSING from ${NOTICES}: ${missing.join(', ')}`);
  failed = true;
} else {
  console.log('ok: every bundled package appears in the marker');
}
if (extra.length) {
  console.log(`FAIL: listed in ${NOTICES} but not bundled anywhere: ${extra.join(', ')}`);
  failed = true;
} else {
  console.log('ok: the marker lists no package that is not bundled');
}
if (mismatched.length) {
  console.log('FAIL: wrong artifact attribution:');
  for (const line of mismatched) console.log(`  ${line}`);
  failed = true;
} else {
  console.log('ok: every package is attributed to the artifact that actually contains it');
}

if (failed) process.exit(1);
console.log('OK: notice marker matches the bundled packages and their artifacts');
