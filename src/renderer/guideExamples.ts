/** Static teaching data. These identifiers never enter Harness session services. */
export type ExampleCard = {
  id: string; section: string; kind: 'agent' | 'task'; title: string; role: string;
  task: string; result: string; parentId?: string; ownerId?: string;
  x: number; y: number; width: number; root?: boolean;
};
export type ExampleSection = {
  id: string; title: string; number: string; color: string; y: number; height: number;
  commentY: number; when: string; why: string; limit: string;
  article?: { title: string; url: string };
};
export const sections: ExampleSection[] = [
  { id: 'chat', title: 'Simple Chat', number: '01', color: '#d6ecff', y: 0, height: 380, commentY: 245,
    when: 'A small, well-scoped request.', why: 'One agent explores, makes the change and checks it in order.', limit: 'Self-checking shares the same blind spots. Add a reviewer when the risk warrants it.' },
  { id: 'duo', title: 'Duo', number: '02', color: '#cef1dc', y: 490, height: 380, commentY: 735,
    when: 'A change benefits from an independent check.', why: 'The developer delegates review with the original criteria and the actual change.', limit: 'The developer addresses findings; a reviewer does not replace the owner’s acceptance.' },
  { id: 'startup', title: 'Startup', number: '03', color: '#eadfff', y: 980, height: 790, commentY: 1625,
    when: 'A feature has separable UI and API work.', why: 'HQ coordinates two developers and a reviewer. The API developer delegates a design question to an architect.', limit: 'Agree interfaces and file ownership first. The reviewer checks results once they are ready.' },
];
export const exampleCards: ExampleCard[] = [
  { id: 'chat-agent', section: 'chat', kind: 'agent', title: 'Main agent', role: 'One general-purpose agent owns the whole request.', task: 'Add a clear empty state to a task list.', result: 'A small change, checks performed and a summary of known limits.', x: 220, y: 40, width: 330, root: true },
  { id: 'chat-explore', section: 'chat', kind: 'task', title: '01 · Explore', role: 'First task of the same Main agent.', task: 'Inspect the list and its requirements.', result: 'A scoped plan and acceptance criteria.', ownerId: 'chat-agent', x: 610, y: 40, width: 200 },
  { id: 'chat-build', section: 'chat', kind: 'task', title: '02 · Build', role: 'Second task of the same Main agent.', task: 'Implement the empty state.', result: 'A focused change consistent with existing UI.', ownerId: 'chat-agent', x: 865, y: 40, width: 200 },
  { id: 'chat-check', section: 'chat', kind: 'task', title: '03 · Check', role: 'Third task of the same Main agent.', task: 'Check behavior and report back.', result: 'Verification evidence and anything left untested.', ownerId: 'chat-agent', x: 1120, y: 40, width: 200 },
  { id: 'duo-developer', section: 'duo', kind: 'agent', title: 'Developer', role: 'Main agent for this request; implements and delegates review.', task: 'Fix a form validation bug, then ask for an independent review.', result: 'A tested fix with reviewer findings addressed or clearly listed.', x: 220, y: 530, width: 330, root: true },
  { id: 'duo-reviewer', section: 'duo', kind: 'agent', title: 'Reviewer', role: 'Child agent delegated by the developer; checks against the original criteria.', task: 'Inspect the change and test invalid, valid and empty input.', result: 'Specific findings with evidence, severity and unverified cases.', parentId: 'duo-developer', x: 700, y: 530, width: 330 },
  { id: 'startup-hq', section: 'startup', kind: 'agent', title: 'HQ (Main agent)', role: 'Receives the owner’s request, delegates work and combines results.', task: 'Coordinate a small product feature with UI, API and independent review.', result: 'An integrated result, review findings and decisions for the owner.', x: 220, y: 1240, width: 330, root: true },
  { id: 'startup-ui', section: 'startup', kind: 'agent', title: 'UI developer', role: 'Owns the interface branch; reports to HQ.', task: 'Build a task-list screen using the agreed API contract.', result: 'UI changes with loading, empty and error states checked.', parentId: 'startup-hq', x: 700, y: 1020, width: 330 },
  { id: 'startup-api', section: 'startup', kind: 'agent', title: 'API developer', role: 'Owns the API branch; delegates a bounded design question.', task: 'Implement the task endpoint. Ask the architect to check its data contract.', result: 'An endpoint, contract tests and any remaining integration constraints.', parentId: 'startup-hq', x: 700, y: 1240, width: 330 },
  { id: 'startup-reviewer', section: 'startup', kind: 'agent', title: 'Reviewer', role: 'Reports directly to HQ and reviews both developers’ results.', task: 'Check the feature against the original criteria once implementation is ready.', result: 'A cross-branch review with reproducible findings and verification limits.', parentId: 'startup-hq', x: 700, y: 1460, width: 330 },
  { id: 'startup-architect', section: 'startup', kind: 'agent', title: 'Architect', role: 'Child of the API developer; advises on a specific design question.', task: 'Check data ownership, endpoint shape and failure cases before implementation.', result: 'A short contract recommendation with tradeoffs and unresolved questions.', parentId: 'startup-api', x: 1180, y: 1240, width: 330 },
];
export const exampleConnections = [
  { source: 'chat-agent', target: 'chat-explore', kind: 'sequence' as const },
  { source: 'chat-explore', target: 'chat-build', kind: 'sequence' as const },
  { source: 'chat-build', target: 'chat-check', kind: 'sequence' as const },
  ...exampleCards.filter(card => card.parentId).map(card => ({ source: card.parentId!, target: card.id, kind: 'delegation' as const })),
];
