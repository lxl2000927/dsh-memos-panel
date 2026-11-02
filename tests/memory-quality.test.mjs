import test from 'node:test';
import assert from 'node:assert/strict';
import {deduplicateRecall,fitRecallBudget,candidateBudget,compactWriteMessages,selectionMetadata} from '../lib/memory-quality.js';
import {filterRecallProjection,requestRecallSelection} from '../lib/recall-filter.js';
const config={recallFilterEnabled:true,recallFilterBaseUrl:'http://127.0.0.1:9/v1',recallFilterApiKey:'synthetic',recallFilterModel:'fake',recallFilterTimeoutMs:100,recallFilterFailOpen:true,maxRecallChars:20};
const response=keep=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({keep})}}]})});
const sum=p=>['facts','preferences','tools'].flatMap(k=>p?.[k]??[]).reduce((n,v)=>n+Array.from(v.text).length,0);

test('exact duplicate recall is removed but corrections, negations, case and cross-category meaning survive',()=>{
 const p={facts:[{text:'Date 18',id:'first'},{text:' Date 18 ',id:'copy'},{text:'Date 21'},{text:'not Date 18'},{text:'date 18'}],preferences:[{text:'Date 18'}]};
 const result=deduplicateRecall(p);assert.equal(result.facts.length,4);assert.equal(result.facts[0].id,'first');assert.equal(result.preferences.length,1);assert.equal(p.facts.length,5);
});
test('balanced Unicode budget retains a preference beside an oversized fact and redistributes spare capacity',()=>{
 const p={facts:[{text:'😀'.repeat(100),id:'long'}],preferences:[{text:'brief',id:'pref'}]};
 const out=fitRecallBudget(p,20);assert.equal(sum(out),20);assert.equal(out.preferences[0],p.preferences[0]);assert.equal(Array.from(out.facts[0].text).length,15);assert.equal(out.facts[0].id,'long');assert.equal(p.facts[0].text.length,200);
});
test('tiny and empty budgets terminate, and enough budget preserves the original projection',()=>{
 const p={facts:[{text:'abc'}],preferences:[{text:'def'}],tools:[{text:'ghi'}]};
 assert.equal(sum(fitRecallBudget(p,1)),1);assert.equal(fitRecallBudget(p,0),undefined);assert.equal(fitRecallBudget(p,9),p);
 assert.equal(candidateBudget({maxRecallChars:5000}),10000);assert.equal(candidateBudget({maxRecallChars:20000}),24000);assert.equal(candidateBudget({maxRecallChars:50000}),50000);
});
test('success and fail-open both obey final budget; exact duplicates are not sent twice',async()=>{
 const p={facts:[{text:'x'.repeat(30)},{text:'x'.repeat(30)}],preferences:[{text:'brief'}]};let payload;
 const out=await filterRecallProjection(config,'q',p,async(_url,options)=>{payload=JSON.parse(JSON.parse(options.body).messages[1].content);return response([1,2]);});
 assert.equal(payload.items.length,2);assert.equal(sum(out),20);assert.equal(out.preferences.length,1);
 const failed=await filterRecallProjection(config,'q',p,async()=>{throw Error('offline');});assert.equal(sum(failed),20);assert.equal(failed.preferences.length,1);
 assert.equal(await filterRecallProjection({...config,recallFilterFailOpen:false},'q',p,async()=>{throw Error('offline');}),undefined);
});
test('metadata provides only valid timestamps and relevance; it never transmits arbitrary metadata',async()=>{
 let request;await requestRecallSelection(config,'q',{facts:[{text:'PUBLIC',createdAt:1793635479066,updatedAt:'2026-11-03T00:00:00Z',relativity:0.8,source:'private@example.test',id:'not-needed'}],preferences:[]},async(_url,options)=>{request=JSON.parse(options.body);return response([1]);});
 const item=JSON.parse(request.messages[1].content).items[0];assert.equal(item.createdAt,'2026-11-02T16:04:39.066Z');assert.equal(item.updatedAt,'2026-11-03T00:00:00.000Z');assert.equal(item.relevance,0.8);assert.ok(!JSON.stringify(request).includes('private@example.test'));assert.ok(!JSON.stringify(request).includes('not-needed'));
 assert.deepEqual(selectionMetadata({createdAt:'password=sample',updatedAt:Infinity,relativity:NaN}),{});
 assert.match(request.messages[0].content,/explicit user correction/);assert.match(request.messages[0].content,/storage timestamps, not/);
});
test('write compaction drops only acknowledgements proven to repeat current user text',()=>{
 const user={role:'user',content:'请记住测试：项目验收日期是 2026 年 11 月 21 日。'},ack={role:'assistant',content:'已记录测试事实：项目验收日期是2026年11月21日。'};
 assert.deepEqual(compactWriteMessages([user,ack]),[user]);
 assert.deepEqual(compactWriteMessages([user,{role:'assistant',content:'已记住。'}]),[user]);
 assert.equal(ack.content,'已记录测试事实：项目验收日期是2026年11月21日。');
});
test('new conclusions, changed dates, negation, code operators and tool calls remain writable',()=>{
 const user={role:'user',content:'项目日期是11月18日。x != 1。请检查编译。'};
 for(const content of ['已记录：项目日期是11月21日。','已记录：项目日期不是11月18日。','已记录：x = 1。','已修复编译错误，测试已通过。','检查结果：编译失败。','已记录但保存失败：项目日期是11月18日。']){
  const a={role:'assistant',content};assert.deepEqual(compactWriteMessages([user,a]),[user,a]);
 }
 const a={role:'assistant',content:'已记住。',tool_calls:[{id:'call'}]};assert.deepEqual(compactWriteMessages([user,a]),[user,a]);
 assert.deepEqual(compactWriteMessages([{role:'assistant',content:'已记住。'}]),[{role:'assistant',content:'已记住。'}]);
 const mathematical=[{role:'user',content:'5'},{role:'assistant',content:'已记录：5!'}];assert.deepEqual(compactWriteMessages(mathematical),mathematical);
});

test('live lifecycle gives preferences candidate space, bounds injection, and compacts only safe write acknowledgements',{skip:!process.env.MEMOS_NATIVE_ENTRY},async()=>{
 const {installMemosLifecycle}=await import('../vendor/memos-cloud-0.1.2.js');
 const handlers=new Map(),writes=[];let candidates;
 const ctx={get:name=>name==='launchEnvironment'?{get(){}}:undefined,logger:()=>({warn(){}}),intercept(){},inject(){},on(name,fn){handlers.set(name,fn);return()=>handlers.delete(name);},effect:fn=>fn()};
 const runtime=installMemosLifecycle(ctx,{...config,maxRecallChars:100,maxItemChars:100,userId:'synthetic-user'}, {fetcher:async(_url,options)=>{candidates=JSON.parse(JSON.parse(options.body).messages[1].content);return response(candidates.items.filter(x=>x.kind==='preference').map(x=>x.id));},clientFactory:()=>({search:async()=>({memory_detail_list:[{memory_value:'f'.repeat(100)},{memory_value:'g'.repeat(100)}],preference_detail_list:[{preference:'be concise'}]}),add:async value=>{writes.push(value);return {};}})});
 try{
 const session={id:'quality-synthetic-session',header:{}};
 const decision={kind:'enter',messages:[{source:{kind:'user'},content:[{type:'text',text:'what is my preference?'}]}]};
 const out=await handlers.get('agent/pre-step')({step:1,signal:new AbortController().signal,agent:{session}},async()=>decision);
 assert.ok(candidates.items.some(x=>x.kind==='preference'));assert.ok(out.messages[0].content[0].text.includes('be concise'));assert.ok(!out.messages[0].content[0].text.includes('f'.repeat(100)));
 const time=Date.now(),turn='safe-ack';session.events=[{seq:0,type:'turn/start',data:{turn},time},{seq:1,type:'user/message',surfaceOp:'append',data:{id:'u',turn,source:{kind:'user'},content:[{type:'text',text:'项目主题是雾蓝色。'}]},time},{seq:2,type:'assistant/message',surfaceOp:'append',data:{turn,message:{id:'a',content:[{type:'text',text:'已记录：项目主题是雾蓝色。'}]}},time},{seq:3,type:'turn/end',data:{turn,reason:{kind:'completed'}},time}];
 handlers.get('session/event')(session,session.events[3]);await runtime.drain();assert.equal(writes.length,1);assert.deepEqual(writes[0].messages.map(m=>m.role),['user']);
 }finally{await runtime.dispose();}
});
