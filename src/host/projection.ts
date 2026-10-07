import { z } from 'zod';
import { roleFromAssignment } from './viewerRole';
import type { ObserverView, RunSummary, Status } from '../model';

export const PROJECTION_KEY = 'layerpxObserver';
export const LIMITS = { runs: 24, calls: 80, recent: 40, preview: 320 } as const;
// rc.2 wire envelopes. Data remains private to the Harness adapter.
export interface WireEvent { type: string; seq: number; time: number; data: any; surfaceOp?: string | { op: string; startSeq: number; endSeq: number } }
export interface ObserverState { inheritedEventCount: number; view: ObserverView }
const statuses = z.enum(['Running', 'Completed', 'Error', 'Idle', 'Cancelled', 'Blocked', 'Unknown']);
const observation = z.object({ seq: z.number(), time: z.number(), label: z.string() });
const run = z.object({ model: z.string().optional(), turn: z.number(), seq: z.number(), start: z.number(), end: z.number().optional(), status: statuses, task: z.string(), promptSeq: z.number().optional(), resultSeq: z.number().optional(), resultPreview: z.string().optional() });
const call = z.object({ id: z.string(), seq: z.number(), turn: z.number(), step: z.number(), name: z.string(), start: z.number(), end: z.number().optional(), resultSeq: z.number().optional(), status: statuses });
export const viewSchema = z.object({ roleExamined: z.boolean().optional(), viewerRole: z.object({ name: z.string().max(64), source: z.enum(['explicit', 'opening']), seq: z.number() }).optional(), lastSeq: z.number(), lastEvent: observation.optional(), role: z.string().optional(), label: z.string().optional(), model: z.string().optional(), runs: z.array(run).max(LIMITS.runs), calls: z.array(call).max(LIMITS.calls), recent: z.array(observation).max(LIMITS.recent), runsTotal: z.number(), callsTotal: z.number() });
export function initObserver(_header: unknown, inheritedEventCount = 0): ObserverState {
  return { inheritedEventCount, view: { lastSeq: -1, runs: [], calls: [], recent: [], runsTotal: 0, callsTotal: 0 } };
}
export function textContent(content: unknown, limit = LIMITS.preview as number): string {
  if (!Array.isArray(content)) return '';
  let text = '';
  for (const b of content) {
    if (b?.type === 'text' && typeof b.text === 'string') text += `${text ? ' ' : ''}${b.text.slice(0, limit + 1)}`;
    if (text.length > limit) break;
  }
  text = text.replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}
function assistantPreview(d: any): string {
  // Read the settled message; raw provider streams remain in session history.
  const direct = textContent(d.message?.content);
  if (direct) return direct;
  return '';
}
function endStatus(kind: unknown): Status {
  if (kind === 'completed') return 'Completed';
  if (kind === 'error') return 'Error';
  if (kind === 'blocked') return 'Blocked';
  if (kind === 'aborted' || kind === 'cancelled') return 'Cancelled';
  return 'Unknown';
}
const interesting = new Set(['agent-preset/selected', 'subagent/descriptor', 'request/header', 'turn/start', 'turn/end', 'user/message', 'step/start', 'step/end', 'tool/call', 'tool/result', 'assistant/message', 'assistant/attempt', 'approval/asked', 'approval/decided', 'compaction/start', 'compaction/end']);
/** Pure bounded fold. No I/O, agent references, writes, or wall-clock reads. */
export function applyObserver(state: ObserverState, event: WireEvent): ObserverState {
  if (event.seq < state.inheritedEventCount || event.seq <= state.view.lastSeq || !interesting.has(event.type)) return state;
  const d = event.data ?? {};
  const v: ObserverView = { ...state.view, lastSeq: event.seq, runs: [...state.view.runs], calls: [...state.view.calls] };
  let label = event.type;
  const updateRun = (change: Partial<RunSummary>) => {
    const index = v.runs.findIndex(r => r.turn === d.turn);
    if (index >= 0) v.runs[index] = { ...v.runs[index], ...change };
  };
  switch (event.type) {
    case 'agent-preset/selected':
      if (typeof d.agentPreset === 'string') v.role = d.agentPreset;
      label = 'Agent preset selected'; break;
    case 'subagent/descriptor':
      if (typeof d.label === 'string') v.label = d.label;
      label = 'Agent created'; break;
    case 'request/header':
      if (typeof d.header?.config?.model === 'string') {
        v.model = d.header.config.model;
        const current = v.runs.at(-1);
        if (current && current.end === undefined) v.runs[v.runs.length - 1] = { ...current, model: d.header.config.model };
      }
      label = 'Model request'; break;
    case 'turn/start':
      if (typeof d.turn !== 'number') return state;
      v.runs = [...v.runs, { turn: d.turn, seq: event.seq, start: event.time, status: 'Running' as const, task: '' }].slice(-LIMITS.runs);
      v.runsTotal++; label = 'Execution started'; break;
    case 'user/message':
      // The first admitted user message is the assignment; later steering is activity.
      if (event.surfaceOp !== undefined && event.surfaceOp !== 'append') return state;
      { const r = v.runs.at(-1);
        if (r && !r.task) {
          if (!v.roleExamined) {
            v.roleExamined = true;
            const viewerRole = roleFromAssignment(d.content, event.seq);
            if (viewerRole) v.viewerRole = viewerRole;
          }
          v.runs[v.runs.length - 1] = { ...r, task: textContent(d.content), promptSeq: event.seq };
        }
      }
      label = 'Message received'; break;
    case 'turn/end':
      updateRun({ end: event.time, status: endStatus(d.reason?.kind) });
      // An unpaired tool is not marked successful when its turn ends.
      v.calls = v.calls.map(c => c.turn === d.turn && c.status === 'Running' ? { ...c, status: endStatus(d.reason?.kind) === 'Cancelled' ? 'Cancelled' : 'Unknown', end: event.time } : c);
      label = `Execution ${endStatus(d.reason?.kind).toLowerCase()}`; break;
    case 'step/start': label = 'Step started'; break;
    case 'step/end': label = 'Step finished'; break;
    case 'tool/call':
      if (typeof d.callId !== 'string' || typeof d.name !== 'string') return state;
      v.calls = [...v.calls, { id: d.callId, seq: event.seq, turn: d.turn, step: d.step, name: d.name, start: event.time, status: 'Running' as const }].slice(-LIMITS.calls);
      v.callsTotal++; label = `Started ${d.name}`; break;
    case 'tool/result': {
      if (event.surfaceOp !== undefined && event.surfaceOp !== 'append') return state;
      const id = d.message?.source?.callId ?? d.message?.toolCallId;
      const index = v.calls.findIndex(c => c.id === id && c.turn === d.turn && c.step === d.step);
      const failed = d.message?.isError === true;
      if (index >= 0) v.calls[index] = { ...v.calls[index], end: event.time, resultSeq: event.seq, status: failed ? 'Error' : 'Completed' };
      label = `${failed ? 'Error in' : 'Finished'} ${index >= 0 ? v.calls[index].name : 'tool'}`; break;
    }
    case 'assistant/message':
      updateRun({ resultSeq: event.seq, resultPreview: assistantPreview(d) }); label = 'Assistant response recorded'; break;
    case 'assistant/attempt': label = 'Assistant attempt recorded'; break;
    case 'approval/asked': label = 'Approval requested'; break;
    case 'approval/decided': label = 'Approval answered'; break;
    case 'compaction/start': label = 'Compacting context'; break;
    case 'compaction/end': label = 'Context compacted'; break;
  }
  v.lastEvent = { seq: event.seq, time: event.time, label };
  v.recent = [...v.recent, v.lastEvent].slice(-LIMITS.recent);
  return { ...state, view: v };
}
export const observerDefinition = {
  key: PROJECTION_KEY, stateVersion: 4,
  stateSchema: z.object({ inheritedEventCount: z.number(), view: viewSchema }),
  init: initObserver, apply: applyObserver,
  wire: { viewSchema, view: (state: ObserverState) => state.view },
};
