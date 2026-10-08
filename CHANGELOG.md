# Changelog

Product versions are independent of the supported Harness version. All releases below target **DeepSeek Harness 0.2.0-rc.2**, with compatibility checks enabled.

## Unreleased

- Documentation only, after the 0.4.2 publication: README, `TRADEMARK.md` and this changelog were updated. No code change; `src/`, `tests/`, `locale/` and `cordis.patch.yml` are untouched.
- Add the prepared 0.4.2 media to the public README from `docs/media/0.4.2/`: the Team view as the main screenshot with the caption "See how HQ delegates work to Developer and Reviewer." and a link to the 26-second demo video, plus the Work and Agentic Guide views in the "Three views" section, every image with a descriptive alt text. The README states that these visuals show **sample (training) data** of the 0.4.2 components — not a real session — and that displaying them makes no model calls; the "Demo · Sample data" badge is visible in every frame. The media are documentation only and are **not part of the installation archive**: `files` in `package.json` stays explicit and unchanged without `docs/media`. No code change.

## 0.4.2 — 2026-10-07

### Release status

Published on **2026-10-07** as the **Public Preview** pre-release on GitHub Releases:
[v0.4.2 — Public Preview](https://github.com/avery-tech/agentic-tree/releases/tag/v0.4.2), tag `v0.4.2` at `1af3096`. Verified compatibility: **DeepSeek Harness 0.2.0-rc.2 only**; other Harness versions are not verified. The independent installation check of this release is still pending. The product page at https://layerpx.com/agentic-tree remains planned.

### Preparation record (written before publication)

Brand rules and release preparation. **No behaviour change**: `src/`, `tests/`, `locale/` and `cordis.patch.yml` are untouched, and this version has not been published. Its verification scope is the automated suite and the packaging checks below, on **DeepSeek Harness 0.2.0-rc.2** only; the real-work acceptance of the views remains pending and is not claimed here.

- Add `TRADEMARK.md`: the agreed rules for the product names **Agentic Tree** and **Agentic Tree by layerPx** and for the layered layerPx mark in the interface. It covers personal use and local changes, forks kept for study or a fix with a clear statement of origin, publicly distributed modified builds that carry their own name and logo while stating "Based on Agentic Tree by layerPx", unmodified official archives and mirrors, reviews and screenshots, and the technical identifiers kept for compatibility. It records that these rules cover names and the mark only, add no advertising requirement and do not limit the Apache-2.0 rights in the code; the notices to preserve are stated as the notices of the corresponding licenses (Apache-2.0 §4 and the third-party licenses). It claims no registered trademark and no exclusive right in any country, and it names no company.
- Add a short brand summary to the README with a link to `TRADEMARK.md` instead of restating the Apache-2.0 §6 position in several places, and point the remaining mark line at the new document.
- Product passport: the release lead and the person responsible for a release is **Vitaly Averyanov**; the Comito line states that Comito is a public AI character who tells the story of the development and the updates, with responsibility for a release resting with Vitaly Averyanov.
- State the prepared version as **0.4.2, not published**, and keep the planned addresses marked as planned.
- Ship `TRADEMARK.md` in the package archive through `files`, and require it in the archive check of `docs/RELEASING.md`.
- Move the version to `0.4.2` in `package.json` and in the two root version fields of `package-lock.json`. The package keeps `private: true`, the `Apache-2.0` license and every dependency unchanged; the version is not embedded in the bundles, so `lib/` stays byte-identical to the 0.4.1 build.
- Point the trademark note in `PROVENANCE.md` at the new document as well, so the brand position is
  stated once and the provenance record keeps only its licensing question.
- Add an archive path check to `docs/RELEASING.md`: the packaged `lib/*.js` may carry only path comments
  of the form `// node_modules/...` and `// src/...`. Building against a `node_modules` symlinked from a
  neighbouring directory made esbuild record the resolved neighbour path, so the bundle was rebuilt with
  a real `node_modules` in the repository root and the archive repackaged; the procedure now states it.
- The licensing and public-repository preparation below lands in this version rather than in an unreleased section.

### Licensing and public-repository preparation (included in 0.4.2)

No publication and no change to `src/`.

- License the rights holder's own code in this repository under Apache-2.0: add `LICENSE` (full Apache License 2.0 text), `NOTICE`, and set `license` to `Apache-2.0` with `author` `Vitaly Averyanov` in `package.json` and the root entry of `package-lock.json`. Keep `private: true` and the version unchanged.
- Add `THIRD_PARTY_NOTICES.md`: every third-party component actually bundled into `lib/index.js` / `lib/client.js` (established from the esbuild metafile) with version, SPDX identifier, copyright line, usage and full license text copied from the license file on disk; components that are not redistributed are listed separately with the reason. Bundled assets are inventoried, including the inlined Lucide `coins` icon.
- Add `scripts/check-notices.mjs`, a read-only check that rebuilds both bundles in memory and fails when the notice table no longer matches the bundled packages. It is intentionally not part of `npm run check`.
- Correct the provenance of the Coins icon: its geometry is the Lucide `coins` icon (ISC, portions Feather/MIT) copied through the Vibe Coding Box donor, not owner-authored artwork. Recorded in `PROVENANCE.md` and `THIRD_PARTY_NOTICES.md`.
- Add `LICENSE`, `NOTICE` and `THIRD_PARTY_NOTICES.md` to `files`, so the next `npm pack` carries them. Frozen builds v0.1.0–v0.4.1 keep their historical `UNLICENSED` metadata.
- Update the current sections of README and RELEASING for the licensing decision and the remaining publication questions.
- Technical-review round 1: correct the artifact attribution of `zod`. It is reached through `src/host/projection.ts` and is bundled into `lib/index.js` only — the client bundle has no `zod` input —; the notice file and the provenance record now say so.
- Extend `scripts/check-notices.mjs` to verify the package → artifact mapping as well as the package set, with the expected mapping recorded in the `bundled-packages` marker as `<package>=host|client`, and add a negative test proving a swapped attribution fails the check.
- Reword the provenance licensing section: the owner's permission covers his own transferred code, the Lucide `coins` icon is an explicit ISC exception, and the donor records are described as the known material rather than as an exhaustive audit.
- Prepare the public repository history: `files` becomes an explicit list (`lib`, `locale`, the patch file, the licence files, README, CHANGELOG, PROVENANCE and the two user documents) instead of the whole `docs` directory, so `docs/previews/` and every internal document stay out of the package; drop the `release:local` script, which packaged local release folders; replace the old release document with a rewritten `docs/RELEASING.md`; make the README a public version (no internal previews, no owner-profile installation notes, installation from a package archive or from source); strip internal paths and names from `PROVENANCE.md` and `THIRD_PARTY_NOTICES.md`; use neutral names in the role examples of `docs/VIEWER-ROLES.md` and `tests/viewerRole.test.ts` without changing what the parser tests check; and keep the technical identifiers, behaviour and test count unchanged.


## 0.4.1 — 2026-10-07

- Fade removed background-job cards and their ownership lines out together over two seconds, instead of unmounting immediately. Keep their position during departure; returning job IDs cancel the exit without duplicates.
- Departing cards are presentation only: they are excluded from active counts and Live focus, disabled for selection, and labeled No longer listed. Missing terminal state is not reported as successful completion. Owner/session removal clears them immediately.
- Add a regression test for expiry, return, ownership cleanup and focus exclusion.

## 0.4.0 — 2026-10-07

- Observe native background jobs owned by the current session tree through the rc.2 job controller. Work has separate job cards/counts, status, command, elapsed time and retained output/result details. Completed agents remain Completed while their commands run.
- Bound job observation to 64 owner sessions, 200 cards and 8 automatically observed output streams plus selection. Exclude unowned/global jobs; release subscriptions on unmount. No job controls or orchestration changes.
- Live prefers active agents, then active jobs, with a 3-second hold and a 2-second Soft glow. Initial output replay and clock ticks do not manufacture activity.
- Replace detached status underlines with a 5px fill clipped to rounded card corners.
- Add seven regression tests. Host compatibility stays exactly 0.2.0-rc.2.

## 0.3.2 — 2026-10-07

- Replace Latest with a latched Live camera button using the purple running glyph. Follow the freshest running card, falling back to the latest recorded activity when nothing is running.
- Center the whole target card at exactly 56%, including during smooth translation. Keep equal-timestamp targets stable, pause on disconnection, and resume on reconnect. Recenter when the canvas size changes.
- Manual pan, zoom or Fit view disables following. Live is local to the Work view and does not select agents, open details or issue commands.
- Add four regression tests for target selection, ties/unavailable observations, repeated executions and exact center/scale math.

## 0.3.1 — 2026-10-07

- Rename the conversation tab to Agentic Tree and standardize the product signature as Agentic Tree by layerPx in plugin metadata, the footer and current product documentation. Preserve the main layered logo and stable technical identifiers.

## 0.3.0 — 2026-10-07

- Replace the article-style Guide with one navigable example canvas: Simple Chat, Duo and Startup, arranged vertically with colored section labels and always-visible explanations.
- Reuse the Tree card surface, connection renderer, zoom controls and details panel. The initial camera frames Simple Chat and its explanation; section navigation moves the camera and Fit view frames all examples.
- Distinguish delegation from same-agent task sequence with solid purple and dashed grey arrows plus a legend. Clicking a card shows its role, example assignment and expected result.
- Label all examples explicitly and suppress live session counts/status banners in Guide. Demo cards have no status, timer, tokens or Harness identifiers. Article links appear only when a published article is configured.

## 0.2.10 — 2026-10-07

- Replace the Guide placeholder with three selectable examples: Build & Review, Parallel Tasks, and a simplified real-case example.
- Reuse graph card styling for interactive roles; each reveals its inputs, outputs and completion criteria. Explain result flow versus delegation and the limits of parallel work.
- Identify the real-case summary as simplified, retain owner acceptance and verification limits, and include future blog topics without invented links. No model calls or agent controls.

## 0.2.9 — 2026-10-07

- Explain HQ in Agentic Guide as “HQ (Main agent)”: receives the user's task, delegates work and brings results together. Keep the existing card name HQ.

## 0.2.8 — 2026-10-07

- Replace the alternate stair-step badge with the main LayerPx landing logo: three slanted grey/lime/ink layers, with no background tile. Reuse the landing favicon's exact layer geometry in the session tab and Agentic Guide.
- No navigation, graph, connection-style, orchestration or compatibility changes.

## 0.2.7 — 2026-10-07

- Brand the session tab as LayerPx Tree with the designer's compact stair-step mark (lime/white/grey bars on black). Retain the existing layerpx-tree slot id and session selection behavior.
- Rename internal navigation to Team (hierarchy) and Work (execution timeline); Work remains the default. Add Agentic Guide with a Coming soon page for future team patterns, role templates and blog articles. No placeholder links or external requests.
- Add wrapping navigation for narrower panels. Preserve the approved v0.2.6 connection settings and all observer/orchestration boundaries.

## 0.2.6 — 2026-10-07

- Apply the approved connection selection: Completed #aab4ac / .8px / .5 opacity, solid, with constant screen-space thickness. Running #7854ec / 3.5px / .85; other states #738079 / 1.6px / .65.
- Match the approved selection emphasis exactly: +.4px width and +.25 opacity capped at 1. Use explicit connection colors so the Harness theme does not alter the chosen palette. Update the legend.
- Preserve the approved style settings in the renderer's connection palette. Presentation only; no orchestration, projection or compatibility changes.

## 0.2.5 — 2026-10-07

- Replace completed green dots with subtle solid grey hairlines: .8px screen-space stroke, .5 opacity. This removes dotted visual noise while preserving visible connections at reduced zoom.
- Selected completed links remain thin (1.2px) with higher contrast. Active purple and neutral styles are unchanged; update the legend.
- Presentation-only change; exact rc.2 compatibility and observer behavior unchanged.

## 0.2.4 — 2026-10-07

- Make completed connections readable at normal viewing zoom: muted green #62957e, 1.8px, .8 opacity, rounded 2/5 dashes, with a matching legend.
- Cancelled connections remain neutral grey; green indicates successful completion only. Running remains purple.
- Presentation-only adjustment; no event/projection, layout or orchestration changes.

## 0.2.3 — 2026-10-07

- Restore all available delegation connections in Timeline, matching Tree visibility.
- Apply target-status styling using LayerPx line weights: Running purple 3.5px; Completed/Cancelled faint grey 1.3px round 1/5 dashes; other statuses regular grey 1.6px.
- Highlight the selected connection without changing its status style. Keep cards above all edge layers, and active/selected edges above faint ones.
- Update edges on status changes independently of layout. Disconnected Running connections become neutral. Add an English connection legend.
- Validation: 29 tests, typecheck/build; browser fixture verified three styles, live completion, disconnect/reconnect and selected finished edges in Tree/Timeline. No protocol, compatibility or orchestration changes.

## 0.2.2 — 2026-10-07

- Remove the old 15% Fit view floor: long real-session timelines now fit the entire sequence in the overview. Initial reading zoom and Latest remain 80%.
- Includes v0.2.0 timeline/token/role features and v0.2.1 selected-only timeline links. No data or orchestration changes.

## 0.2.1 — 2026-10-07

- Real-session visual check of v0.2.0 revealed excessive crossing HQ lines on long timelines. Show only the selected direct-child execution's HQ link in Timeline; keep all hierarchy branches in Tree.
- Include run number in execution-card accessibility labels.
- Supersedes the initial v0.2.0 preview; no projection or orchestration changes.

## 0.2.0 — 2026-10-07

- Add a Timeline layout beside Tree, selected initially: one card per native child execution, ordered by start time in compressed minute groups; repeated executions keep their session identity and lane. HQ remains a session anchor.
- Keep direct HQ delegation lines; nested parent identities remain in Details and the complete parent/child structure in Tree. Timeline never invents links between executions or cross-agent handoffs.
- Show the latest 24 retained executions per agent and disclose that bound; unknown start times appear last. Start at a readable zoom; Latest jumps to the far-right group and Fit view shows an overview.
- Reuse the gold coin SVG from Vibe Coding Box. Show the native session token total, explicitly labelled session on execution cards, not per-run cost. Unknown usage stays unknown.
- Recognize opening `Роль:` / `Role:` assignments. Preserve request model per execution. Advance native projection stateVersion to 4 for replay; retain strict JSON omission for absent role.
- Count HQ consistently in the running/total toolbar. No changes to orchestration or exact rc.2 compatibility.
- Validation: 29 tests, typecheck/build and browser fixture checks; UI verification recorded separately.

## 0.1.5 — 2026-10-07

- Correct the role-free observer view to omit an absent viewerRole property, preserving the native strict-JSON transport contract during session activation.
- Add a regression test covering JSON-valid wire views with and without roles.
- Supersedes withdrawn v0.1.4. 24 tests, typecheck/build; UI verification recorded separately.

## 0.1.4 — 2026-10-07

**Withdrawn after UI verification:** an explicitly undefined viewerRole field on role-free assignments could break native session activation. Rolled back to v0.1.3 while preparing v0.1.5. Do not install v0.1.4.

- Read an optional Viewer role header from the initial own assignment; conservatively recognize existing opening introductions.
- Display a recognized role while keeping Agent N as a separate stable identity. Unknown roles remain Agent N; root remains HQ.
- Preserve the role independently of bounded execution history and report its source event in Details. Later steering cannot rename an agent.
- Advance observer stateVersion to 3 for native history replay; no orchestration changes.
- Document the role convention and limits in docs/VIEWER-ROLES.md.
- Validation: 23 tests, typecheck/build; UI acceptance tracked separately.

## 0.1.3 — 2026-10-07

- Separate agent identity from assignment titles: root `HQ`, descendants `Agent N`, with stable viewer-local per-chat numbering.
- Persist number-to-session mappings locally; late arrivals, catalog reordering and temporarily absent descendants do not rename existing agents.
- Show native assignment/chat titles on cards instead of raw prompt or internal notification previews. Preserve latest execution details in the side panel.
- Label detail fields Display name, Assignment title and Preset; no orchestration or role inference changes.
- Validation: 18 automated tests, typecheck and build; UI verification recorded separately.

## Release management

- Add release tooling, source/history backups and the acceptance checklist.
- Install the frozen v0.1.2 build in a Harness profile and record the initial real-session inspection and presentation findings; full acceptance remains pending. Promotion and publication are a separate later decision.

## 0.1.2 — 2026-10-07

- Add the LayerPx sprout capsule at bottom-left, reading the selected session's native `todos` projection.
- Show segmented completed/active/pending steps and an expandable checklist.
- Support live plan replacement, parallel active steps, missing plans and large grouped plans.
- Move zoom and Fit view to bottom-right.
- Validation: 15 automated tests, typecheck/build, real rc.2 Web UI with synthetic native sessions; live count update and plan reset exercised.

## 0.1.1 — 2026-10-07

- Remove duplicate execution-status text from finished cards.
- Reduce compact card height from 184 to 162 pixels; keep meaningful activity for running agents.
- Update layout and connection positioning for card heights.
- Validation: typecheck/build and live UI inspection.

## 0.1.0 — 2026-10-07

- Introduce a session-scoped Tree tab alongside Chat and Trajectory.
- Reuse LayerPx tree layout, connection curves and camera geometry.
- Add read-only native session projections, parent-child discovery, cards, timing, history Details, pan/zoom and branch collapse.
- Separate renderer, portable data model, Harness adapter and plugin registration.
- Validation: 11 automated tests and isolated rc.2 Web UI with synthetic native session events.

No release above has been published. The version notes describe the builds and the verification
performed for each one; where a check was recorded separately, the entry says so.
