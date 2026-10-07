import type { ReactNode } from 'react';
import { Handle, Position } from 'reactflow';

/** Shared LayerPx card, including the same connection anchors and selection. */
export function CardSurface({ title, root, selected, height, width = 330, status, id, label, onSelect, headingExtra, children, controls, icon, disabled, className = '' }: {
  disabled?: boolean; icon?: ReactNode; title: string; root?: boolean; selected?: boolean; height: number; width?: number;
  status?: string; id: string; label: string; onSelect(): void;
  headingExtra?: ReactNode; children: ReactNode; controls?: ReactNode; className?: string;
}) {
  return <div className={`lpx-card ${root ? 'lpx-root' : ''} ${selected ? 'lpx-selected' : ''} ${className}`} data-status={status} data-agent-id={id} style={{ height, width }}>
    <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
    <button disabled={disabled} className="lpx-card-main nodrag nopan" onClick={onSelect} aria-label={label}>
      <span className="lpx-card-heading"><span className="lpx-role-icon" aria-hidden="true">{icon ?? (root ? '⌘' : '◇')}</span><strong title={title}>{title}</strong><span className="lpx-note" aria-hidden="true">≡</span>{headingExtra}</span>
      {children}
    </button>
    {controls}
    <div className="lpx-card-edge" aria-hidden="true" />
    <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
  </div>;
}
