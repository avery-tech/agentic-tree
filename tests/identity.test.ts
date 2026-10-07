import test from 'node:test';
import assert from 'node:assert/strict';
import { graphFromSessions } from '../src/harness/adapter';
import { identifyAgents, readAgentNumbers, saveAgentNumbers, type IdentityStorage } from '../src/harness/identity';

function graph(children: string[]) {
  return graphFromSessions('root', { byId: { root: { title: 'Project review' } }, projectionsBySession: {
    root: { state: 'ready', values: { agentPreset: 'shared-preset', subagentCatalog: children.map(id => ({ id, label: `Task for ${id}`, mode: 'continuable' })) } },
  } });
}
test('identities stay fixed across catalog reorder, late descendants and temporarily missing agents', () => {
  const first = identifyAgents(graph(['b', 'a']), {});
  assert.deepEqual(first.numbers, { a: 1, b: 2 });
  assert.equal(first.graph.nodes[0].title, 'HQ');
  const later = identifyAgents(graph(['b', 'new', 'a']), first.numbers);
  assert.deepEqual(later.numbers, { a: 1, b: 2, new: 3 });
  const missing = identifyAgents(graph(['b']), later.numbers);
  assert.strictEqual(missing.numbers, later.numbers);
  assert.equal(missing.graph.nodes[1].title, 'Agent 2');
  assert.equal(identifyAgents(graph(['a']), missing.numbers).graph.nodes[1].title, 'Agent 1');
  assert.deepEqual(identifyAgents(graph(['b']), {}).numbers, { b: 1 });
});
test('viewer identity persists locally, validates storage and survives unavailable storage', () => {
  const data = new Map<string, string>();
  const storage: IdentityStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } };
  saveAgentNumbers('saved-root', { a: 3, b: 8 }, storage);
  const encoded = [...data.values()][0];
  assert.deepEqual(readAgentNumbers('fresh-load', { ...storage, getItem: () => encoded }), { a: 3, b: 8 });
  assert.deepEqual(readAgentNumbers('other-root', storage), {});
  for (const invalid of ['oops', 'null', '[]', '{"a":1,"b":1}', '{"a":-1}', '{"a":"2"}']) {
    assert.deepEqual(readAgentNumbers('invalid-root', { ...storage, getItem: () => invalid }), {});
  }
  const blocked: IdentityStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  saveAgentNumbers('memory-root', { x: 1 }, blocked);
  assert.deepEqual(readAgentNumbers('memory-root', blocked), { x: 1 });
});
test('assignment label stays separate from shared preset and latest system notification', () => {
  const source = graphFromSessions('root', { byId: { root: { title: 'Project review' } }, projectionsBySession: {
    root: { state: 'ready', values: { subagentCatalog: [{ id: 'child', label: 'Review contract', mode: 'continuable' }] } },
    child: { state: 'ready', values: { agentPreset: 'shared-preset', layerpxObserver: { role: 'shared-preset', runs: [{ task: 'Agent session-xyz sent a message', status: 'Completed' }], calls: [] } } },
  } });
  const result = identifyAgents(source, {}).graph;
  assert.equal(result.nodes[0].assignmentTitle, 'Project review');
  assert.equal(result.nodes[1].title, 'Agent 1');
  assert.equal(result.nodes[1].assignmentTitle, 'Review contract');
  assert.equal(result.nodes[1].role, 'shared-preset');
  assert.equal(result.nodes[1].task, 'Agent session-xyz sent a message');
});
