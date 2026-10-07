# Release procedure — Agentic Tree by layerPx

Public name: **Agentic Tree by layerPx**; UI name: **Agentic Tree**. This document describes how a
release of the plugin is prepared and published as a package archive. It contains no local paths and
no personal settings; `<version>` below stands for the release version, for example `0.4.2`.

A release consists of: an annotated Git tag, a source snapshot of that tag, the package archive built
from it, a checksum file, and a GitHub Release that carries those files. The package keeps
`private: true` and is **not** published to the npm registry.

## 1. Before the release

```sh
npm ci --ignore-scripts
npm run check              # typecheck + automated tests + build of lib/
node scripts/check-notices.mjs
```

- `npm run check` must pass: the TypeScript check, the whole test suite and the build of `lib/`.
- `node scripts/check-notices.mjs` must pass as well. It is a licence-consistency check, deliberately
  separate from `npm run check`: it rebuilds both bundles in memory and fails when the set of bundled
  packages, or the artifact each package lands in, no longer matches the `bundled-packages` marker in
  [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). Run it whenever a bundled dependency changes —
  a version bump, a new import in `src/`, or a build-setting change — and update that file first if it
  fails.
- Check the release against **DeepSeek Harness 0.2.0-rc.2** in the profile that owns the session, with
  compatibility checks enabled and no version exemptions. The exact peer ranges in `package.json`
  describe what was verified; do not widen them without verifying the host version. Other Harness
  versions are unverified.
- Open the plugin in the real interface and confirm the views still behave: Team, Work, the Live
  camera, background jobs, Details and the Agentic Guide.
- Check that the licence files are in place: [LICENSE](../LICENSE), [NOTICE](../NOTICE) and
  [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). They must stay in `files`.
- Check that the brand rules ship with the release:
  [TRADEMARK.md](../TRADEMARK.md) must be current and must stay in `files`, and the brand summary in
  the README must still point at it.

## 2. Version and changelog

1. Update the version in `package.json` and in the root entry of `package-lock.json`:

   ```sh
   npm version patch --no-git-tag-version    # or minor / major, chosen deliberately
   ```

2. Move the finished entries of `Unreleased` in [CHANGELOG.md](../CHANGELOG.md) into a new dated
   section `## <version> — YYYY-MM-DD`, and leave `Unreleased` for the next work. Record the version's
   verification scope there, not just the changes.
3. Use patch versions for fixes and polish, minor versions for new capabilities. While the version is
   below 1.0, breaking changes belong in a minor release and must be stated in the changelog.
4. Commit the source and the metadata together. A saved build is not by itself an accepted release.

## 3. Build and package

```sh
npm ci --ignore-scripts
npm run check
npm pack --pack-destination <output-directory>
```

`npm pack` writes `layerpx-harness-agent-viewer-<version>.tgz` and prints every file it contains.
Check the contents before the archive leaves the machine:

```sh
npm pack --dry-run                                  # the list npm would put into the archive
tar -tzf layerpx-harness-agent-viewer-<version>.tgz # the list actually in the archive
```

The archive must contain `lib/`, `locale/`, `cordis.patch.yml`, `README.md`, `CHANGELOG.md`,
`PROVENANCE.md`, `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md`, `TRADEMARK.md`, `docs/RELEASING.md`
and `docs/VIEWER-ROLES.md`. It must **not** contain `src/`, `tests/`, `scripts/`, `docs/previews/`, or
any internal working document: the `files` list in `package.json` is what keeps them out, so extend it
explicitly if a new public document should ship.

The build must run against a `node_modules` inside the repository root — a real directory, produced by
`npm ci`. A symlink to a copy in a neighbouring directory makes esbuild record the path it resolved, and
that path ends up in the comment esbuild writes before each bundled module. Check the bundled files
inside the archive before it leaves the machine:

```sh
tar -xzf layerpx-harness-agent-viewer-<version>.tgz package/lib
grep -o '^// [^ ]*' package/lib/index.js | sort -u        # only node_modules/... and src/... belong here
grep -nE '\.\./|/Users/|/var/folders|/private/' package/lib/*.js   # must print nothing
```

Path comments such as `// node_modules/zod/...` or `// src/host/...` are expected. Anything else — a
`../` step, an absolute path, a temporary directory, or the name of a neighbouring project directory —
is a packaging defect: rebuild with a local `node_modules` and package again.

## 4. Checksums and source snapshot

```sh
shasum -a 256 layerpx-harness-agent-viewer-<version>.tgz > SHA256SUMS
git archive --format=tar.gz --prefix=agentic-tree-<version>/ \
  -o agentic-tree-<version>-source.tar.gz v<version>
shasum -a 256 agentic-tree-<version>-source.tar.gz >> SHA256SUMS
shasum -a 256 -c SHA256SUMS     # verify the manifest from the folder that holds the files
```

The source snapshot keeps the release reproducible even if the repository moves. Do not edit a
published archive or its checksum file; a correction gets a new version.

## 5. Tag

```sh
git tag -a v<version> -m "Agentic Tree by layerPx v<version>"
git show v<version>            # confirm the annotated tag points at the release commit
git push origin v<version>
```

Nothing in this repository creates tags automatically. A published tag is never moved, deleted and
re-created, or reused for different content.

## 6. GitHub Release

1. Create a release for the tag `v<version>`.
2. Write the notes from the `<version>` section of `CHANGELOG.md`, including the verified Harness
   version and what was not verified.
3. Attach:
   - `layerpx-harness-agent-viewer-<version>.tgz`;
   - `agentic-tree-<version>-source.tar.gz`;
   - `SHA256SUMS`.
4. State in the notes that the package is installed from the attached archive and that it is not
   distributed through the npm registry.
5. Publish the release. Nothing else is published: no npm package, no other registry, no copy of the
   archive in the repository.

## 7. Installation and rollback

Install a downloaded archive through **Plugins → Add plugin**, or with the Harness-managed CLI:

```sh
dsh plugin --profile <profile> add /path/to/layerpx-harness-agent-viewer-<version>.tgz
```

Use the profile that owns the session, and wait until its work is idle before restarting Harness. To
roll back, remove the plugin through the same manager and add the previous archive:

```sh
dsh plugin --profile <profile> remove @layerpx/harness-agent-viewer
```

Never bypass compatibility checks or alter orchestration to make a build load. Report a defect against
the released version instead of patching the archive in place: see [README](../README.md) for what the
plugin observes and what it deliberately does not do.
