import type { JobServices } from './jobs';
import { sessionTokens } from './usage';
import { planFromProjection } from './plan';
import type { AgentNode, GraphSnapshot, ObserverView, Status } from '../model';

export interface CatalogEntry { id: string; mode: string; label?: string; createdAt?: number }
export interface ProjectionSnapshot { state: string; error?: { message?: string }; values: Record<string, any> }
export interface SessionList { byId: Record<string, any>; projectionsBySession: Record<string, ProjectionSnapshot> }
export const MAX_AGENTS = 1000;
/** Walk only authoritative direct-child catalogs. No title matching, fork guesses or global list merge. */
export function graphFromSessions(rootId: string, list: SessionList): GraphSnapshot {
  const nodes: AgentNode[] = [];
  const seen = new Set<string>();
  const queue: { id: string; parentId: string | null; entry?: CatalogEntry }[] = [{ id: rootId, parentId: null }];
  let index = 0;
  for (; index < queue.length && nodes.length < MAX_AGENTS; index++) {
    const { id, parentId, entry } = queue[index];
    if (seen.has(id)) continue;
    seen.add(id);
    const projection = list.projectionsBySession[id];
    const summary = list.byId[id];
    const values = projection?.values ?? summary?.projectionValues ?? {};
    const observation = values.layerpxObserver as ObserverView | undefined;
    const run = observation?.runs.at(-1);
    const running = summary?.running;
    let status: Status = running === true ? 'Running' : run?.status ?? (running === false ? 'Idle' : 'Unknown');
    // A dangling durable start after host restart cannot establish live activity.
    if (status === 'Running' && running !== true) status = 'Unknown';
    const role = observation?.role ?? values.agentPreset;
    const label = entry?.label ?? observation?.label ?? values.subagent?.label;
    const model = observation?.model ?? values.modelSelection?.lastUsed?.model;
    const activeCalls = observation?.calls.filter(c => c.turn === run?.turn && c.status === 'Running') ?? [];
    const activity = status === 'Running' && activeCalls.length > 0
      ? `${activeCalls[0].name}${activeCalls.length > 1 ? ` +${activeCalls.length - 1}` : ''}`
      : observation?.lastEvent?.label ?? 'No recorded activity';
    nodes.push({ id, parentId, tokens: sessionTokens(values.tokenUsage ?? summary?.projectionValues?.tokenUsage), viewerRole: observation?.viewerRole, title: parentId === null ? 'HQ' : `Agent · ${id.slice(0, 8)}`, role, label,
      model, assignmentTitle: (parentId === null ? summary?.title : label || summary?.title) || 'No assignment title', task: run?.task || label || summary?.title || 'No assignment recorded', status,
      start: run?.start, end: run?.end, lastEvent: observation?.lastEvent, activity, observation,
      mode: entry?.mode, createdAt: entry?.createdAt,
      dataState: projection?.state === 'error' || (projection?.state === 'ready' && !observation) ? 'error' : observation ? 'ready' : 'loading',
      dataError: projection?.error?.message ?? (projection?.state === 'ready' && !observation ? 'Viewer projection unavailable. Check that the Host plugin is enabled.' : undefined),
    });
    const children = values.subagentCatalog as CatalogEntry[] | undefined;
    if (Array.isArray(children)) for (const child of children) {
      if (typeof child.id === 'string' && !seen.has(child.id)) queue.push({ id: child.id, parentId: id, entry: child });
    }
  }
  const rootProjection = list.projectionsBySession[rootId];
  const rootValues = rootProjection?.values ?? list.byId[rootId]?.projectionValues ?? {};
  return { rootId, nodes, truncated: index < queue.length, plan: planFromProjection(rootValues, rootProjection?.state) };
}

export interface Source<T> { getSnapshot(): T; subscribe(listener: () => void): () => void }
export interface HistoryEntry { type: string; event: { seq: number; type: string; time: number; data: any } }
export interface HistorySession {
  eventSource: Source<{ entries: HistoryEntry[]; hasMore: boolean; revision: number }>;
  getSnapshot(): { openState: string; openError?: { message?: string }; loadingOlder: boolean; hasMore: boolean };
  subscribe(listener: () => void): () => void;
  loadOlder(): Promise<void>;
  loadThrough(seq: number): Promise<void>;
}
/** Intentionally narrowed read-only service face. Control methods do not cross this boundary. */
export interface ViewerServices {
  jobs: JobServices;
  list: Source<SessionList>;
  connection: Source<any>;
  generation: Source<unknown>;
  refreshProjections(id: string): Promise<void>;
  history(id: string, signal: AbortSignal): { ready: Promise<unknown>; session: () => HistorySession | undefined; release(): void };
}
export function readOnlyServices(ctx: any): ViewerServices {
  return {
    jobs: { state: ctx.jobs.state, watchRows: id => ctx.jobs.watchRows(id), observe: (owner, id) => ctx.jobs.observe(owner, id) },
    list: ctx.sessions.list, connection: ctx.connection.state, generation: ctx.connection.generation,
    refreshProjections: id => ctx.sessions.refreshProjections(id),
    history(id, signal) {
      const address = ctx.sessions.subagentAddress(id) ?? id;
      const reference = ctx.sessions.retain(address, { source: 'layerpxViewer', signal });
      return { ready: reference.ready, session: () => ctx.sessions.binding(id)?.session, release: () => reference.release() };
    },
  };
}
