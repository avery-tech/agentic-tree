import { useEffect, useMemo, useRef } from 'react';
import type { AgentNode } from '../model';
import { useSource } from './hooks';
import { JOB_CARD_LIMIT, JOB_OUTPUT_LIMIT, JOB_OWNER_LIMIT, ownedJobs, projectJobs, jobLive, type JobServices, type JobStamp } from './jobs';

export function useJobs(agents: AgentNode[], services: JobServices, connected: boolean, selected: string | null) {
  const snapshot = useSource(services.state);
  const ownersKey = JSON.stringify(agents.slice(0, JOB_OWNER_LIMIT).map(n => n.id));
  const owners = useMemo<string[]>(() => JSON.parse(ownersKey), [ownersKey]);
  // Reconcile references, without restarting every existing stream when one agent arrives.
  const watches = useRef(new Map<string, () => void>());
  useEffect(() => {
    const wanted = new Set(owners);
    for (const [id, release] of watches.current) if (!wanted.has(id)) { release(); watches.current.delete(id); }
    for (const id of owners) if (!watches.current.has(id)) watches.current.set(id, services.watchRows(id));
  }, [owners, services]);
  useEffect(() => () => { watches.current.forEach(release => release()); watches.current.clear(); }, [services]);
  const last = useRef(snapshot);
  if (connected) last.current = snapshot;
  const visible = connected ? snapshot : last.current;
  const allRows = useMemo(() => ownedJobs(visible, owners), [visible, owners]);
  const rows = allRows.slice(0, JOB_CARD_LIMIT);
  const wantedOutputs = rows.filter(row => jobLive(row)).slice(0, JOB_OUTPUT_LIMIT);
  const selectedRow = rows.find(row => `job:${row.owner}:${row.id}` === selected);
  if (selectedRow && !wantedOutputs.includes(selectedRow) && (jobLive(selectedRow) || selectedRow.output.total > 0)) wantedOutputs.push(selectedRow);
  const outputsKey = JSON.stringify(wantedOutputs.map(row => [row.owner!, row.id]));
  const outputs = useRef(new Map<string, () => void>());
  useEffect(() => {
    const wanted = new Map<string,string>((JSON.parse(outputsKey) as [string,string][]).map(([owner,id])=>[id,owner]));
    for (const [id, release] of outputs.current) if (!wanted.has(id)) { release(); outputs.current.delete(id); }
    for (const [id,owner] of wanted) if (!outputs.current.has(id)) outputs.current.set(id, services.observe(owner,id));
  }, [outputsKey, services]);
  useEffect(() => () => { outputs.current.forEach(release => release()); outputs.current.clear(); }, [services]);
  const cache = useRef(new Map<string,JobStamp>());
  const result = useMemo(() => { const next = projectJobs(allRows.slice(0,JOB_CARD_LIMIT), visible, cache.current, Date.now()); cache.current = next.stamps; return next.nodes; }, [allRows, visible]);
  return { nodes: result, limited: agents.length > JOB_OWNER_LIMIT || allRows.length > JOB_CARD_LIMIT,
    outputLimited: rows.filter(jobLive).length > JOB_OUTPUT_LIMIT };
}
