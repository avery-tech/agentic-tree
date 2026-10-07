# Provenance — Agentic Tree by layerPx

This file records where the material in this repository came from and what the rights position is. It
is a record, not an exhaustive audit: it lists the material the author knows about.

## The rights holder's own transferred code

Part of this repository's code is the rights holder's own work, **Vitaly Averyanov**, moved here from
his closed layerPx planner and from the Vibe Coding Box project. His permission of 2026-10-07 covers
that transferred code, and it is distributed under the **Apache License 2.0** ([LICENSE](LICENSE)).

The transferred material, named by the file it lives in here:

- `src/donor/treeLayout.ts` — the planner's tree layout engine, ported unchanged apart from its leading
  comment.
- `src/donor/contextCamera.ts` — the planner's context camera, copied unchanged.
- `src/donor/elbowPath.ts` — the connection curve, extracted unchanged; the donor's editing and
  fold-animation imports were left behind.
- `src/renderer/Tree.tsx`, `src/renderer/CardSurface.tsx` and the surrounding renderer assembly — the
  React Flow provider, fixed node types, layout-to-node mapping, parent edges, one-time fit and
  read-only navigation were adapted from the planner's board tree. The card markup here is a reduced
  presentation for observer data.
- Connection styling — the planner's line weights and rounded resource dashes. In this observer the
  target status replaces the donor depth/resource classification; the elbow geometry is unchanged.
- `src/renderer/Progress.tsx` (the sprout path) and `src/renderer/Brand.tsx` (the layered mark) — the
  rights holder's own design material, reused from his planner's design references.
- `src/renderer/Brand.tsx` — since v0.2.8 the three rects and their transforms follow the planner's
  landing favicon geometry; the favicon's background rectangle is intentionally omitted.

No planner storage, network, authentication, synchronization or editor actions were imported: no
database, login, server, editor commands or project configuration.

Hashes of the copies, so that "unchanged" can be checked:

| File | SHA-256 |
|---|---|
| `src/donor/treeLayout.ts` | `18d26606b1d1aa5b4d6786d33821bf760bd449f8c9bef107fe381a8ea062c577` |
| `src/donor/contextCamera.ts` | `6bc5b0f93e5a4ef34d6900bce254bd99027555e1ad7e92b552e60346ab20dab1` |
| `src/donor/elbowPath.ts` | `3958197854809d8db7defae1a1c7692116e5713b97a409302f80dd866db6c35d` |

`treeLayout.ts` differs from its donor copy only in that leading comment, which was rewritten for this
public repository; `contextCamera.ts` matches its donor copy byte for byte.

## Third-party material

### Lucide `coins` icon — ISC (portions Feather, MIT)

The token icon in `src/renderer/Coins.tsx` is **not** the rights holder's artwork. It travelled here
with the donor code, and its geometry is the Lucide `coins` icon exactly:

- `circle cx="8" cy="8" r="6"`
- `path d="M18.09 10.37A6 6 0 1 1 10.34 18"`
- `path d="M7 6h1v4"`
- `path d="m16.71 13.88.7.71-2.82 2.82"`
- `viewBox="0 0 24 24"`, `stroke-width="2"`, round caps and joins

The donor project's inlined-icon module states that its icons are taken from `https://lucide.dev`
under the ISC license. The icon is therefore third-party material under the Lucide ISC license, not
owner-authored code, and the rights holder's permission does not cover it. The license text, the
verbatim donor statement, the geometry comparison and the attribution to a specific Lucide
distribution are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

### Bundled npm packages

Every third-party package actually inlined into the built artifacts (`lib/index.js`, `lib/client.js`)
is listed with its version, SPDX identifier, the artifact it lands in and its full license text in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). That list is established from the esbuild metafile
and is re-checked by `scripts/check-notices.mjs`.

## Rights position

- Rights holder of the code of this repository: **Vitaly Averyanov**.
- His permission of 2026-10-07 covers his own code moved into this plugin from the layerPx planner
  and the Vibe Coding Box project. It does **not** cover third-party assets that travelled with that
  code; the one found by the licensing review is the Lucide `coins` icon described above.
- The main layerPx product remains closed and is not covered by this license.
- Trademarks and brand marks are not licensed: Apache-2.0 §6 grants no rights in the names `layerPx`
  or `Agentic Tree by layerPx`, or in the layered mark in `src/renderer/Brand.tsx`, beyond customary
  reference to the origin of the work. [TRADEMARK.md](TRADEMARK.md) states which uses of those names
  and of the mark are permitted and which build is the official one; it is a policy statement, not a
  registration and not legal advice, and it limits nothing in the license.
- Still open, and recorded as questions rather than settled here: the trademark and branding status
  of the layerPx name and the layered mark. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md),
  "Trademark" and "Known gaps".

## Audit status

The records above list the known donor material for this repository, and the licensing review found
one third-party asset among it. They are **not** a claim that the donor material has been
exhaustively audited: the review covered the files of `src/` and `locale/` for inline SVG, images,
fonts and `url(...)` references, and it relied on the license files present on disk rather than on
network lookups.
