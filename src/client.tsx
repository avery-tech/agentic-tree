import { useJobs } from './harness/jobHooks';
import { attachJobs } from './harness/jobs';
import { JobDetails } from './renderer/JobDetails';
import { executionGraph } from './harness/timeline';
import { useEffect, useState } from 'react';
import { Tree } from './renderer/Tree';
import { Details } from './renderer/Details';
import { LayerPxTabLabel, PRODUCT_NAME, PRODUCT_SIGNATURE } from './renderer/Brand';
import { AgenticGuide } from './renderer/AgenticGuide';
import { readOnlyServices, type ViewerServices } from './harness/adapter';
import { useGraph, useSource } from './harness/hooks';
import flowCss from 'reactflow/dist/style.css';
import css from './renderer/style.css';

export const inject = ['slots', 'sessions', 'uiConversation', 'locale', 'connection', 'jobs'];
const NS = '@layerpx/harness-agent-viewer';
export function apply(ctx: any) {
  const services = readOnlyServices(ctx);
  ctx.effect(() => ctx.locale.register(NS, { en: { 'view.tree': PRODUCT_NAME }, zh: { 'view.tree': PRODUCT_NAME } }), 'layerpx-viewer: locale');
  const t = ctx.locale.bind(NS);
  const empty = Object.freeze({});
  ctx.uiConversation.views.register({ target: 'layerpx-tree', create: () => ({ replace: () => empty, apply: () => empty }) });
  ctx.slots.inject('conversation.view', () => ctx.slots.register({ name: 'conversation.view', id: 'layerpx-tree', order: 20, locale: NS, label: () => <LayerPxTabLabel title={t('view.tree')} />, inject: (sessionId: string) => ({ sessionId, services }) }, Viewer));
}
function Viewer({ sessionId, services }: { sessionId: string; services: ViewerServices }) {
  return <ViewerSession key={sessionId} sessionId={sessionId} services={services} />;
}
export function ViewerSession({ sessionId, services }: { sessionId: string; services: ViewerServices }) {
  const graph = useGraph(sessionId, services);
  const [mode, setMode] = useState<'tree' | 'timeline' | 'guide'>('timeline');
  const generation = useSource(services.generation);
  const [now, setNow] = useState(Date.now);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const connected = generation !== undefined;
  const jobs = useJobs(graph.nodes, services.jobs, connected, selected);
  const displayGraph = mode === 'timeline' ? attachJobs(executionGraph(graph), jobs.nodes) : graph;
  const node = displayGraph.nodes.find(n => n.id === selected);
  const active = graph.nodes.filter(n => n.status === 'Running').length;
  const activeJobs = jobs.nodes.filter(n => n.status === 'Running').length;
  return <div className="lpx-viewer">
    <style>{`@scope (.lpx-viewer) { ${flowCss} }`}{css}</style>
    <div className="lpx-toolbar"><div className="lpx-view-switch" aria-label="Agentic Tree views">{(['tree', 'timeline', 'guide'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => { setMode(value); setSelected(null); }}>{value === 'tree' ? 'Team' : value === 'timeline' ? 'Work' : 'Agentic Guide'}</button>)}</div>{mode === 'guide' ? <span>Example · Learning canvas</span> : <><span>{graph.nodes.length} agents · {active} agents running{jobs.nodes.length > 0 && ` · ${activeJobs} background ${activeJobs === 1 ? 'job' : 'jobs'} running`}</span><span className="lpx-toolbar-right">{connected ? 'Live' : 'Reconnecting · last observed state'}<span className={`lpx-live-dot ${connected ? 'is-live' : ''}`} /></span></>}</div>
    {mode !== 'guide' && !connected && <div role="status" className="lpx-banner">Connection unavailable. Agent states may be stale; timers are paused at the last recorded event.</div>}
    {mode !== 'guide' && graph.truncated && <div className="lpx-banner">Showing the first 1,000 agents in this session tree.</div>}
    {mode !== 'guide' && jobs.limited && <div className="lpx-banner">Background job coverage is limited to the first 64 agent sessions and 200 jobs.</div>}
    {mode !== 'guide' && jobs.outputLimited && <div className="lpx-banner">Live output follows up to 8 jobs. Select another job to inspect its output.</div>}
    <div className="lpx-body">{mode === 'guide' ? <AgenticGuide /> : <><Tree key={mode} mode={mode} graph={displayGraph} now={now} frozen={!connected} selected={selected} onSelect={setSelected} />{node && (node.job ? <JobDetails node={node} now={now} frozen={!connected} onClose={() => setSelected(null)} /> : <Details key={node.id} node={node} services={services} now={connected ? now : node.lastEvent?.time ?? now} onClose={() => setSelected(null)} />)}</>}</div>
    <footer className="lpx-footnote">{mode === 'guide' ? 'Example · Demonstration data · Pan to explore · Select a card for details' : mode === 'timeline' ? 'Earlier → Later · Connections show delegation or job ownership · Spacing not to scale · Latest 24 runs per agent' : 'Selected session and its descendants · Elapsed = current execution · Last event = recorded activity'} <span>{PRODUCT_SIGNATURE}</span></footer>
  </div>;
}
