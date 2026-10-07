import { useState, type ReactNode } from 'react';
import { elapsed, type AgentNode } from '../model';
import { useHistory, useSource } from '../harness/hooks';
import type { HistorySession, ViewerServices } from '../harness/adapter';

export function DetailsPanel({ title, label = 'AGENT DETAILS', onClose, children }: { title: string; label?: string; onClose(): void; children: ReactNode }) {
  return <aside className="lpx-details" aria-label={label === 'AGENT DETAILS' ? 'Agent details' : label === 'BACKGROUND JOB' ? 'Background job details' : 'Example details'}>
    <header><div><small>{label}</small><h2>{title}</h2></div><button onClick={onClose} aria-label="Close details">×</button></header>
    {children}
  </aside>;
}

export function Details({ node, services, now, onClose }: { node: AgentNode; services: ViewerServices; now: number; onClose(): void }) {
  const history = useHistory(node.sessionId ?? node.id, services);
  return <DetailsPanel title={node.title} onClose={onClose}>
    <dl><dt>Identity</dt><dd>{node.identity ?? node.title}</dd><dt>Display name</dt><dd>{node.title}</dd><dt>Assignment title</dt><dd>{node.assignmentTitle ?? node.label ?? 'Not recorded'}</dd><dt>Preset</dt><dd>{node.role ?? 'Not recorded'}</dd><dt>Model</dt><dd>{node.model ?? 'Not recorded'}</dd><dt>Status</dt><dd>{node.status}</dd><dt>Elapsed</dt><dd>{elapsed(node.start, node.end ?? (node.status !== 'Running' ? node.lastEvent?.time : undefined), now)}</dd><dt>Tokens (session)</dt><dd>{node.tokens === undefined ? 'Not reported' : node.tokens.toLocaleString('en-GB')}</dd>{node.executionTurn !== undefined && <><dt>Selected run</dt><dd>{node.executionTurn}</dd></>}<dt>Session</dt><dd className="lpx-mono">{node.sessionId ?? node.id}</dd><dt>Parent</dt><dd className="lpx-mono">{node.parentId ?? 'Selected session'}</dd></dl>
    {node.viewerRole && <p className="lpx-muted">Viewer role: {node.viewerRole.name}. Source: {node.viewerRole.source === 'explicit' ? 'Viewer role header' : 'Opening role declaration'} in initial assignment (event #{node.viewerRole.seq}). This is a display label, not verified permissions or duties.</p>}
    <h3>{node.executionTurn === undefined ? 'Current assignment' : 'Run assignment'}</h3><p>{node.task}</p>
    <h3>{node.executionTurn === undefined ? 'Latest activity' : 'Run activity'}</h3><p>{node.activity}</p><p className="lpx-muted">Last recorded event {node.lastEvent ? `${elapsed(node.lastEvent.time, undefined, now)} ago` : 'unavailable'}. A quiet event stream does not establish that an agent is stuck.</p>
    {node.dataState === 'error' && <p role="alert">{node.dataError ?? 'Observation unavailable'}</p>}
    {history.error && <p role="alert">History unavailable: {history.error}</p>}
    {!history.error && !history.session && <p>Loading history…</p>}
    {history.session && <History node={node} session={history.session} now={now} />}
  </DetailsPanel>;
}
function History({ node, session, now }: { node: AgentNode; session: HistorySession; now: number }) {
  const journal = useSource(session.eventSource);
  const state = useSource(session);
  const [rawSeq, setRawSeq] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const entries = journal.entries.filter(e => e.type === 'event');
  const raw = entries.find(e => e.event.seq === rawSeq)?.event;
  const inspect = async (seq: number) => {
    setRawSeq(seq); setError(''); setLoading(true);
    try { await session.loadThrough(seq); } catch (e) { setError(String(e)); } finally { setLoading(false); }
  };
  const view = node.observation;
  return <>
    {state.openError && <p role="alert">{state.openError.message}</p>}
    <h3>Executions <span>{view?.runsTotal ?? 0}</span></h3>
    {view && view.runsTotal > view.runs.length && <p className="lpx-muted">Showing the latest {view.runs.length} executions. Earlier events remain in session history.</p>}
    <div className="lpx-history-list">{view?.runs.slice().reverse().map(run => <section key={run.seq} className="lpx-run"><div><strong>Run {run.turn}</strong><span>{run.status} · {elapsed(run.start, run.end ?? (node.status !== 'Running' ? node.lastEvent?.time : undefined), now)}</span></div><p>{run.task || 'No assignment recorded'}</p>{run.resultPreview && <p className="lpx-result">{run.resultPreview}</p>}<div>{run.promptSeq !== undefined && <button onClick={() => void inspect(run.promptSeq!)}>Task details</button>}{run.resultSeq !== undefined && <button onClick={() => void inspect(run.resultSeq!)}>Result</button>}</div></section>)}</div>
    <h3>Tool calls <span>{view?.callsTotal ?? 0}</span></h3>
    {view && view.callsTotal > view.calls.length && <p className="lpx-muted">Showing the latest {view.calls.length} calls.</p>}
    <div className="lpx-history-list">{view?.calls.slice().reverse().map(call => <section key={call.seq} className="lpx-call"><div><strong>{call.name}</strong><span>{call.status}</span></div><div><span>{elapsed(call.start, call.end ?? (node.status !== 'Running' ? node.lastEvent?.time : undefined), now)}</span><button onClick={() => void inspect(call.seq)}>Input</button>{call.resultSeq !== undefined && <button onClick={() => void inspect(call.resultSeq!)}>Result</button>}</div></section>)}</div>
    <h3>Recent events</h3><ol className="lpx-recent">{view?.recent.slice().reverse().map(event => <li key={event.seq}><button onClick={() => void inspect(event.seq)}>{event.label}</button><time>{new Date(event.time).toLocaleTimeString('en-GB')}</time></li>)}</ol>
    {rawSeq !== null && <section className="lpx-inspector"><div><h3>Event #{rawSeq}</h3><button onClick={() => setRawSeq(null)}>Close event</button></div>{error ? <p role="alert">{error}</p> : raw ? <pre>{JSON.stringify(raw.data, null, 2).slice(0, 100000)}</pre> : <p>{loading ? 'Loading event…' : 'Event unavailable in retained history.'}</p>}{raw && JSON.stringify(raw.data).length > 100000 && <p>Preview limited to 100,000 characters.</p>}</section>}
    {journal.hasMore && <button disabled={state.loadingOlder} onClick={() => void session.loadOlder().catch(e => setError(String(e)))}>{state.loadingOlder ? 'Loading…' : 'Load older events'}</button>}
    <details><summary>Loaded session events ({entries.length})</summary><ol className="lpx-recent">{entries.slice().reverse().map(({ event }) => <li key={event.seq}><button onClick={() => void inspect(event.seq)}>#{event.seq} {event.type}</button></li>)}</ol></details>
  </>;
}
