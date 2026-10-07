import type { AgentNode } from '../model';
export const JOB_EXIT_MS = 2000;
/** Presentation-only retention. Never feeds counters or native subscriptions. */
export function retainExitingJobs(previous: AgentNode[], current: AgentNode[], now: number): AgentNode[] {
  const currentById = new Map(current.map(node => [node.id, node]));
  const retained = previous.flatMap(node => {
    const fresh = currentById.get(node.id);
    if (fresh) { currentById.delete(node.id); return [fresh]; }
    if (!node.job || !current.some(owner => owner.id === node.parentId)) return [];
    const exitingAt = node.exitingAt ?? now;
    if (now >= exitingAt + JOB_EXIT_MS) return [];
    return [{ ...node, exitingAt, end: node.end ?? exitingAt,
      status: node.status === 'Running' ? 'Unknown' as const : node.status }];
  });
  return [...retained, ...currentById.values()];
}
