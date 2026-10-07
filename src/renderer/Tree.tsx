import { useJobExit } from './useJobExit';
import { useLiveFocus, useFocusGlow } from './useLiveFocus';
import { liveCamera, liveFocusTarget } from './liveFocus';
import { CardSurface } from './CardSurface';
import { CanvasNavigation } from './CanvasNavigation';
import { Coins } from './Coins';
import { formatTokens } from '../harness/usage';
import { layoutTimeline } from '../harness/timeline';
import { Progress } from './Progress';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, ReactFlowProvider, useReactFlow, type Edge, type EdgeProps, type Node, type NodeProps } from 'reactflow';
import { layoutTree } from '../donor/treeLayout';
import { computeContextCamera, computeSceneBounds } from '../donor/contextCamera';
import { elbowPath } from '../donor/elbowPath';
import { elapsed, type AgentNode, type GraphSnapshot, type Status } from '../model';

type CardData = { node: AgentNode; now: number; frozen: boolean; selected: boolean; hidden: number; hasChildren: boolean; toggle(id: string): void; select(id: string): void };
const symbols: Record<string, string> = { Running: '◉', Completed: '✓', Error: '!', Idle: '○', Cancelled: '■', Blocked: 'Ⅱ', Unknown: '?' };
function showActivity(node: AgentNode) {
  return node.dataState !== 'ready' || ((node.status === 'Running' || (node.exitingAt !== undefined && (node.job?.state === 'running' || node.job?.state === 'stopping'))) && node.activity !== 'Execution started');
}
function cardHeight(node: AgentNode) { return (showActivity(node) ? 184 : 162) + (node.executionTurn !== undefined ? 20 : 0); }
const Card = memo(function Card({ data }: NodeProps<CardData>) {
  const { node, now, frozen, selected, hidden, hasChildren, toggle, select } = data;
  const duration = elapsed(node.start, node.end ?? ((frozen || node.status !== 'Running') ? node.lastEvent?.time : undefined), now);
  const age = node.lastEvent ? elapsed(node.lastEvent.time, undefined, now) : '—';
  return <CardSurface id={node.id} title={node.title} root={node.parentId === null} selected={selected} status={node.status} height={cardHeight(node)} disabled={node.exitingAt !== undefined} className={node.exitingAt !== undefined ? 'lpx-exiting' : ''} icon={node.job ? '›_' : undefined}
    label={`Details for ${node.title}${node.identity && node.identity !== node.title ? ` · ${node.identity}` : ''}${node.executionTurn !== undefined ? ` · Run ${node.executionTurn}` : ''}`}
    onSelect={() => select(node.id)} headingExtra={<time title={`Elapsed${frozen ? ' · last observed' : ''}`} className="lpx-time">{duration}</time>}
    controls={hasChildren && <button className="lpx-fold nodrag nopan" onClick={event => { event.stopPropagation(); toggle(node.id); }} aria-label={`${hidden ? 'Expand' : 'Collapse'} agents under ${node.title}`}>{hidden || '−'}</button>}>
      {node.job ? <span className="lpx-model">Background job · {node.job.kind}</span> : <span className="lpx-model-row"><span className="lpx-model" title={node.model}>{node.identity && node.identity !== node.title && <span className="lpx-identity">{node.identity} · </span>}{node.model ?? 'Model unknown'}</span><span className="lpx-token-count" title="Total tokens for this agent session, across all runs; not a monetary cost"><Coins />{formatTokens(node.tokens)}{node.executionTurn !== undefined && ' · session'}</span></span>}
      {node.executionTurn !== undefined && <span className="lpx-run-label">Run {node.executionTurn} · {node.start === undefined ? 'Start unknown' : new Date(node.start).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span>}
      <span className="lpx-task" title={node.assignmentTitle ?? node.task}>{node.assignmentTitle ?? node.task}</span>
      <span className="lpx-card-footer"><span className="lpx-status"><span aria-hidden="true">{symbols[node.status]}</span> {node.exitingAt !== undefined ? 'No longer listed' : node.job?.state === 'stopping' ? 'Stopping' : node.status}</span><span className="lpx-event-age" title={node.job ? "Time since observed job activity" : "Time since last recorded agent event"}>{node.job ? "Observed" : "Last event"} {age}</span></span>
      {showActivity(node) && <span className="lpx-activity" title={node.activity}>{node.dataState === 'error' ? 'Could not load observation' : node.dataState === 'loading' ? 'Loading observation…' : node.activity}</span>}
  </CardSurface>;
});
export type ConnectionData = { jobOwner?: boolean; exiting?: boolean; status: Status; emphasized: boolean; frozen: boolean; exampleKind?: 'delegation' | 'sequence' };
function Elbow({ sourceX, sourceY, targetX, targetY, data, markerEnd }: EdgeProps<ConnectionData>) {
  const state = data?.status === 'Running' && !data.frozen ? 'active'
    : data?.status === 'Completed' ? 'finished' : 'neutral';
  return <path d={elbowPath(sourceX, sourceY, targetX, targetY)} markerEnd={markerEnd} className={`react-flow__edge-path lpx-connection ${data?.exampleKind ? `is-example-${data.exampleKind}` : `is-${state}`}${data?.emphasized ? ' is-emphasized' : ''}${data?.exiting ? ' lpx-exiting' : ''}`}>
    <title>{data?.exampleKind ? `Example · ${data.exampleKind === 'delegation' ? 'Delegation' : 'Task sequence · same agent'}` : `${data?.jobOwner ? 'Job owner' : 'Delegation'} · ${data?.status ?? 'Unknown'}${data?.frozen ? ' · last observed' : ''}`}</title>
  </path>;
}
const nodeTypes = { agent: Card };
export const edgeTypes = { elbow: Elbow };
const WIDTH = 330;
export interface TreeProps { graph: GraphSnapshot; mode?: 'tree' | 'timeline'; now: number; frozen: boolean; selected: string | null; onSelect(id: string): void }
export function Tree(props: TreeProps) { return <ReactFlowProvider><TreeCanvas {...props} /></ReactFlowProvider>; }

function TreeCanvas({ graph: incomingGraph, mode = 'tree', now, frozen, selected, onSelect }: TreeProps) {
  const graph = useJobExit(incomingGraph);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const frame = useRef<HTMLDivElement>(null);
  const [following, setFollowing] = useState(false);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const previousTarget = useRef<string | null>(null);
  const stopFollowing = useCallback(() => setFollowing(false), []);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setFrameSize({ width: element.clientWidth, height: element.clientHeight }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const { setViewport, getViewport } = useReactFlow();
  const toggle = useCallback((id: string) => setCollapsed(previous => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; }), []);
  const structure = graph.nodes.map(n => `${n.id}:${n.parentId}:${n.start}:${cardHeight(n)}`).join('|');
  const placement = useMemo(() => {
    const children = new Map<string, string[]>();
    for (const node of graph.nodes) if (node.parentId) children.set(node.parentId, [...(children.get(node.parentId) ?? []), node.id]);
    const descendants = (id: string): string[] => {
      const result: string[] = [], todo = [...(children.get(id) ?? [])], seen = new Set([id]);
      while (todo.length) { const child = todo.pop()!; if (seen.has(child)) continue; seen.add(child); result.push(child); todo.push(...(children.get(child) ?? [])); }
      return result;
    };
    const hidden = new Set([...collapsed].flatMap(descendants));
    const visible = graph.nodes.filter(n => !hidden.has(n.id));
    const positions = mode === 'timeline' ? layoutTimeline(visible, WIDTH) : layoutTree(visible.map(n => ({ id: n.id, parentId: n.parentId, width: WIDTH, height: cardHeight(n) })), { connectionGap: 95, unit: 105 });
    return { positions, heights: new Map(visible.map(n => [n.id, cardHeight(n)])), visibleIds: new Set(visible.map(n => n.id)), children, counts: new Map([...collapsed].map(id => [id, descendants(id).length])) };
    // Recompute only when tree structure or card dimensions change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure, collapsed, mode]);
  const nodes = useMemo<Node<CardData>[]>(() => {
    const byId = new Map(graph.nodes.map(n => [n.id, n]));
    return placement.positions.map(position => ({ id: position.id, type: 'agent', zIndex: 3, position: { x: position.x, y: position.y }, width: WIDTH, height: placement.heights.get(position.id)!, draggable: false, selectable: false, connectable: false,
      data: { node: byId.get(position.id)!, now, frozen, selected: selected === position.id, hidden: placement.counts.get(position.id) ?? 0, hasChildren: mode === 'tree' && placement.children.has(position.id), toggle, select: onSelect } }));
  }, [graph, placement, now, frozen, selected, toggle, onSelect]);
  const edges = useMemo<Edge<ConnectionData>[]>(() => graph.nodes
    .filter(n => n.parentId && placement.visibleIds.has(n.id) && placement.visibleIds.has(n.parentId))
    .map(n => ({ id: `${n.parentId}->${n.id}`, source: n.parentId!, target: n.id, type: 'elbow',
      data: { exiting: n.exitingAt !== undefined, jobOwner: !!n.job, status: n.status, emphasized: n.id === selected, frozen },
      zIndex: n.id === selected ? 2 : n.status === 'Running' && !frozen ? 1 : 0,
    })), [graph, placement, selected, frozen]);
  const fit = useCallback((initial = false) => {
    const rect = frame.current?.getBoundingClientRect();
    const bounds = computeSceneBounds(placement.positions.map(p => ({ ...p, width: WIDTH, height: placement.heights.get(p.id)! })));
    if (!rect || !bounds) return;
    const camera = computeContextCamera(bounds, { width: rect.width, height: rect.height });
    if (camera) {
      // Keep donor framing when it fits; let explicit Fit view shrink below its
      // reading-size floor so a session tree can fit a narrow Harness pane.
      const fitZoom = Math.max(0.00001, Math.min(camera.zoom, (rect.width - 80) / bounds.width, (rect.height - 80) / bounds.height));
      if (initial && mode === 'timeline') { setViewport({ x: 32, y: 48, zoom: 0.8 }); return; }
      setViewport({ x: (rect.width - bounds.width * fitZoom) / 2 - bounds.minX * fitZoom, y: (rect.height - bounds.height * fitZoom) / 2 - bounds.minY * fitZoom, zoom: fitZoom });
    }
  }, [placement, setViewport, mode]);
  const fitted = useRef(false);
  useEffect(() => {
    if (following || fitted.current || graph.nodes.some(n => n.dataState === 'loading')) return;
    const timer = setTimeout(() => { fit(true); fitted.current = true; }, 100);
    return () => clearTimeout(timer);
  }, [graph, fit, following]);
  const focusTarget = useLiveFocus(liveFocusTarget(graph.nodes.filter(node => placement.visibleIds.has(node.id)), previousTarget.current), graph.nodes.filter(node => node.exitingAt === undefined), following, frozen);
  useFocusGlow(frame, focusTarget, following, frozen);
  const targetPosition = placement.positions.find(position => position.id === focusTarget?.id);
  const targetHeight = focusTarget ? cardHeight(focusTarget) : 0;
  useEffect(() => {
    if (!following || frozen || !focusTarget || !targetPosition || frameSize.width <= 0 || frameSize.height <= 0) return;
    previousTarget.current = focusTarget.id;
    fitted.current = true;
    const destination = liveCamera(targetPosition, { width: WIDTH, height: targetHeight }, frameSize);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setViewport(destination); return; }
    // React Flow's zoom interpolation briefly changes scale during long pans.
    // Interpolate translation only so Live stays at exactly 56% throughout.
    const origin = getViewport(), start = performance.now();
    let animation = 0;
    const move = (time: number) => {
      const t = Math.min(1, (time - start) / 400), eased = t * t * (3 - 2 * t);
      setViewport({ x: origin.x + (destination.x - origin.x) * eased, y: origin.y + (destination.y - origin.y) * eased, zoom: destination.zoom });
      if (t < 1) animation = requestAnimationFrame(move);
    };
    animation = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animation);
    // Recenter only when the target or geometry changes, not on timer ticks.
  }, [following, frozen, focusTarget?.id, targetPosition?.x, targetPosition?.y, targetHeight, frameSize.width, frameSize.height, setViewport, getViewport]);
  return <div className="lpx-canvas" ref={frame}>
    <ReactFlow onMoveStart={event => { if (event) stopFollowing(); }} onNodeClick={(_, node) => onSelect(node.id)} nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} minZoom={0.00001} maxZoom={2} nodesDraggable={false} nodesConnectable={false} nodesFocusable={false} edgesFocusable={false} elementsSelectable={false} panOnDrag panOnScroll zoomOnScroll={false} zoomOnPinch zoomOnDoubleClick={false} proOptions={{ hideAttribution: true }}>
      <Background gap={32} color="var(--lpx-grid)" />
      <div className="lpx-edge-legend" aria-label="Connection styles"><span><i className="is-active" />Running</span><span><i className="is-neutral" />Other states</span><span><i className="is-finished" />Completed</span></div>
      <div className="lpx-canvas-controls"><Progress plan={graph.plan} frozen={frozen} /><CanvasNavigation onFit={() => fit()} onNavigate={stopFollowing}>{mode === 'timeline' && <button className={`lpx-follow ${frozen ? 'is-paused' : ''}`} aria-pressed={following} title={following && frozen ? 'Following paused until the connection returns' : 'Follow active agents, then background jobs, at 56%. Hold each focus for 3 seconds. Pan or zoom to stop following.'} onClick={() => setFollowing(value => !value)}><span aria-hidden="true">◉</span> Live</button>}</CanvasNavigation></div>
    </ReactFlow>
  </div>;
}
