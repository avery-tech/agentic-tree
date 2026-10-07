export const PRODUCT_NAME = 'Agentic Tree';
export const PRODUCT_SIGNATURE = 'Agentic Tree by layerPx';

/** LayerPx landing mark; favicon SVG geometry with the background removed. */
export function LayerPxMark({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
    <g transform="translate(2 1)">
      <rect x="5" y="19" width="26" height="11" rx="4" fill="#14120F" transform="translate(18 24.5) skewX(-18) translate(-18 -24.5)" />
      <rect x="0" y="11" width="26" height="11" rx="4" fill="#C9FF3D" transform="translate(13 16.5) skewX(-18) translate(-13 -16.5)" />
      <rect x="8" y="3" width="20" height="9" rx="4" fill="#14120F" fillOpacity=".2" transform="translate(18 7.5) skewX(-18) translate(-18 -7.5)" />
    </g>
  </svg>;
}

export function LayerPxTabLabel({ title }: { title: string }) {
  return <span title={PRODUCT_SIGNATURE} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}><LayerPxMark size={22} />{title}</span>;
}
