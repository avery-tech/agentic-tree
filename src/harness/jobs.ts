import type { AgentNode, GraphSnapshot, Status } from '../model';
import type { Source } from './adapter';
/** Native rc.2 job-controller shapes, narrowed to observation only. */
export interface JobRow {
  id: string; owner?: string; kind: string; label: string;
  status: 'running' | 'stopping' | 'completed' | 'killed' | 'failed';
  startedAt: number; finishedAt?: number; progress?: string; detail?: string;
  output: { total: number; earliest: number };
}
export interface JobOutput { jobId: string; text: string; gapBefore: boolean; streaming: boolean; error?: string }
export interface JobsSnapshot { rows: Readonly<Record<string, readonly JobRow[]>>; observed: Readonly<Record<string, JobOutput>> }
export interface JobServices { state: Source<JobsSnapshot>; watchRows(id: string): () => void; observe(owner: string, id: string): () => void }
export const JOB_OWNER_LIMIT = 64, JOB_CARD_LIMIT = 200, JOB_OUTPUT_LIMIT = 8;
export const jobLive = (row: JobRow) => row.status === 'running' || row.status === 'stopping';
export function ownedJobs(snapshot: JobsSnapshot, owners: string[]): JobRow[] {
  const seen = new Set<string>();
  return owners.flatMap(owner => (snapshot.rows[owner] ?? []).filter(row => {
    // The native roster also contains global/unowned jobs. Never attribute those to HQ.
    if (row.owner !== owner || seen.has(row.id)) return false;
    seen.add(row.id); return true;
  })).sort((a,b) => Number(jobLive(b))-Number(jobLive(a)) || b.startedAt-a.startedAt || a.id.localeCompare(b.id));
}
export interface JobStamp { rowKey: string; output?: JobOutput; time: number; revision: number }
export function projectJobs(rows: JobRow[], snapshot: JobsSnapshot, previous: Map<string, JobStamp>, receivedAt: number) {
  const stamps = new Map<string, JobStamp>();
  const nodes = rows.map((row): AgentNode => {
    const old = previous.get(row.id), output = snapshot.observed[row.id];
    const rowKey = JSON.stringify([row.status, row.progress, row.detail, row.finishedAt]);
    // First replay is retained history, not fresh output. Timer ticks never create activity.
    const changed = old && (old.rowKey !== rowKey || (old.output && output && old.output !== output && output.streaming && !output.error));
    const time = row.finishedAt ?? (changed ? receivedAt : old?.time ?? row.startedAt);
    const revision = (old?.revision ?? 0) + (changed ? 1 : 0);
    stamps.set(row.id, { rowKey, output, time, revision });
    const status: Status = row.status === 'failed' ? 'Error' : row.status === 'killed' ? 'Cancelled' : row.status === 'completed' ? 'Completed' : 'Running';
    const tail = output?.text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').trimEnd().split(/\r?\n/).at(-1)?.slice(-320);
    return { id: `job:${row.owner}:${row.id}`, parentId: row.owner!, title: `${row.kind === 'bash' ? 'Bash' : row.kind} · ${row.id}`,
      task: row.label, assignmentTitle: row.label, status, start: row.startedAt, end: row.finishedAt,
      activity: output?.error ? 'Output unavailable' : row.progress || tail || row.detail || (jobLive(row) ? 'Waiting for output' : `Job ${row.status}`),
      lastEvent: { seq: revision, time, label: 'Job activity observed' }, dataState: 'ready',
      job: { id: row.id, owner: row.owner!, kind: row.kind, state: row.status, output: output?.text,
        gap: output?.gapBefore || row.output.earliest > 0, outputError: output?.error, detail: row.detail,
        streaming: output?.streaming ?? false, outputAvailable: row.output.total > 0 || jobLive(row) },
    };
  });
  return { nodes, stamps };
}
/** Attach to the owner's run that spans registration, otherwise its latest preceding run. */
export function attachJobs(graph: GraphSnapshot, jobs: AgentNode[]): GraphSnapshot {
  return { ...graph, nodes: [...graph.nodes, ...jobs.map(node => {
    const owner = node.job!.owner;
    const candidates = graph.nodes.filter(n => !n.job && (n.id === owner || n.sessionId === owner));
    const parent = candidates.find(n => n.executionTurn === undefined) ?? candidates.filter(n => (n.start ?? Infinity) <= (node.start ?? -Infinity)).sort((a,b)=>(b.start ?? 0)-(a.start ?? 0))[0];
    return { ...node, parentId: parent?.id ?? owner };
  })] };
}
