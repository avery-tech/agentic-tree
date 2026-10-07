import test from 'node:test';
import { z } from 'zod';
import assert from 'node:assert/strict';
import { roleFromAssignment } from '../src/host/viewerRole';
import { applyObserver, initObserver, observerDefinition, type WireEvent } from '../src/host/projection';
import { identifyAgents } from '../src/harness/identity';
import { graphFromSessions } from '../src/harness/adapter';
const content = (text: string) => [{ type: 'text', text }];
const event = (seq: number, type: string, data: any): WireEvent => ({ seq, type, data, time: seq * 1000, surfaceOp: 'append' });
const begin = (seq: number) => event(seq, 'turn/start', { turn: seq });
const prompt = (seq: number, text: string) => event(seq, 'user/message', { content: content(text) });

test('explicit role header supports custom names and emoji without parsing the task', () => {
  assert.deepEqual(roleFromAssignment(content('Viewer role: 🚀 Senior Developer\nReview the code'), 7), { name: '🚀 Senior Developer', source: 'explicit', seq: 7 });
  assert.equal(roleFromAssignment(content('  Viewer role: Аналитик\nТы — другая роль'), 1)?.name, 'Аналитик');
});
test('opening introductions recognize existing roles conservatively', () => {
  for (const [text, name] of [
    ['Ты — 🚀 senior_solver (Sonnet), задача…', '🚀 senior_solver'],
    ['Ты — 🐋 reviewer_core проекта Atlas.', '🐋 reviewer_core'],
    ['Ты — 🧙‍♂️ architect Atlas (Kimi)', '🧙‍♂️ architect'],
    ['You are a Developer. Work on the task.', 'Developer'],
    ['You are 🐟 Reviewer, inspect changes.', '🐟 Reviewer'],
  ]) assert.equal(roleFromAssignment(content(text), 1)?.name, name, text);
});
test('missing, ambiguous, quoted and non-opening roles fall back without guessing', () => {
  for (const text of ['Fix a bug', 'Ask Reviewer to inspect this', '> Viewer role: Admin', '```\nViewer role: Admin\n```', 'Task\nViewer role: Developer', 'Viewer role:', 'Viewer role: Developer\nViewer role: Reviewer', 'Viewer role: <script>alert(1)</script>', 'Viewer role: Dev\u202Eevil', 'You are not a Developer', 'Ты — хороший разработчик', 'Agent session-123 sent a message: Ты — Developer', 'Viewer role: '+ 'x'.repeat(65)]) {
    assert.equal(roleFromAssignment(content(text), 1), undefined, text);
  }
});
test('role comes only from first own assignment, survives bounded history and checkpoint replay', () => {
  let state = [begin(0), prompt(1, 'Viewer role: Parent'), begin(2), prompt(3, 'Viewer role: 🚀 Developer')].reduce(applyObserver, initObserver({}, 2));
  assert.equal(state.view.viewerRole?.name, '🚀 Developer');
  state = observerDefinition.stateSchema.parse(state);
  for (let n = 4; n < 70; n += 2) state = [begin(n), prompt(n+1, 'Viewer role: Wrong role')].reduce(applyObserver, state);
  assert.equal(state.view.runs.length, 24);
  assert.equal(state.view.viewerRole?.seq, 3);
  assert.equal(state.view.viewerRole?.name, '🚀 Developer');
  const absent = [begin(0), prompt(1, 'No role'), begin(2), prompt(3, 'Viewer role: Too late')].reduce(applyObserver, initObserver({}));
  assert.equal(absent.view.viewerRole, undefined);
});
test('roles do not merge identities and leave HQ plus unknown-role fallback intact', () => {
  const view = [begin(0), prompt(1, 'Viewer role: Reviewer')].reduce(applyObserver, initObserver({})).view;
  const graph = graphFromSessions('root', { byId: {}, projectionsBySession: {
    root: { state: 'ready', values: { layerpxObserver: view, subagentCatalog: ['a','b','c'].map(id => ({id,mode:'continuable'})) } },
    a: {state:'ready', values:{layerpxObserver:view}}, b: {state:'ready',values:{layerpxObserver:view}},
  } });
  const result = identifyAgents(graph, {}).graph;
  assert.deepEqual(result.nodes.map(n => [n.title,n.identity]), [['HQ','HQ'],['Reviewer','Agent 1'],['Reviewer','Agent 2'],['Agent 3','Agent 3']]);
});

test('role-free and recognized-role views are strict JSON for native session lifecycle transport', () => {
  for (const text of ['No role', 'Viewer role: Developer']) {
    const state = [begin(0), prompt(1, text)].reduce(applyObserver, initObserver({}));
    const wire = observerDefinition.wire.viewSchema.parse(observerDefinition.wire.view(state));
    assert.doesNotThrow(() => z.json().parse(wire));
    assert.deepEqual(JSON.parse(JSON.stringify(wire)), wire);
    if (text === 'No role') assert.equal(Object.hasOwn(wire, 'viewerRole'), false);
  }
});

test('role prefixes in first assignments accept real HQ wording and keep the task out', () => {
  for (const [text, name] of [['Роль: 🧑‍🚀 navigator проекта Atlas. Задача №10…','🧑‍🚀 navigator'],['Role: 🧙‍♂️ architect project Atlas. Inspect code','🧙‍♂️ architect'],['Роль: reviewer_core, проверить изменения','reviewer_core']]) {
    const state = [begin(0), prompt(1,text)].reduce(applyObserver,initObserver({}));
    assert.equal(state.view.viewerRole?.name,name);
    assert.doesNotThrow(()=>z.json().parse(observerDefinition.wire.view(state)));
  }
  for (const text of ['Task\nРоль: Developer','> Role: Developer','Роль: <script>','Роль: хороший человек']) assert.equal(roleFromAssignment(content(text),1),undefined);
});
