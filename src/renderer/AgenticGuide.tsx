import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, MarkerType, ReactFlowProvider, useReactFlow, type Edge, type Node, type NodeProps } from 'reactflow';
import { CardSurface } from './CardSurface';
import { CanvasNavigation } from './CanvasNavigation';
import { DetailsPanel } from './Details';
import { edgeTypes, type ConnectionData } from './Tree';
import { exampleCards, exampleConnections, sections, type ExampleCard, type ExampleSection } from './guideExamples';

type CardData = { card: ExampleCard; selected: boolean; select(id: string): void };
const ExampleNode = memo(function ExampleNode({ data }: NodeProps<CardData>) {
  const { card, selected, select } = data;
  return <CardSurface id={card.id} title={card.title} root={card.root} selected={selected} height={150} width={card.width}
    label={`Example details for ${card.title}`} onSelect={() => select(card.id)} className="lpx-example-card">
    <span className="lpx-example-kind">Example · {card.kind === 'agent' ? 'Agent' : 'Task · Main agent'}</span>
    <span className="lpx-task">{card.task}</span>
    <span className="lpx-example-hint">View details ↗</span>
  </CardSurface>;
});
function SectionLabel({ data }: NodeProps<ExampleSection>) {
  return <div className="lpx-example-label" style={{ background: data.color }}><small>EXAMPLE {data.number}</small><strong>{data.title}</strong></div>;
}
function SectionComment({ data }: NodeProps<ExampleSection>) {
  return <div className="lpx-example-comment nodrag nopan">
    <p><strong>When</strong> {data.when}</p><p><strong>Why these roles</strong> {data.why}</p><p><strong>Limit</strong> {data.limit}</p>
    {data.article ? <a href={data.article.url} target="_blank" rel="noreferrer">{data.article.title} ↗</a> : <small>Extended guide to follow on the layerPx blog.</small>}
  </div>;
}
const nodeTypes = { example: ExampleNode, section: SectionLabel, comment: SectionComment };

export function AgenticGuide() { return <ReactFlowProvider><GuideCanvas /></ReactFlowProvider>; }
function GuideCanvas() {
  const [selected, setSelected] = useState<string | null>(null);
  const [focused, setFocused] = useState('chat');
  const frame = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const { setViewport } = useReactFlow();
  const selectedCard = exampleCards.find(card => card.id === selected);
  const nodes = useMemo<Node[]>(() => [
    ...exampleCards.map(card => ({ id: card.id, type: 'example', position: { x: card.x, y: card.y }, width: card.width, height: 150, zIndex: 3, data: { card, selected: selected === card.id, select: setSelected } })),
    ...sections.flatMap(section => [
      { id: `label-${section.id}`, type: 'section', position: { x: 0, y: section.y + 40 }, width: 170, height: 110, data: section },
      { id: `comment-${section.id}`, type: 'comment', position: { x: 220, y: section.commentY }, width: 1100, height: 135, data: section },
    ]),
  ], [selected]);
  const edges = useMemo<Edge<ConnectionData>[]>(() => exampleConnections.map(edge => ({
    id: `${edge.source}->${edge.target}`, source: edge.source, target: edge.target, type: 'elbow',
    markerEnd: { type: MarkerType.ArrowClosed, color: edge.kind === 'delegation' ? '#7854ec' : '#738079', width: 15, height: 15 },
    data: { status: 'Unknown', frozen: true, emphasized: selected === edge.target || selected === edge.source, exampleKind: edge.kind },
  })), [selected]);
  const focus = useCallback((id: string, duration = 250) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect || rect.width < 1 || rect.height < 1) return;
    const section = sections.find(item => item.id === id);
    const bounds = section ? { x: 0, y: section.y, width: section.id === 'startup' ? 1510 : 1320, height: section.height } : { x: 0, y: 0, width: 1510, height: 1770 };
    // Reserve room for the fixed legend, section navigation and zoom controls.
    const zoom = Math.max(.08, Math.min(1, (rect.width - 48) / bounds.width, (rect.height - 150) / bounds.height));
    setViewport({ x: (rect.width - bounds.width * zoom) / 2, y: 65 + Math.max(0, (rect.height - 150 - bounds.height * zoom) / 2) - bounds.y * zoom, zoom }, { duration });
    setFocused(id);
  }, [setViewport]);
  useEffect(() => {
    const frameNode = frame.current;
    if (!frameNode) return;
    const observer = new ResizeObserver(() => {
      if (!initialized.current && frameNode.clientWidth > 0 && frameNode.clientHeight > 0) { initialized.current = true; focus('chat', 0); }
    });
    observer.observe(frameNode);
    return () => observer.disconnect();
  }, [focus]);
  return <>
    <div className="lpx-canvas lpx-guide-canvas" ref={frame} aria-label="Example learning canvas">
      <ReactFlow onNodeClick={(_, node) => { if (node.type === 'example') setSelected(node.id); }} nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} minZoom={.08} maxZoom={2}
        nodesDraggable={false} nodesConnectable={false} nodesFocusable={false} edgesFocusable={false} elementsSelectable={false}
        panOnDrag panOnScroll zoomOnScroll={false} zoomOnPinch zoomOnDoubleClick={false} proOptions={{ hideAttribution: true }}>
        <Background gap={32} color="var(--lpx-grid)" />
        <div className="lpx-edge-legend" aria-label="Example connection legend"><span><i className="is-example-delegation" />Delegation · parent → child</span><span><i className="is-example-sequence" />Task sequence · same agent</span></div>
        <div className="lpx-canvas-controls">
          <nav className="lpx-example-nav lpx-view-switch nodrag nopan" aria-label="Navigate examples">{sections.map(section => <button key={section.id} aria-pressed={focused === section.id} onClick={() => { setSelected(null); focus(section.id); }}>{section.number} {section.title}</button>)}</nav>
          <CanvasNavigation onFit={() => { setSelected(null); focus('all'); }} />
        </div>
      </ReactFlow>
    </div>
    {selectedCard && <DetailsPanel title={selectedCard.title} label="EXAMPLE DETAILS" onClose={() => setSelected(null)}>
      <p className="lpx-example-disclaimer">Example · Demonstration only</p>
      <h3>Role</h3><p>{selectedCard.role}</p>
      <h3>Example assignment</h3><p>{selectedCard.task}</p>
      <h3>Expected result</h3><p>{selectedCard.result}</p>
      <h3>{selectedCard.kind === 'task' ? 'Performed by' : 'Delegated by'}</h3>
      <p>{exampleCards.find(card => card.id === (selectedCard.ownerId ?? selectedCard.parentId))?.title ?? 'The user · main agent for this example'}</p>
    </DetailsPanel>}
  </>;
}
