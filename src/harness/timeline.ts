import type { AgentNode, GraphSnapshot } from '../model';

/** A turn is an execution, never an inferred task or cross-agent handoff. */
export function executionGraph(graph: GraphSnapshot): GraphSnapshot {
  return { ...graph, nodes: graph.nodes.flatMap(node => {
    if (node.parentId === null || !node.observation?.runs.length) return [node];
    const latest = node.observation.runs.at(-1)!;
    return node.observation.runs.map(run => {
      const live = run.seq === latest.seq && node.status === 'Running';
      const status = live ? 'Running' : run.status === 'Running' ? 'Unknown' : run.status;
      const lastEvent = [...node.observation!.recent].reverse().find(e => e.time >= run.start && (run.end === undefined || e.time <= run.end));
      return { ...node, id: `${node.id}:run:${run.seq}`, sessionId: node.id, executionTurn: run.turn,
        status, model: run.model, start: run.start, end: run.end, task: run.task || 'No assignment recorded',
        activity: live ? node.activity : `Execution ${status.toLowerCase()}`,
        lastEvent: lastEvent ?? { seq: run.seq, time: run.end ?? run.start, label: 'Execution observed' },
      } satisfies AgentNode;
    });
  }) };
}

/** Ordered, compressed minute groups. Stable agent lanes; time is not distance. */
export function layoutTimeline(nodes: AgentNode[], width: number) {
  const root = nodes.find(n => n.parentId === null);
  const children = nodes.filter(n => n.parentId !== null && !n.job);
  const lanes = [...new Set(children.map(n => n.sessionId ?? n.id))];
  const ordered = children.slice().sort((a,b) => (a.start ?? a.createdAt ?? Infinity) - (b.start ?? b.createdAt ?? Infinity) || a.id.localeCompare(b.id));
  let column = 0, previousBucket = -Infinity;
  const occupied = new Set<string>();
  const positions = ordered.map(node => {
    const lane = lanes.indexOf(node.sessionId ?? node.id);
    const timestamp = node.start ?? node.createdAt;
    const bucket = timestamp === undefined ? Infinity : Math.floor(timestamp / 60000);
    if (bucket !== previousBucket || occupied.has(`${column}:${lane}`)) column++;
    previousBucket = bucket;
    occupied.add(`${column}:${lane}`);
    return { id: node.id, x: column * (width + 95), y: lane * 225 };
  });
  if (root) positions.unshift({ id: root.id, x: 0, y: 0 });
  const jobs = nodes.filter(n => n.job);
  const bottom = Math.max(0, ...positions.map(p => p.y)) + 225;
  jobs.forEach((node, i) => {
    const parent = positions.find(p => p.id === node.parentId);
    positions.push({ id: node.id, x: (parent?.x ?? 0) + width + 95, y: bottom + i * 225 });
  });
  return positions;
}
