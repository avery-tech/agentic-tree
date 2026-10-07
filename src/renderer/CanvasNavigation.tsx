import type { ReactNode } from 'react';
import { useReactFlow, useViewport } from 'reactflow';

/** The same zoom controls for observed sessions and the example canvas. */
export function CanvasNavigation({ onFit, onNavigate, children }: { onFit(): void; onNavigate?(): void; children?: ReactNode }) {
  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  return <div className="lpx-zoom nodrag nopan"><button onClick={() => { onNavigate?.(); zoomOut(); }} aria-label="Zoom out">−</button><span>{Math.round(zoom * 100)}%</span><button onClick={() => { onNavigate?.(); zoomIn(); }} aria-label="Zoom in">+</button><button onClick={() => { onNavigate?.(); onFit(); }}>Fit view</button>{children}</div>;
}
