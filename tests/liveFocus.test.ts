import test from 'node:test';
import assert from 'node:assert/strict';
import { liveCamera, liveFocusTarget } from '../src/renderer/liveFocus';
import { executionGraph } from '../src/harness/timeline';
import type { AgentNode } from '../src/model';
const node = (id: string, status: AgentNode['status'], time?: number): AgentNode => ({ id, parentId: 'hq', title: id, task: '', activity: '', status, dataState: 'ready', ...(time === undefined ? {} : { lastEvent: { time, seq: 1, label: 'Activity' } }) });
test('Live follows freshest running activity rather than the rightmost or newest completed run', () => {
 const a = node('a','Running',200), b = node('b','Running',100), c = node('c','Completed',300);
 assert.equal(liveFocusTarget([c,b,a])?.id,'a');
 assert.equal(liveFocusTarget([c,{...b,lastEvent:{time:210,seq:2,label:'New activity'}},a],'a')?.id,'b');
 assert.equal(liveFocusTarget([c,{...b,status:'Completed'},{...a,status:'Completed'}])?.id,'c');
});
test('ties are stable across catalog reorder; loading and unavailable observations cannot take focus', () => {
 const a=node('a','Running',100), b=node('b','Running',100);
 assert.equal(liveFocusTarget([a,b],'b')?.id,'b');
 assert.equal(liveFocusTarget([b,a],'b')?.id,'b');
 assert.equal(liveFocusTarget([b,a])?.id,'a');
 assert.equal(liveFocusTarget([{...a,dataState:'loading'},{...b,dataState:'error'}]),undefined);
 assert.equal(liveFocusTarget([]),undefined);
 assert.equal(liveFocusTarget([{...node('a','Completed'),end:300},{...node('b','Completed'),start:200}])?.id,'a');
});
test('repeated executions focus the live run, not its earlier card', () => {
 const agent = {...node('a','Running',300),observation:{lastSeq:3,runsTotal:2,callsTotal:0,calls:[],recent:[{seq:3,time:300,label:'Activity'}],runs:[{turn:1,seq:1,start:100,end:150,status:'Completed' as const,task:'Build'},{turn:2,seq:2,start:200,status:'Running' as const,task:'Fix'}]}};
 const graph=executionGraph({rootId:'hq',nodes:[agent],plan:{state:'absent',steps:[]},truncated:false});
 assert.equal(liveFocusTarget(graph.nodes)?.id,'a:run:2');
});
test('Live centers the whole card at exactly 56 percent and adapts to the details pane', () => {
 for (const size of [{width:1200,height:600},{width:810,height:600}]) {
  const position={x:3000,y:900}, card={width:330,height:182};
  const camera=liveCamera(position,card,size);
  assert.equal(camera.zoom,.56);
  assert.ok(Math.abs(camera.x+(position.x+card.width/2)*camera.zoom-size.width/2)<1e-9);
  assert.ok(Math.abs(camera.y+(position.y+card.height/2)*camera.zoom-size.height/2)<1e-9);
 }
});
