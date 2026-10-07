import test from 'node:test';
import assert from 'node:assert/strict';
import { executionGraph, layoutTimeline } from '../src/harness/timeline';
import { sessionTokens } from '../src/harness/usage';
import type { AgentNode, GraphSnapshot } from '../src/model';
const node = (id: string, parentId: string | null): AgentNode => ({ id, parentId, title:id, task:'', status:'Completed', activity:'', dataState:'ready' });
const graph: GraphSnapshot = {rootId:'hq',truncated:false,plan:{state:'absent',steps:[]}, nodes:[node('hq',null), {...node('a','hq'),status:'Running',tokens:700,observation:{lastSeq:9,runsTotal:2,callsTotal:0,calls:[],recent:[],runs:[{turn:1,seq:1,start:60000,end:90000,status:'Completed',task:'Build'},{turn:2,seq:5,start:180000,status:'Running',task:'Fix'}]}}, {...node('b','hq'),start:61000}]};
test('timeline preserves session identity and does not mark earlier runs live',()=>{
 const view=executionGraph(graph); const a=view.nodes.filter(n=>n.sessionId==='a');
 assert.equal(a.length,2); assert.deepEqual(a.map(n=>n.status),['Completed','Running']);
 assert.deepEqual(a.map(n=>n.task),['Build','Fix']); assert.notEqual(a[0].id,a[1].id);
 assert.equal(a[0].parentId,'hq'); assert.equal(a[0].tokens,700);
 assert.equal(graph.nodes.length,3);
 const cold=executionGraph({...graph,nodes:graph.nodes.map(n=>({...n,status:'Unknown'}))});
 assert.equal(cold.nodes.at(2)?.status,'Unknown');
});
test('chronology shares minute columns, keeps repeated agent lane, and places unknown starts last',()=>{
 const nodes=executionGraph(graph).nodes.concat(node('unknown','hq'));
 const pos=layoutTimeline(nodes,330); const p=(id:string)=>pos.find(n=>n.id===id)!;
 assert.equal(p('a:run:1').x,p('b').x);
 assert.ok(p('a:run:5').x>p('a:run:1').x);
 assert.equal(p('a:run:1').y,p('a:run:5').y);
 assert.ok(p('unknown').x>p('a:run:5').x);
});
test('two starts in one minute on the same agent never overlap or reverse later starts',()=>{
 const nodes=[node('hq',null),{...node('a1','hq'),sessionId:'a',start:60000},{...node('a2','hq'),sessionId:'a',start:61000},{...node('b','hq'),start:62000}];
 const pos=layoutTimeline(nodes,330);
 assert.ok(pos[2].x>pos[1].x); assert.ok(pos[3].x>=pos[2].x);
});
test('native token buckets are disjoint, missing and invalid usage stay unknown',()=>{
 assert.equal(sessionTokens({uncachedInputTokens:100,outputTokens:20,cacheReadTokens:300,cacheWriteTokens:40}),460);
 assert.equal(sessionTokens({uncachedInputTokens:0,outputTokens:0,cacheReadTokens:0,cacheWriteTokens:0}),0);
 for (const value of [undefined,{}, {uncachedInputTokens:1}, {uncachedInputTokens:-1,outputTokens:0,cacheReadTokens:0,cacheWriteTokens:0}]) assert.equal(sessionTokens(value),undefined);
});
