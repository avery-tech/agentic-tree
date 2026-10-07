# Third-party notices — Agentic Tree by layerPx

This file lists the third-party components and assets that are actually included in the
distributed package of this repository, with the full text of each license as found on disk. It
supplements [NOTICE](NOTICE) and [LICENSE](LICENSE). The license of this repository (Apache-2.0)
covers only the code of the rights holder; it does not replace the licenses below. The use of the
product names and of the interface mark is described separately in [TRADEMARK.md](TRADEMARK.md),
which creates no obligation here and changes nothing in this file.

The inventory was established from the esbuild `metafile` of both production bundles
(`src/host/index.ts` → `lib/index.js` and `src/client.tsx` → `lib/client.js`) using the build
settings of [scripts/build.mjs](scripts/build.mjs). [scripts/check-notices.mjs](scripts/check-notices.mjs)
re-runs that comparison, for both the package set and the artifact each package lands in.

"Bundled" means the component's compiled code is inlined into one of the built artifacts and
therefore reaches the consumer inside the tarball. The two artifacts are not interchangeable:
a package can be reachable from one entry point only. "Peer" dependencies are supplied by the
consumer and are not redistributed here.

## Bundled components

<!-- bundled-packages: @reactflow/background=client @reactflow/controls=client @reactflow/core=client @reactflow/minimap=client @reactflow/node-resizer=client @reactflow/node-toolbar=client classcat=client d3-color=client d3-dispatch=client d3-drag=client d3-ease=client d3-interpolate=client d3-selection=client d3-timer=client d3-transition=client d3-zoom=client reactflow=client use-sync-external-store=client zod=host zustand=client -->

This marker records the exact packages resolved by the esbuild metafile of each bundle, with the
artifact each one lands in: `host` = `lib/index.js` (from `src/host/index.ts`), `client` =
`lib/client.js` (from `src/client.tsx`). `scripts/check-notices.mjs` compares both the package set
and this bundle attribution against a fresh build. Note that the bundles are not interchangeable:
`zod` is reached through `src/host/projection.ts` and appears only in the host bundle, while the
client bundle has no `zod` input at all.

| Component | Version | SPDX license | Bundled into | License text used |
|---|---|---|---|---|
| `reactflow` (React Flow) | 11.11.4 | MIT | `lib/client.js` | `node_modules/reactflow/LICENSE` |
| `@reactflow/core`, `@reactflow/background`, `@reactflow/controls`, `@reactflow/minimap`, `@reactflow/node-resizer`, `@reactflow/node-toolbar` | 11.11.4, 11.3.14, 11.2.14, 11.7.14, 2.2.14, 1.3.14 | MIT | `lib/client.js` | `node_modules/@reactflow/*/LICENSE` |
| `classcat` | 5.0.5 | MIT | `lib/client.js` | `node_modules/classcat/LICENSE.md` |
| `d3-color` | 3.1.0 | ISC | `lib/client.js` | `node_modules/d3-color/LICENSE` |
| `d3-dispatch` | 3.0.1 | ISC | `lib/client.js` | `node_modules/d3-dispatch/LICENSE` |
| `d3-drag` | 3.0.0 | ISC | `lib/client.js` | `node_modules/d3-drag/LICENSE` |
| `d3-ease` | 3.0.1 | BSD-3-Clause | `lib/client.js` | `node_modules/d3-ease/LICENSE` |
| `d3-interpolate` | 3.0.1 | ISC | `lib/client.js` | `node_modules/d3-interpolate/LICENSE` |
| `d3-selection` | 3.0.0 | ISC | `lib/client.js` | `node_modules/d3-selection/LICENSE` |
| `d3-timer` | 3.0.1 | ISC | `lib/client.js` | `node_modules/d3-timer/LICENSE` |
| `d3-transition` | 3.0.1 | ISC | `lib/client.js` | `node_modules/d3-transition/LICENSE` |
| `d3-zoom` | 3.0.0 | ISC | `lib/client.js` | `node_modules/d3-zoom/LICENSE` |
| `use-sync-external-store` | 1.7.0 | MIT | `lib/client.js` | `node_modules/use-sync-external-store/LICENSE` |
| `zod` | 4.1.12 | MIT | `lib/index.js` | `node_modules/zod/LICENSE` |
| `zustand` | 4.5.7 | MIT | `lib/client.js` | `node_modules/zustand/LICENSE` |
| Lucide `coins` icon (inlined SVG) | Lucide 0.576.0 distribution | ISC (portions Feather, MIT) | `lib/client.js` | Lucide distribution `LICENSE` |

## Full license texts

### React Flow (reactflow + @reactflow/*)

- Version: 11.11.4, 11.3.14, 11.2.14, 11.7.14, 2.2.14, 1.3.14
- SPDX identifier: MIT
- Bundled packages: `reactflow`, `@reactflow/core`, `@reactflow/background`, `@reactflow/controls`, `@reactflow/minimap`, `@reactflow/node-resizer`, `@reactflow/node-toolbar`
- Bundled into: `lib/client.js`
- License file used: `node_modules/reactflow/LICENSE`

```text
MIT License

Copyright (c) 2019-2023 webkid GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### classcat

- Version: 5.0.5
- SPDX identifier: MIT
- Bundled packages: `classcat`
- License file used: `node_modules/classcat/LICENSE.md`

```text
Copyright © Jorge Bucaran <<https://jorgebucaran.com>>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

### d3-color

- Version: 3.1.0
- SPDX identifier: ISC
- Bundled packages: `d3-color`
- License file used: `node_modules/d3-color/LICENSE`

```text
Copyright 2010-2022 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### d3-dispatch

- Version: 3.0.1
- SPDX identifier: ISC
- Bundled packages: `d3-dispatch`
- License file used: `node_modules/d3-dispatch/LICENSE`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### d3-drag

- Version: 3.0.0
- SPDX identifier: ISC
- Bundled packages: `d3-drag`
- License file used: `node_modules/d3-drag/LICENSE`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### d3-ease

- Version: 3.0.1
- SPDX identifier: BSD-3-Clause
- Bundled packages: `d3-ease`
- License file used: `node_modules/d3-ease/LICENSE`

```text
Copyright 2010-2021 Mike Bostock
Copyright 2001 Robert Penner
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### d3-interpolate

- Version: 3.0.1
- SPDX identifier: ISC
- Bundled packages: `d3-interpolate`
- License file used: `node_modules/d3-interpolate/LICENSE`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### d3-selection

- Version: 3.0.0
- SPDX identifier: ISC
- Bundled packages: `d3-selection`
- License file used: `node_modules/d3-selection/LICENSE`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### d3-timer

- Version: 3.0.1
- SPDX identifier: ISC
- Bundled packages: `d3-timer`
- License file used: `node_modules/d3-timer/LICENSE`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### d3-transition

- Version: 3.0.1
- SPDX identifier: ISC
- Bundled packages: `d3-transition`
- License file used: `node_modules/d3-transition/LICENSE`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### d3-zoom

- Version: 3.0.0
- SPDX identifier: ISC
- Bundled packages: `d3-zoom`
- License file used: `node_modules/d3-zoom/LICENSE`

```text
Copyright 2010-2021 Mike Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```

### use-sync-external-store

- Version: 1.7.0
- SPDX identifier: MIT
- Bundled packages: `use-sync-external-store`
- License file used: `node_modules/use-sync-external-store/LICENSE`

```text
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### zod

- Version: 4.1.12
- SPDX identifier: MIT
- Bundled packages: `zod`
- Bundled into: `lib/index.js` only. Three independent confirmations: 71 `zod` inputs in the host
  esbuild metafile and none in the client metafile; 1588 mentions of `zod` in the built `lib/index.js`
  and none in `lib/client.js`; and the only `zod` import in the source is `src/host/projection.ts`,
  which `src/client.tsx` does not reach.
- License file used: `node_modules/zod/LICENSE`

```text
MIT License

Copyright (c) 2025 Colin McDonnell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### zustand

- Version: 4.5.7
- SPDX identifier: MIT
- Bundled packages: `zustand`
- License file used: `node_modules/zustand/LICENSE`

```text
MIT License

Copyright (c) 2019 Paul Henschel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Lucide coins icon (inlined SVG)

- Asset: `coins`, inlined in `src/renderer/Coins.tsx` and compiled into `lib/client.js`
- Distribution: `lucide-icons-swift` 0.576.0, an official Lucide asset distribution
- SPDX identifier: ISC; portions of Lucide derive from Feather (MIT)
- License file used: `lucide-icons-swift/LICENSE` (outside this repository)

```text
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## Copyright lines for the bundled components

- React Flow (`reactflow`, `@reactflow/*`): `Copyright (c) 2019-2023 webkid GmbH`
- classcat: `Copyright © Jorge Bucaran <<https://jorgebucaran.com>>`
- d3-color: `Copyright 2010-2022 Mike Bostock`
- d3-dispatch, d3-drag, d3-interpolate, d3-selection, d3-timer, d3-transition, d3-zoom:
  `Copyright 2010-2021 Mike Bostock`
- d3-ease: `Copyright 2010-2021 Mike Bostock` and `Copyright 2001 Robert Penner`
- use-sync-external-store: `Copyright (c) Meta Platforms, Inc. and affiliates.`
- zod: `Copyright (c) 2025 Colin McDonnell`
- zustand: `Copyright (c) 2019 Paul Henschel`
- Lucide `coins` icon: `Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as
  part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.`

## Assets written by this repository

These files are part of the package and are listed so the inventory is complete. They are not
covered by the third-party license texts above.

| Asset | Origin | Rights status |
|---|---|---|
| Lucide `coins` icon, inlined in `src/renderer/Coins.tsx` | Lucide (ISC); the donor project inlined the identical Lucide geometry | Third-party license, text above |
| Sprout SVG in `src/renderer/Progress.tsx` | LayerPx design references (canvas capsule) — the rights holder's own material | Covered by [LICENSE](LICENSE) |
| layerPx layered mark in `src/renderer/Brand.tsx` | LayerPx landing/favicon geometry — the rights holder's own material, but it is also a brand mark | Apache-2.0 §6 grants no trademark rights; see "Trademark" |
| `locale/en.json` | Text written for this repository | Covered by [LICENSE](LICENSE) |
| Fonts and bitmap images other than the above | — | None are bundled; the UI uses system font stacks |

### Lucide `coins` icon — provenance evidence

The geometry in `src/renderer/Coins.tsx` matches the Lucide `coins` icon exactly:

- `circle cx="8" cy="8" r="6"`
- `path d="M18.09 10.37A6 6 0 1 1 10.34 18"`
- `path d="M7 6h1v4"`
- `path d="m16.71 13.88.7.71-2.82 2.82"`
- `viewBox="0 0 24 24"`, `stroke-width="2"`, round caps and joins

[PROVENANCE.md](PROVENANCE.md) records that the icon travelled here with the donor code. That
project's inlined-icon module states: "Lucide SVG icons inlined as React components. Source:
https://lucide.dev — ISC license." The geometry listed above matches the Lucide `coins` asset
exactly, and that match is what carries the attribution; an official Lucide distribution
(`lucide-icons-swift` 0.576.0) contains the `coins` asset, and the ISC text below is copied
verbatim from that distribution's `LICENSE`. No network access was used, and no Lucide package
is installed in this repository.

## Components that are not redistributed here

| Component | Why it is not in the package |
|---|---|
| `react`, `react-dom` | Declared `external` in the client build; supplied by the consumer's Harness runtime |
| `react/jsx-runtime`, `react-dom/client` | Same as above |
| `@deepseek-ai/dsh`, `@deepseek-ai/dsh-session-projection`, `@deepseek-ai/dsh-client-ui-conversation`, `@deepseek-ai/dsh-api-session-controller`, `@deepseek-ai/dsh-api-job-controller` | `peerDependencies` (all optional) of the consumer's Harness; no code is bundled |
| `esbuild`, `typescript`, `tsx`, `@types/node`, `@types/react`, `@types/react-dom` | Build-time and type-checking tools (`devDependencies`); no code is bundled |
| `tests/**`, `scripts/**` | Not listed in `files`; excluded from the tarball |

`reactflow/dist/style.css` is not a separate package: it is a stylesheet file of `reactflow`
11.11.4, covered by the React Flow MIT license and text above, and it is inlined into
`lib/client.js` as a string by the `text` loader.

## Trademark

Apache-2.0 section 6 does not grant permission to use trade names, trademarks, service marks or
product names, except as required for reasonable and customary use in describing the origin of
the work and reproducing the content of the NOTICE file. The names **layerPx** and
**Agentic Tree by layerPx**, and the layered mark in `src/renderer/Brand.tsx`, are therefore not
licensed by [LICENSE](LICENSE).

## Known gaps

Facts recorded here rather than resolved. Each one is a question for the rights holder, not an
assumption made by this repository.

1. **Trademark permission for the bundled layerPx mark.** The layered mark in
   `src/renderer/Brand.tsx` and the product name in the UI are the rights holder's own material,
   but they function as a brand. Distributing them to third parties under Apache-2.0 is a
   decision for the rights holder.
2. **License verification was offline.** Every text above was copied from a file present on disk.
   Lucide's text came from an official Lucide distribution, not from `lucide-react`, which is not
   installed in this repository.
