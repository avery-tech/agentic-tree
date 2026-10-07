import { useEffect, useState } from 'react';
import type { GraphSnapshot } from '../model';
import { JOB_EXIT_MS, retainExitingJobs } from './jobExit';
export function useJobExit(graph: GraphSnapshot) {
  const [nodes, setNodes] = useState(graph.nodes);
  useEffect(() => { setNodes(previous => retainExitingJobs(previous, graph.nodes, Date.now())); }, [graph.nodes]);
  const deadline = Math.min(...nodes.filter(n => n.exitingAt !== undefined).map(n => n.exitingAt! + JOB_EXIT_MS));
  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    const timer = setTimeout(() => setNodes(previous => retainExitingJobs(previous, graph.nodes, Date.now())), Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [deadline, graph.nodes]);
  return { ...graph, nodes };
}
