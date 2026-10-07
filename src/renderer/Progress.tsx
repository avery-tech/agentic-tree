import { useId, useMemo } from 'react';
import type { SessionPlan } from '../model';
import { planSegments } from './planSegments';

const statusLabels = { pending: 'Pending', in_progress: 'In progress', completed: 'Completed' };
export function Progress({ plan, frozen }: { plan: SessionPlan; frozen: boolean }) {
  const id = useId();
  const segments = useMemo(() => planSegments(plan.steps), [plan.steps]);
  const completed = plan.steps.filter(step => step.status === 'completed').length;
  const active = plan.steps.filter(step => step.status === 'in_progress').length;
  const total = plan.steps.length;
  const ready = plan.state === 'ready' && total > 0;
  const label = ready ? `${completed} / ${total} complete` : plan.state === 'loading' ? 'Loading plan…' : plan.state === 'unavailable' ? 'Plan unavailable' : 'No plan yet';
  return <details className="lpx-progress nodrag nopan" onKeyDown={event => {
    if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); }
  }}>
    <summary aria-label={`Task progress: ${label}`} aria-controls={id}>
      <svg className="lpx-sprout" width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 14V7.6M8 7.6C8 4.8 5.8 2.6 3 2.6c0 2.8 2.2 5 5 5zM8 9.4c0-2.2 1.8-4 4-4 0 2.2-1.8 4-4 4z" /></svg>
      <span className="lpx-progress-label">{label}</span>
      {ready && <span className="lpx-progress-cells" role="progressbar" aria-label="Completed plan steps" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} aria-valuetext={`${completed} of ${total} steps completed, ${active} in progress${frozen ? ', last observed' : ''}`}>
        {segments.map(segment => <span key={segment.start} className={`lpx-progress-cell${segment.active ? ' is-active' : ''}`} title={segment.title} style={{ backgroundImage: `linear-gradient(to right, var(--lpx-lime) ${segment.completed / segment.total * 100}%, transparent ${segment.completed / segment.total * 100}%)` }} />)}
      </span>}
    </summary>
    <section id={id} className="lpx-plan-panel" aria-label="Current task plan">
      <header><strong>Task plan</strong><span>{ready ? `${completed} complete · ${total - completed} remaining` : label}</span></header>
      <p className="lpx-plan-note">Selected session’s recorded checklist{frozen ? ' · connection unavailable' : ''}.</p>
      {ready ? <><ol>{plan.steps.map((step, index) => <li key={`${index}:${step.title}`} data-step-status={step.status}>
        <span className="lpx-plan-symbol" aria-hidden="true">{step.status === 'completed' ? '✓' : step.status === 'in_progress' ? '◉' : index + 1}</span><span>{step.title}</span><small>{statusLabels[step.status]}</small>
      </li>)}</ol>{total > 20 && <p className="lpx-plan-note">Bar cells group consecutive steps. Fill shows completed steps within each group.</p>}<p className="lpx-plan-note">Progress counts planned steps, not remaining time. The total can change when the plan is updated.</p></> : <p className="lpx-plan-empty">{plan.state === 'loading' ? 'Waiting for session data.' : plan.state === 'unavailable' ? 'The session’s task list could not be read.' : 'No structured task list has been recorded for this execution yet.'}</p>}
    </section>
  </details>;
}
