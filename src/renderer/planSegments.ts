import type { PlanStep } from '../model';
/** One cell per task up to 20, then contiguous groups with proportional fill. */
export function planSegments(steps: PlanStep[]) {
  const count = Math.min(20, steps.length);
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor(index * steps.length / count);
    const end = Math.floor((index + 1) * steps.length / count);
    const group = steps.slice(start, end);
    const completed = group.filter(step => step.status === 'completed').length;
    const active = group.filter(step => step.status === 'in_progress').length;
    return { start, end, completed, active, total: group.length,
      title: group.length === 1 ? `${start + 1}. ${group[0].title} · ${group[0].status === 'in_progress' ? 'In progress' : group[0].status === 'completed' ? 'Completed' : 'Pending'}`
        : `Steps ${start + 1}–${end} · ${completed} complete · ${active} in progress`,
    };
  });
}
