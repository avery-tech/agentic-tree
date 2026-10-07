export interface SceneBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export const CAMERA_PAD = 40;
export const CAMERA_ZOOM_FLOOR = 0.65;
export const CAMERA_ZOOM_CEIL = 1.5;

/**
 * Допуск «влезло»: полпикселя. Экспортируется с SHARE-VITRINA — публичная
 * витрина спрашивает **тот же** вопрос («дерево в кадр не встало»), чтобы
 * решить, кадрировать ли по канону или встать якорем на корень (решение 7
 * вердикта пробы-1). Своя копия числа разошлась бы с этой на первой же правке
 * канона, и разошлась бы молча.
 */
export const CAMERA_FIT_EPS = 0.5;
const FIT_EPS = CAMERA_FIT_EPS;

export interface ContextCameraOptions {
  padX?: number;
  padTop?: number;
  padBottom?: number;
}

export function computeContextCamera(
  bounds: SceneBounds,
  viewport: ViewportSize,
  opts: ContextCameraOptions = {},
): CameraState | null {
  const padX = opts.padX ?? CAMERA_PAD;
  const padTop = opts.padTop ?? CAMERA_PAD;
  const padBottom = opts.padBottom ?? CAMERA_PAD;

  if (bounds.width <= 0 || bounds.height <= 0) return null;
  if (viewport.width <= 0 || viewport.height <= 0) return null;

  const usableW = Math.max(viewport.width - 2 * padX, 1);
  const usableH = Math.max(viewport.height - padTop - padBottom, 1);

  const fitW = usableW / bounds.width;
  const fitH = usableH / bounds.height;
  let zoom = Math.min(fitW, fitH);

  if (zoom < CAMERA_ZOOM_FLOOR) {
    zoom = Math.min(fitH, (fitW + fitH) / 2);
  }

  zoom = Math.min(Math.max(zoom, CAMERA_ZOOM_FLOOR), CAMERA_ZOOM_CEIL);

  const fitsAll =
    bounds.width * zoom <= usableW + FIT_EPS &&
    bounds.height * zoom <= usableH + FIT_EPS;

  const offsetX = fitsAll
    ? padX + (usableW - bounds.width * zoom) / 2
    : padX;
  const offsetY = fitsAll
    ? padTop + (usableH - bounds.height * zoom) / 2
    : padTop;

  return {
    x: offsetX - bounds.minX * zoom,
    y: offsetY - bounds.minY * zoom,
    zoom,
  };
}

export interface SceneRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeSceneBounds(rects: readonly SceneRect[]): SceneBounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const rect of rects) {
    if (rect.width <= 0 || rect.height <= 0) continue;
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
