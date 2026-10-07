import type { GraphSnapshot } from '../model';

export type AgentNumbers = Record<string, number>;
const PREFIX = '@layerpx/harness-agent-viewer:agent-numbers:v1:';
const memory = new Map<string, AgentNumbers>();
export interface IdentityStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
function browserStorage(): IdentityStorage | undefined {
  try { return globalThis.localStorage; } catch { return undefined; }
}
/** Viewer-only aliases, scoped to the selected root. No session data is written. */
export function readAgentNumbers(rootId: string, storage = browserStorage()): AgentNumbers {
  if (memory.has(rootId)) return memory.get(rootId)!;
  try {
    const value: unknown = JSON.parse(storage?.getItem(PREFIX + rootId) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const entries = Object.entries(value);
    if (entries.some(([, n]) => !Number.isSafeInteger(n) || n <= 0 || n >= Number.MAX_SAFE_INTEGER) || new Set(entries.map(([, n]) => n)).size !== entries.length) return {};
    return Object.fromEntries(entries) as AgentNumbers;
  } catch { return {}; }
}
export function saveAgentNumbers(rootId: string, numbers: AgentNumbers, storage = browserStorage()) {
  memory.set(rootId, numbers);
  try { storage?.setItem(PREFIX + rootId, JSON.stringify(numbers)); } catch { /* Keep stable aliases in memory when local storage is unavailable. */ }
}
/** Never recycle or renumber aliases when catalogs load late, reorder or lose an entry. */
export function identifyAgents(graph: GraphSnapshot, previous: AgentNumbers) {
  let numbers = previous;
  let next = Math.max(0, ...Object.values(previous)) + 1;
  const missing = graph.nodes.filter(n => n.id !== graph.rootId && !Object.hasOwn(previous, n.id))
    .sort((a, b) => (a.createdAt ?? Infinity) - (b.createdAt ?? Infinity) || a.id.localeCompare(b.id));
  if (missing.length) {
    numbers = { ...previous };
    for (const node of missing) Object.defineProperty(numbers, node.id, { value: next++, enumerable: true, writable: true, configurable: true });
  }
  return { numbers, graph: { ...graph, nodes: graph.nodes.map(node => {
    const identity = node.id === graph.rootId ? 'HQ' : `Agent ${numbers[node.id]}`;
    return { ...node, identity, title: node.id !== graph.rootId && node.viewerRole ? node.viewerRole.name : identity };
  }) } };
}
