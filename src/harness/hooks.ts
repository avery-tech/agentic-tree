import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { identifyAgents, readAgentNumbers, saveAgentNumbers } from './identity';
import { graphFromSessions, type ViewerServices, type Source, type HistorySession } from './adapter';
export function useSource<T>(source: Source<T>): T {
  return useSyncExternalStore(source.subscribe.bind(source), source.getSnapshot.bind(source));
}
export function useGraph(rootId: string, services: ViewerServices) {
  const list = useSource(services.list);
  const generation = useSource(services.generation);
  const [numbers, setNumbers] = useState(() => readAgentNumbers(rootId));
  const identified = useMemo(() => identifyAgents(graphFromSessions(rootId, list), numbers), [rootId, list, numbers]);
  const graph = identified.graph;
  useEffect(() => {
    if (identified.numbers !== numbers) {
      saveAgentNumbers(rootId, identified.numbers);
      setNumbers(identified.numbers);
    }
  }, [rootId, identified.numbers, numbers]);
  const ids = graph.nodes.map(n => n.id).join('\n');
  useEffect(() => {
    if (generation === undefined) return;
    let cancelled = false;
    const queue = ids.split('\n');
    // Bounded concurrent cold reads. The manager coalesces reads and owns reconnect.
    const worker = async () => {
      while (!cancelled && queue.length) {
        const id = queue.shift()!;
        await services.refreshProjections(id).catch(() => {});
      }
    };
    for (let i = 0; i < 4; i++) void worker();
    return () => { cancelled = true; };
  }, [ids, generation, services]);
  return graph;
}
export function useHistory(id: string, services: ViewerServices) {
  const [state, setState] = useState<{ session?: HistorySession; error?: string }>({});
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    setState({});
    let reference: ReturnType<ViewerServices['history']> | undefined;
    try {
      reference = services.history(id, controller.signal);
      const ref = reference;
      void ref.ready.then(() => {
        if (live) setState({ session: ref.session() });
      }).catch(error => { if (live) setState({ error: String(error) }); });
    } catch (error) { setState({ error: String(error) }); }
    return () => { live = false; controller.abort(); reference?.release(); };
  }, [id, services]);
  return state;
}
