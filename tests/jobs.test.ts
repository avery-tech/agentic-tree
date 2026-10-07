import test from 'node:test';
import assert from 'node:assert/strict';
import { ownedJobs, projectJobs, attachJobs, type JobRow, type JobsSnapshot } from '../src/harness/jobs';
import { liveFocusTarget } from '../src/renderer/liveFocus';
import { focusDelay } from '../src/renderer/useLiveFocus';
import { layoutTimeline } from '../src/harness/timeline';
import type { AgentNode, GraphSnapshot } from '../src/model';
const row: JobRow = {id:'bash-1',owner:'hq',kind:'bash',label:'npm test',status:'running',startedAt:100,output:{total:0,earliest:0}};
const snapshot: JobsSnapshot = {rows:{hq:[row]},observed:{}};
const agent: AgentNode = {id:'hq',parentId:null,title:'HQ',task:'Build',activity:'Done',status:'Completed',dataState:'ready',start:1,end:90,lastEvent:{seq:1,time:90,label:'Done'}};
const graph: GraphSnapshot = {rootId:'hq',nodes:[agent],truncated:false,plan:{state:'absent',steps:[]}};
test('job roster excludes global and foreign work, deduplicates and prioritizes live jobs',()=>{
 const foreign={...row,id:'foreign',owner:'other'},unowned={...row,id:'global',owner:undefined};
 const data={rows:{hq:[unowned,foreign,{...row,id:'done',status:'completed' as const},row,row]},observed:{}};
 assert.deepEqual(ownedJobs(data,['hq']).map(r=>r.id),['bash-1','done']);
 assert.deepEqual(ownedJobs(data,['another']),[]);
});
test('a background process stays Running without changing its Completed owner',()=>{
 const jobs=projectJobs([row],snapshot,new Map(),1000);
 const result=attachJobs(graph,jobs.nodes);
 assert.equal(result.nodes[0].status,'Completed');
 assert.equal(result.nodes[1].status,'Running');
 assert.equal(result.nodes[1].parentId,'hq');
 assert.equal(liveFocusTarget(result.nodes)?.job?.id,'bash-1');
 assert.equal(jobs.nodes[0].lastEvent?.time,100,'reopening old job is not fresh activity');
});
test('retained output and timer ticks are not new activity; output advances observed time',()=>{
 const first=projectJobs([row],snapshot,new Map(),1000);
 const output={jobId:row.id,text:'Retained line\n',gapBefore:false,streaming:true};
 const opened={...snapshot,observed:{[row.id]:output}};
 const second=projectJobs([row],opened,first.stamps,2000);
 assert.equal(second.nodes[0].lastEvent?.time,100);
 const tick=projectJobs([row],opened,second.stamps,2500);
 assert.equal(tick.nodes[0].lastEvent?.seq,0);
 const changed={...opened,observed:{[row.id]:{...output,text:'Retained line\nNew output\n'}}};
 const third=projectJobs([row],changed,second.stamps,3000);
 assert.equal(third.nodes[0].lastEvent?.time,3000);
 assert.equal(third.nodes[0].activity,'New output');
 assert.equal(third.nodes[0].lastEvent?.seq,1);
});
test('job outcomes and stopping remain distinct from agent outcomes',()=>{
 for (const [state,status] of [['stopping','Running'],['completed','Completed'],['failed','Error'],['killed','Cancelled']] as const) {
  const [node]=projectJobs([{...row,status:state,finishedAt:state==='stopping'?undefined:200}],snapshot,new Map(),9999).nodes;
  assert.equal(node.status,status);assert.equal(node.job?.state,state);
  if(state!=='stopping')assert.equal(node.lastEvent?.time,200);
 }
});
test('failed output observation does not fail the job and retention loss is explicit',()=>{
 const output={jobId:row.id,text:'partial',gapBefore:true,streaming:false,error:'Disconnected'};
 const [node]=projectJobs([row],{...snapshot,observed:{[row.id]:output}},new Map(),1000).nodes;
 assert.equal(node.status,'Running');assert.equal(node.job?.gap,true);assert.equal(node.activity,'Output unavailable');
});
test('jobs attach by owner session to the preceding visible run and occupy separate positions',()=>{
 const owner={...agent,id:'a:run:1',sessionId:'a',parentId:'hq',start:50,end:80,executionTurn:1};
 const later={...owner,id:'a:run:2',start:300};
 const [job]=projectJobs([{...row,owner:'a'}],snapshot,new Map(),1000).nodes;
 const combined=attachJobs({...graph,nodes:[agent,owner,later]},[job]);
 assert.equal(combined.nodes.at(-1)?.parentId,owner.id);
 const positions=layoutTimeline(combined.nodes,330);
 assert.equal(new Set(positions.map(p=>`${p.x},${p.y}`)).size,positions.length);
});
test('active agents have priority; jobs take over only when agent runs settle',()=>{
 const [job]=projectJobs([row],snapshot,new Map(),9999).nodes;
 const running={...agent,status:'Running' as const};
 assert.equal(liveFocusTarget([running,job])?.id,'hq');
 assert.equal(liveFocusTarget([agent,job])?.id,job.id);
 assert.equal(focusDelay(1000,2000,true),2000);
 assert.equal(focusDelay(1000,5000,true),0);
 assert.equal(focusDelay(1000,2000,false),0);
});

test('removed jobs fade for two seconds without remaining live or crossing owners', async()=>{
 const {retainExitingJobs}=await import('../src/renderer/jobExit');
 const [job]=projectJobs([row],snapshot,new Map(),1000).nodes;
 const before=[agent,job];
 const fading=retainExitingJobs(before,[agent],2000);
 assert.equal(fading.length,2);
 assert.equal(fading[1].exitingAt,2000);
 assert.equal(fading[1].status,'Unknown');
 assert.equal(liveFocusTarget(fading)?.id,'hq');
 assert.equal(retainExitingJobs(fading,[agent],3999).length,2);
 assert.equal(retainExitingJobs(fading,[agent],4000).length,1);
 assert.equal(retainExitingJobs(fading,[],2100).length,0);
 const restored=retainExitingJobs(fading,before,2500);
 assert.equal(restored[1].exitingAt,undefined);
 assert.equal(restored[1].status,'Running');
 const completed={...job,status:'Completed' as const,end:1900};
 const settled=retainExitingJobs([agent,completed],[agent],2000)[1];
 assert.equal(settled.status,'Completed');assert.equal(settled.end,1900);
});
