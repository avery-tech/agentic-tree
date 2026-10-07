/**
 * Раскладка дерева — перенос движка раскладки планировщика layerPx
 * **без изменений**: алгоритм берём как есть, ширину по заголовку не вводим.
 *
 * Чистая функция: ни сети, ни React, ни DOM. Правки в этом файле — это правки
 * в доноре, а буквальность переноса и есть его ценность: перенос не
 * оптимизируем, иначе потом неясно, что именно измеряем.
 *
 * Ниже — оригинальный комментарий донора; «Box» в нём — прежнее рабочее
 * название проекта-донора.
 *
 * Tree layout — TS port of the layerPx planner's TreeLayoutEngine.
 *
 * Reingold-Tilford with contour merging and deferred-mod shifts. Produces
 * left-to-right hierarchical positions where:
 *
 *  - parents sit at column N, children at column N+1 spaced horizontally
 *    by `connectionGap`;
 *  - sibling subtrees are vertically stacked by comparing per-depth
 *    contours so larger subtrees push their neighbours minimally;
 *  - per-parent `siblingGap` shrinks as fan-out grows (3 children
 *    breathe; 8+ children tighten), giving the tree an "organic" feel
 *    that uniform-gap layouts (e.g. Dagre `nodesep`) cannot.
 *
 * Algorithm overview:
 *
 *  1. `layoutSubtree(id, depth)` recurses children first, gets each
 *     child's contour, merges them via `mergeContours`. The merge shift
 *     is recorded as a deferred `mod` on the affected child plus its
 *     `prelimY` — descendants are NOT touched in this pass.
 *  2. Parent is centered between its first and last child's centers.
 *  3. `applyMods(id, accumulatedShift)` is a single O(n) top-down pass
 *     that resolves `prelimY + sum(ancestor mods)` to final positions.
 *
 * Deviations from the Swift original (documented for future maintainers):
 *
 *  - **Pixel-native**: Swift used row-units (`yStartUnits`); the
 *    consumer multiplied by a row pixel height. Box has mixed node
 *    heights (cards 120, bullets 36), so we work in pixels throughout
 *    and use `node.height` for leaf contour ranges directly.
 *  - **No `extraDepthSpan`**: Swift simulated wide cards spanning
 *    multiple columns when card widths varied >2× from the median.
 *    Box's tier widths (300 / 250) are close enough that the extra
 *    span is always 0 — the logic was dropped.
 *  - **Parent centering**: Swift centered on `min/max prelimY` (top of
 *    extreme children). With mixed heights we center on each child's
 *    vertical center, then offset parent's prelim by `-height/2` so the
 *    visual midline is consistent.
 *  - **`unit`**: Swift used 60-80px depending on theme; Box defaults to
 *    60. `siblingGap` returns `<fraction> * unit` pixels.
 *
 * Constants (Layer Px equivalents):
 *  - `connectionGap`: 60 — column horizontal spacing.
 *  - `unit`: 60 — vertical gap base. `siblingGap * unit` = px.
 *  - `siblingGap(n)`: 0.65 (n≤3) → 0.30 (n=7) → 0.23 (n≥8+, floor).
 */

export interface TreeLayoutNode {
  id: string;
  parentId: string | null;
  width: number;
  height: number;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface LayoutOptions {
  /** Horizontal spacing between parent's right edge and child's left edge. */
  connectionGap?: number;
  /** Base unit multiplied by `siblingGap` fraction to yield vertical gaps. */
  unit?: number;
  /** Outer padding on the left of the canvas. */
  paddingX?: number;
  /** Outer padding on the top of the canvas. */
  paddingY?: number;
}

const DEFAULTS = {
  connectionGap: 60,
  unit: 60,
  paddingX: 32,
  paddingY: 32,
};

/**
 * Layer Px `siblingGap` heuristic — preserved verbatim.
 * 3 or fewer kids breathe; 4-7 interpolate; 8+ floor at 0.23.
 */
function siblingGap(childCount: number, unit: number): number {
  if (childCount <= 3) return 0.65 * unit;
  if (childCount <= 7) {
    const t = (childCount - 3) / 4;
    return (0.65 - t * 0.35) * unit;
  }
  const t = (childCount - 7) / 3;
  return Math.max(0.23, 0.3 - t * 0.07) * unit;
}

type Contour = Map<number, [number, number]>;

function shiftContour(contour: Contour, delta: number): Contour {
  const result: Contour = new Map();
  for (const [d, [min, max]] of contour) {
    result.set(d, [min + delta, max + delta]);
  }
  return result;
}

function mergeContours(left: Contour, right: Contour, gap: number): number {
  let shift = 0;
  for (const [d, leftRange] of left) {
    const rightRange = right.get(d);
    if (!rightRange) continue;
    const needed = leftRange[1] + gap - rightRange[0];
    if (needed > shift) shift = needed;
  }
  return shift;
}

function absorbContour(into: Contour, from: Contour) {
  for (const [d, range] of from) {
    const ex = into.get(d);
    if (ex) {
      into.set(d, [Math.min(ex[0], range[0]), Math.max(ex[1], range[1])]);
    } else {
      into.set(d, [range[0], range[1]]);
    }
  }
}

export function layoutTree(
  nodes: TreeLayoutNode[],
  options: LayoutOptions = {},
): NodePosition[] {
  if (nodes.length === 0) return [];

  const connectionGap = options.connectionGap ?? DEFAULTS.connectionGap;
  const unit = options.unit ?? DEFAULTS.unit;
  const paddingX = options.paddingX ?? DEFAULTS.paddingX;
  const paddingY = options.paddingY ?? DEFAULTS.paddingY;

  const byId = new Map<string, TreeLayoutNode>();
  for (const n of nodes) byId.set(n.id, n);

  // Build children adjacency, preserving input order. A node whose
  // `parentId` doesn't resolve in `byId` is treated as a root — keeps
  // the layout robust against transient watcher state where the parent
  // might briefly be missing.
  const childrenById = new Map<string, string[]>();
  const roots: string[] = [];
  for (const n of nodes) {
    // A node is a root if it has no parent, an unresolved parent, or names
    // itself as parent (a malformed self-loop — surface it at top level rather
    // than dropping it). Multi-node cycles are broken by the `visited` guards
    // in layoutSubtree / applyMods below.
    if (n.parentId === null || n.parentId === n.id || !byId.has(n.parentId)) {
      roots.push(n.id);
    } else {
      const arr = childrenById.get(n.parentId);
      if (arr) {
        arr.push(n.id);
      } else {
        childrenById.set(n.parentId, [n.id]);
      }
    }
  }

  const prelimY = new Map<string, number>();
  const modY = new Map<string, number>();

  const laidOut = new Set<string>();
  function layoutSubtree(id: string, depth: number): Contour {
    void depth;
    // Cycle guard: re-entering a node already being laid out means a parentId
    // cycle — treat it as a leaf so the recursion can't overflow the stack.
    if (laidOut.has(id)) {
      prelimY.set(id, 0);
      const seenNode = byId.get(id);
      return new Map([[0, [0, seenNode ? seenNode.height : 1]]]);
    }
    laidOut.add(id);
    modY.set(id, 0);

    const childIds = childrenById.get(id) ?? [];
    const node = byId.get(id);
    if (!node) {
      prelimY.set(id, 0);
      return new Map([[0, [0, 1]]]);
    }
    if (childIds.length === 0) {
      prelimY.set(id, 0);
      return new Map([[0, [0, node.height]]]);
    }

    const gap = siblingGap(childIds.length, unit);
    let merged: Contour = new Map();

    // `!` здесь и ниже — единственная правка донора при переносе: у нас
    // включён `noUncheckedIndexedAccess`, а обращения идут по индексам внутри
    // собственной длины. Алгоритм не тронут.
    for (let idx = 0; idx < childIds.length; idx++) {
      const childId = childIds[idx]!;
      const childContour = layoutSubtree(childId, depth + 1);

      if (idx === 0) {
        merged = new Map(childContour);
      } else {
        const shift = mergeContours(merged, childContour, gap);
        if (shift !== 0) {
          prelimY.set(childId, (prelimY.get(childId) ?? 0) + shift);
          modY.set(childId, (modY.get(childId) ?? 0) + shift);
          absorbContour(merged, shiftContour(childContour, shift));
        } else {
          absorbContour(merged, childContour);
        }
      }
    }

    // Parent center = midpoint of (first child center, last child
    // center). Using centers (instead of tops) keeps the parent
    // visually balanced when children have mixed heights.
    const firstId = childIds[0]!;
    const lastId = childIds[childIds.length - 1]!;
    const firstChild = byId.get(firstId);
    const lastChild = byId.get(lastId);
    const firstCenter =
      (prelimY.get(firstId) ?? 0) + (firstChild ? firstChild.height / 2 : 0);
    const lastCenter =
      (prelimY.get(lastId) ?? 0) + (lastChild ? lastChild.height / 2 : 0);
    const parentCenter = (firstCenter + lastCenter) / 2;
    const parentY = parentCenter - node.height / 2;
    prelimY.set(id, parentY);

    const finalContour: Contour = new Map();
    finalContour.set(0, [parentY, parentY + node.height]);
    for (const [d, range] of merged) {
      const newD = d + 1;
      const ex = finalContour.get(newD);
      if (ex) {
        finalContour.set(newD, [
          Math.min(ex[0], range[0]),
          Math.max(ex[1], range[1]),
        ]);
      } else {
        finalContour.set(newD, [range[0], range[1]]);
      }
    }
    return finalContour;
  }

  const yStartById = new Map<string, number>();
  const moddedIds = new Set<string>();
  function applyMods(id: string, accumulated: number) {
    // Cycle guard mirroring layoutSubtree — never recurse a node twice.
    if (moddedIds.has(id)) return;
    moddedIds.add(id);
    const y = (prelimY.get(id) ?? 0) + accumulated;
    yStartById.set(id, y);
    const m = modY.get(id) ?? 0;
    for (const cid of childrenById.get(id) ?? []) {
      applyMods(cid, accumulated + m);
    }
  }

  // Process roots as siblings of a virtual root (the gap depends on the
  // number of roots, mirroring Layer Px's virtual-root handling).
  const rootGap = siblingGap(roots.length, unit);
  let prevContour: Contour = new Map();
  for (let idx = 0; idx < roots.length; idx++) {
    const rootId = roots[idx]!;
    const contour = layoutSubtree(rootId, 0);
    let shift = 0;
    if (idx > 0) {
      shift = mergeContours(prevContour, contour, rootGap);
    }
    applyMods(rootId, shift);
    absorbContour(prevContour, shiftContour(contour, shift));
  }

  // Normalize: clamp min y to `paddingY`.
  let minY = Number.POSITIVE_INFINITY;
  for (const y of yStartById.values()) if (y < minY) minY = y;
  if (!Number.isFinite(minY)) minY = 0;
  const yOffset = paddingY - minY;
  for (const id of yStartById.keys()) {
    yStartById.set(id, (yStartById.get(id) ?? 0) + yOffset);
  }

  // X positions: parent's right edge + connectionGap. Each root starts
  // at `paddingX`. Pre-order DFS so children always see their parent's
  // final x first.
  const xById = new Map<string, number>();
  function computeX(id: string, parentRightEdge: number) {
    const node = byId.get(id);
    if (!node) return;
    const x = parentRightEdge + connectionGap;
    xById.set(id, x);
    const myRight = x + node.width;
    for (const cid of childrenById.get(id) ?? []) {
      computeX(cid, myRight);
    }
  }
  for (const rootId of roots) {
    computeX(rootId, paddingX - connectionGap);
  }

  const result: NodePosition[] = [];
  for (const node of nodes) {
    const x = xById.get(node.id);
    const y = yStartById.get(node.id);
    if (x === undefined || y === undefined) continue;
    result.push({ id: node.id, x, y });
  }
  return result;
}
