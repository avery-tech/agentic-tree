export interface ViewerRole { name: string; source: 'explicit' | 'opening'; seq: number }

/** Portable viewer contract. No Harness services or command capabilities. */
export type Status = 'Running' | 'Completed' | 'Error' | 'Idle' | 'Cancelled' | 'Blocked' | 'Unknown';
export interface Observation { seq: number; time: number; label: string }
export interface ToolSummary {
  id: string; seq: number; turn: number; step: number; name: string; start: number;
  end?: number; resultSeq?: number; status: Status;
}
export interface RunSummary {
  model?: string;
  turn: number; seq: number; start: number; end?: number; status: Status;
  task: string; promptSeq?: number; resultSeq?: number; resultPreview?: string;
}
export interface ObserverView {
  roleExamined?: boolean; viewerRole?: ViewerRole;
  lastSeq: number; lastEvent?: Observation; role?: string; label?: string;
  model?: string; runs: RunSummary[]; calls: ToolSummary[]; recent: Observation[];
  runsTotal: number; callsTotal: number;
}
export interface BackgroundJob { id: string; owner: string; kind: string; state: string; output?: string; gap: boolean; outputError?: string; detail?: string; streaming: boolean; outputAvailable: boolean }
export interface AgentNode {
  job?: BackgroundJob;
  /** Renderer-only departure timestamp; never a native activity event. */
  exitingAt?: number;
  sessionId?: string; executionTurn?: number; tokens?: number;
  id: string; parentId: string | null; title: string; identity?: string; viewerRole?: ViewerRole; label?: string; role?: string;
  model?: string; task: string; assignmentTitle?: string; status: Status; start?: number; end?: number;
  activity: string; lastEvent?: Observation; observation?: ObserverView;
  dataState: 'loading' | 'ready' | 'error'; dataError?: string;
  mode?: string; createdAt?: number;
}
export interface PlanStep { title: string; status: 'pending' | 'in_progress' | 'completed' }
export interface SessionPlan { state: 'ready' | 'absent' | 'loading' | 'unavailable'; steps: PlanStep[] }
export interface GraphSnapshot { rootId: string; nodes: AgentNode[]; truncated: boolean; plan: SessionPlan }
export function elapsed(start: number | undefined, end: number | undefined, now: number): string {
  if (start === undefined) return '—';
  const seconds = Math.max(0, Math.floor(((end ?? now) - start) / 1000));
  const hours = Math.floor(seconds / 3600);
  return `${hours ? `${hours}:` : ''}${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
