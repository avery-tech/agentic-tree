import test from 'node:test';
import assert from 'node:assert/strict';
import { planFromProjection } from '../src/harness/plan';
import { graphFromSessions } from '../src/harness/adapter';
import { planSegments } from '../src/renderer/planSegments';

test('reads the selected root checklist without merging child or unrelated plans', () => {
  const todo = (content: string, status: string) => ({content,status});
  const graph = graphFromSessions('root', {byId:{},projectionsBySession:{
    root:{state:'ready',values:{todos:[todo('First','completed'),todo('Second','in_progress')],subagentCatalog:[{id:'child'}]}},
    child:{state:'ready',values:{todos:[todo('Child work','completed')]}},
    unrelated:{state:'ready',values:{todos:[todo('Other task','pending')]}},
  }});
  assert.deepEqual(graph.plan.steps.map(step=>step.title),['First','Second']);
  assert.equal(graph.plan.steps.filter(step=>step.status==='completed').length,1);
});
test('null/reset and empty plans never become 100 percent, and missing data stays explicit',()=>{
  assert.equal(planFromProjection({todos:null},'ready').state,'absent');
  assert.equal(planFromProjection({todos:[]},'ready').state,'absent');
  assert.equal(planFromProjection({},'loading').state,'loading');
  assert.equal(planFromProjection({},'ready').state,'unavailable');
  assert.equal(planFromProjection({todos:[{content:'Task',status:'failed'}]},'ready').state,'unavailable');
  const graph=graphFromSessions('root',{byId:{root:{projectionValues:{todos:[{content:'Old','status':'completed'}]}}},projectionsBySession:{root:{state:'ready',values:{todos:null}}}});
  assert.deepEqual(graph.plan.steps,[]);
});
test('cells preserve parallel work, task order and exact counts',()=>{
  const plan=planFromProjection({todos:[{content:'A',status:'completed'},{content:'B',status:'in_progress'},{content:'C',status:'pending'},{content:'D',status:'in_progress'}]},'ready');
  const cells=planSegments(plan.steps);
  assert.deepEqual(cells.map(c=>[c.completed,c.active]),[[1,0],[0,1],[0,0],[0,1]]);
  assert.match(cells[1].title,/B/);
});
test('large plans are grouped without dropping or inventing steps',()=>{
  const steps=Array.from({length:53},(_,i)=>({title:`Step ${i+1}`,status:i<27?'completed' as const:i<30?'in_progress' as const:'pending' as const}));
  const cells=planSegments(steps);
  assert.equal(cells.length,20);
  assert.equal(cells.reduce((n,c)=>n+c.total,0),53);
  assert.equal(cells.reduce((n,c)=>n+c.completed,0),27);
  assert.equal(cells.reduce((n,c)=>n+c.active,0),3);
  assert.equal(cells[0].start,0);
  assert.equal(cells.at(-1)!.end,53);
});
