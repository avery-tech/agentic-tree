import type { SessionPlan } from '../model';

/** Native rc.2 `todos` projection. Never infer work units from agents or tools. */
export function planFromProjection(values: Record<string, unknown>, state?: string): SessionPlan {
  const todos = values.todos;
  if (todos === null || (Array.isArray(todos) && todos.length === 0)) return { state: 'absent', steps: [] };
  if (todos === undefined) return { state: state === 'error' || state === 'ready' ? 'unavailable' : 'loading', steps: [] };
  if (!Array.isArray(todos) || todos.some(item => !item || typeof item.content !== 'string' || !item.content.trim() || !['pending', 'in_progress', 'completed'].includes(item.status))) {
    return { state: 'unavailable', steps: [] };
  }
  return { state: 'ready', steps: todos.map(item => ({ title: item.content, status: item.status })) };
}
