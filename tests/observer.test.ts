import test from 'node:test';
import assert from 'node:assert/strict';
import { applyObserver, initObserver, LIMITS, observerDefinition, type WireEvent } from '../src/host/projection';
import { graphFromSessions, readOnlyServices, type SessionList } from '../src/harness/adapter';
import { elapsed } from '../src/model';
const event = (seq: number, type: string, data: any, extra: Partial<WireEvent> = {}): WireEvent => ({ seq, type, time: 1000 + seq * 1000, data, ...extra });
const fold = (events: WireEvent[], inherited = 0) => events.reduce(applyObserver, initObserver({}, inherited));
const start = event(0, 'turn/start', { turn: 1 });
const prompt = event(1, 'user/message', { id: 'm1', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'Check the asset path' }] }, { surfaceOp: 'append' });
const call = event(2, 'tool/call', { turn: 1, step: 1, callId: 'c1', name: 'shell', arguments: { command: 'verify' } });
const result = event(3, 'tool/result', { turn: 1, step: 1, message: { source: { kind: 'tool', callId: 'c1' }, toolCallId: 'c1', isError: true } }, { surfaceOp: 'append' });
const end = event(4, 'turn/end', { turn: 1, reason: { kind: 'completed' } });
test('replays rc.2 flat user messages and distinguishes tool failure from successful turn', () => {
  const state = fold([start, prompt, call, result, end]);
  assert.equal(state.view.runs[0].task, 'Check the asset path');
  assert.equal(state.view.runs[0].status, 'Completed');
  assert.equal(state.view.calls[0].status, 'Error');
  assert.equal(state.view.calls[0].end, result.time);
  assert.equal(state.view.calls[0].resultSeq, 3);
  assert.equal(observerDefinition.stateSchema.safeParse(state).success, true);
});
test('ignores inherited parent work, duplicates and content-only replacements', () => {
  const own = event(5, 'turn/start', { turn: 2 });
  let state = fold([start, prompt, call, result, end, own], 5);
  assert.equal(state.view.runs.length, 1);
  assert.equal(state.view.calls.length, 0);
  assert.equal(applyObserver(state, own), state);
  const replacement = event(6, 'user/message', prompt.data, { surfaceOp: { op: 'replace', startSeq: 1, endSeq: 1 } });
  assert.equal(applyObserver(state, replacement), state);
});
test('same agent receives new executions without erasing previous assignment', () => {
  const state = fold([start, prompt, end, event(5, 'turn/start', { turn: 2 }), event(6, 'user/message', { ...prompt.data, content: [{ type: 'text', text: 'Review changes' }] }, { surfaceOp: 'append' })]);
  assert.deepEqual(state.view.runs.map(r => r.task), ['Check the asset path', 'Review changes']);
});
test('terminal reasons and interrupted tools remain honest', () => {
  for (const [kind, status] of [['error', 'Error'], ['blocked', 'Blocked'], ['aborted', 'Cancelled'], ['restart', 'Unknown']]) {
    const state = fold([start, call, event(3, 'turn/end', { turn: 1, reason: { kind } })]);
    assert.equal(state.view.runs[0].status, status);
    assert.equal(state.view.calls[0].status, kind === 'aborted' ? 'Cancelled' : 'Unknown');
  }
});
test('wire state is bounded and checkpoint replay matches uninterrupted fold', () => {
  const events = [start, ...Array.from({length:200}, (_, i) => event(i + 1, 'tool/call', { turn:1, step:1, callId:`c${i}`, name:'check' }))];
  const checkpoint = observerDefinition.stateSchema.parse(fold(events.slice(0, 100)));
  assert.deepEqual(events.slice(100).reduce(applyObserver, checkpoint), fold(events));
  assert.equal(fold(events).view.calls.length, LIMITS.calls);
  assert.equal(fold(events).view.recent.length, LIMITS.recent);
  assert.equal(fold(events).view.callsTotal, 200);
});
test('role, explicit label, and actual request model remain separate', () => {
  const view = fold([event(0, 'agent-preset/selected', {agentPreset:'Reviewer'}), event(1,'subagent/descriptor',{label:'Review contract'}), event(2,'request/header',{header:{config:{provider:'deepseek',model:'v4'}}})]).view;
  assert.deepEqual([view.role,view.label,view.model], ['Reviewer','Review contract','v4']);
});
test('graph includes only direct catalog descendants and terminates cycles', () => {
  const state = fold([start,prompt,call,result,end]);
  const list: SessionList = {byId:{root:{running:false},child:{running:true},unrelated:{running:true}},projectionsBySession:{
    root:{state:'ready',values:{layerpxObserver:state.view,subagentCatalog:[{id:'child',mode:'continuable',label:'Developer'}]}},
    child:{state:'ready',values:{layerpxObserver:state.view,subagentCatalog:[{id:'root',mode:'continuable'}]}},
    unrelated:{state:'ready',values:{layerpxObserver:state.view}},
  }};
  const graph = graphFromSessions('root',list);
  assert.deepEqual(graph.nodes.map(n=>[n.id,n.parentId]),[['root',null],['child','root']]);
  assert.equal(graph.nodes[1].status,'Running');
  assert.equal(graphFromSessions('child',list).nodes[0].id,'child');
});
test('durable open turn is not proof that an agent is currently running',()=>{
  const graph=graphFromSessions('root',{byId:{root:{running:false}},projectionsBySession:{root:{state:'ready',values:{layerpxObserver:fold([start]).view}}}});
  assert.equal(graph.nodes[0].status,'Unknown');
});
test('viewer capability boundary exposes no orchestration commands',()=>{
  const services=readOnlyServices({sessions:{list:{}},connection:{state:{},generation:{}},jobs:{state:{},kill(){throw new Error('must not escape')}}});
  assert.deepEqual(Object.keys(services.jobs).sort(),['observe','state','watchRows']);
  assert.deepEqual(Object.keys(services).sort(),['connection','generation','history','jobs','list','refreshProjections']);
});
test('timers clamp negatives and freeze completed durations',()=>{
  assert.equal(elapsed(1000,61000,999999),'01:00');
  assert.equal(elapsed(5000,1000,999999),'00:00');
  assert.equal(elapsed(undefined,undefined,100),'—');
});
test('identical tool call ids in different steps correlate to their own result',()=>{
  const state=fold([start,call,result,event(4,'tool/call',{turn:1,step:2,callId:'c1',name:'second'}),event(5,'tool/result',{turn:1,step:2,message:{source:{callId:'c1'},isError:false}},{surfaceOp:'append'})]);
  assert.equal(state.view.calls[0].status,'Error');
  assert.equal(state.view.calls[0].resultSeq,3);
  assert.equal(state.view.calls[1].status,'Completed');
  assert.equal(state.view.calls[1].resultSeq,5);
});
