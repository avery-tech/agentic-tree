import type { AgentNode } from '../model';

export const LIVE_ZOOM = 0.56;
/** Prefer observed running work, then the most recent recorded activity.
 * Event sequence numbers are local to sessions and cannot rank different agents.
 */
export function liveFocusTarget(nodes: AgentNode[], previousId?: string | null): AgentNode | undefined {
  const ready = nodes.filter(node => node.dataState === 'ready' && node.exitingAt === undefined);
  const runningAgents = ready.filter(node => !node.job && node.status === 'Running');
  const runningJobs = ready.filter(node => node.job && node.status === 'Running');
  const candidates = runningAgents.length ? runningAgents : runningJobs.length ? runningJobs : ready;
  const time = (node: AgentNode) => node.lastEvent?.time ?? node.end ?? node.start ?? node.createdAt ?? -Infinity;
  return candidates.reduce<AgentNode | undefined>((best, node) => {
    if (!best || time(node) > time(best)) return node;
    if (time(node) < time(best)) return best;
    // Do not jump between equally recent agents when a catalog is reordered.
    if (best.id === previousId) return best;
    if (node.id === previousId) return node;
    return node.id.localeCompare(best.id) < 0 ? node : best;
  }, undefined);
}
export function liveCamera(position: { x: number; y: number }, card: { width: number; height: number }, viewport: { width: number; height: number }) {
  return { x: viewport.width / 2 - (position.x + card.width / 2) * LIVE_ZOOM,
    y: viewport.height / 2 - (position.y + card.height / 2) * LIVE_ZOOM, zoom: LIVE_ZOOM };
}
