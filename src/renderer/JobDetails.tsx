import { DetailsPanel } from './Details';
import { elapsed, type AgentNode } from '../model';
export function JobDetails({ node, now, frozen, onClose }: { node: AgentNode; now: number; frozen: boolean; onClose(): void }) {
  const job = node.job!;
  return <DetailsPanel label="BACKGROUND JOB" title={node.title} onClose={onClose}>
    <dl><dt>Status</dt><dd>{job.state}</dd><dt>Elapsed</dt><dd>{elapsed(node.start,node.end ?? (frozen ? node.lastEvent?.time : undefined),now)}</dd><dt>Owner session</dt><dd className="lpx-mono">{job.owner}</dd><dt>Job ID</dt><dd>{job.id}</dd><dt>Kind</dt><dd>{job.kind}</dd></dl>
    <h3>Command / task</h3><p>{node.task}</p>
    {job.detail && <><h3>Result</h3><p>{job.detail}</p></>}
    <h3>Output</h3>
    {frozen && <p role="status">Disconnected · last observed output.</p>}
    {job.outputError && <p role="alert">Output unavailable: {job.outputError}</p>}
    {job.gap && <p className="lpx-muted">Earlier output is not retained in this view.</p>}
    {job.output ? <div className="lpx-inspector"><pre>{job.output}</pre></div> : <p className="lpx-muted">{job.outputAvailable ? 'Waiting for retained output…' : 'No retained output.'}</p>}
    <p className="lpx-muted">Read-only observation. The owning agent can be Completed while this process is still running. Output times indicate when activity was observed; silence does not establish a stalled process.</p>
  </DetailsPanel>;
}
