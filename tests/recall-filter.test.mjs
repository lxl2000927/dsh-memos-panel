import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {filterRecallProjection,requestRecallSelection} from '../lib/recall-filter.js';
import {createController,registerRoutes} from '../lib/index.js';
import {createLegacySettings} from '../lib/settings-compat.js';
import {DISPLAY_FIELDS} from '../lib/config.js';
// All traffic uses synthetic responses; never contact a real memory service.
globalThis.fetch=async()=>{throw new Error('Unexpected real network request');};
const {Config,installMemosLifecycle}=await import('../vendor/memos-cloud-0.1.2.js');
const {installGuardedLifecycle}=await import('../lib/guarded-memos.js');
const require=createRequire(import.meta.resolve('@memtensor/memos-cloud-dsh-plugin'));
const {parseDocument}=require('yaml');
const base={recallFilterEnabled:true,recallFilterBaseUrl:'http://127.0.0.1:9/v1',recallFilterApiKey:'synthetic-filter-key',recallFilterModel:'fake',recallFilterTimeoutMs:100,recallFilterFailOpen:true};
const projection={facts:[{text:'one',id:'f1'},{text:'two',id:'f2'}],preferences:[{text:'brief',id:'p1'}],tools:[{text:'tool',id:'t1'}]};
const response=(keep,status=200)=>({ok:status===200,status,json:async()=>({choices:[{message:{content:typeof keep==='string'?keep:JSON.stringify({keep})}}]})});
const select=(config={},reply=[1,3],input=projection)=>filterRecallProjection({...base,...config},'question',input,async()=>response(reply));

test('disabled filter does not call provider',async()=>assert.equal(await filterRecallProjection({...base,recallFilterEnabled:false},'q',projection,()=>assert.fail()),projection));
test('single irrelevant candidate can be removed',async()=>assert.equal(await select({},[],{facts:[{text:'irrelevant'}],preferences:[]}),undefined));
test('selection preserves group order and original metadata',async()=>assert.deepEqual(await select({},[4,1,3,1]),{facts:[projection.facts[0]],preferences:projection.preferences,tools:projection.tools}));
test('valid empty selection does not fall back',async()=>assert.equal(await select({},[]),undefined));
test('only integer indices or decimal integer strings are accepted',async()=>assert.deepEqual(await select({},[true,[1],{},null,2.5,'3e0','2',99,-1]),{facts:[projection.facts[1]],preferences:[]}));
for(const reply of ['```json\n{"keep":[1]}\n```','Explanation {"note":"{example}"}. Selection: {"keep":[1]} done.'])test('parse fenced or explained JSON '+reply.slice(0,12),async()=>assert.equal((await select({},reply)).facts.length,1));
for(const failOpen of [true,false]){
  for(const key of ['recallFilterBaseUrl','recallFilterApiKey','recallFilterModel'])test(`missing ${key}, failOpen=${failOpen}`,async()=>assert.equal(await select({[key]:undefined,recallFilterFailOpen:failOpen}),failOpen?projection:undefined));
  test(`invalid JSON, failOpen=${failOpen}`,async()=>assert.equal(await select({recallFilterFailOpen:failOpen},'garbage'),failOpen?projection:undefined));
  test(`HTTP failure, failOpen=${failOpen}`,async()=>assert.equal(await filterRecallProjection({...base,recallFilterFailOpen:failOpen},'q',projection,async()=>response([],500)),failOpen?projection:undefined));
  test(`timeout bounds even a fetcher ignoring abort, failOpen=${failOpen}`,async()=>{
    const start=performance.now();
    assert.equal(await filterRecallProjection({...base,recallFilterFailOpen:failOpen},'q',projection,()=>new Promise(()=>{})),failOpen?projection:undefined);
    assert.ok(performance.now()-start<1500);
  });
  test(`caller cancellation propagates, failOpen=${failOpen}`,async()=>{
    const caller=new AbortController();
    const task=filterRecallProjection({...base,recallFilterFailOpen:failOpen},'q',projection,async()=>{caller.abort();return response([1]);},caller.signal);
    await assert.rejects(task,{name:'AbortError'});
  });
}
test('already cancelled request makes no provider call',async()=>{const c=new AbortController();c.abort();await assert.rejects(filterRecallProjection(base,'q',projection,()=>assert.fail(),c.signal),{name:'AbortError'});});
test('question and all candidates are redacted before sending; originals preserved',async()=>{
  let captured;
  const result=await filterRecallProjection(base,'PRIVATE question',{facts:[{text:'PRIVATE memory'}],preferences:[]},async(url,options)=>{captured={url,options};return response([1]);},undefined,s=>s.replaceAll('PRIVATE','REDACTED'));
  const request=JSON.parse(captured.options.body);assert.ok(!request.messages[1].content.includes('PRIVATE'));assert.equal(result.facts[0].text,'PRIVATE memory');assert.equal(captured.options.redirect,'error');
});
test('unsafe endpoint is rejected before a request',async()=>await assert.rejects(requestRecallSelection({...base,recallFilterBaseUrl:'http://example.invalid/v1'},'q',projection,()=>assert.fail()),{code:'INVALID_ENDPOINT'}));

function lifecycleHarness({cancel=false,guarded=false}={}){
  const handlers=new Map(),caller=new AbortController();let requests=0;
  const ctx={get:name=>name==='launchEnvironment'?{get(){}}:undefined,logger:()=>({warn(){}}),intercept(){},inject(){},on(name,fn){handlers.set(name,fn);return()=>handlers.delete(name);},effect:fn=>fn()};
  const fetcher=async()=>{requests++;if(cancel)caller.abort();return response([1]);};
  const dependencies={fetcher,clientFactory:()=>({search:async()=>({memory_detail_list:[{memory_value:'one'},{memory_value:'two'}]})})};
  const privacy={guard:{begin(){},screen(){return true;},check(_session,value){return value;}}};
  const runtime=guarded?installGuardedLifecycle(ctx,base,privacy,dependencies):installMemosLifecycle(ctx,base,dependencies);
  const decision={kind:'enter',messages:[{source:{kind:'user'},content:[{type:'text',text:'question'}]}]};
  return {runtime,decision,get requests(){return requests;},async run(){return handlers.get('agent/pre-step')({step:1,signal:caller.signal,agent:{session:{id:'synthetic-test-session',header:{origin:'top-level'}}}},async()=>decision);}};
}
test('real pre-step cancellation leaves messages untouched',{skip:!process.env.MEMOS_NATIVE_ENTRY},async()=>{const h=lifecycleHarness({cancel:true});assert.equal(await h.run(),h.decision);assert.equal(h.requests,1);await h.runtime.dispose();});
test('guarded lifecycle forwards its fetcher into filtering',{skip:!process.env.MEMOS_NATIVE_ENTRY},async()=>{const h=lifecycleHarness({guarded:true});const result=await h.run();assert.equal(h.requests,1);assert.equal(result.messages[0].source.kind,'plugin:memos-cloud');assert.ok(!result.messages[0].content[0].text.includes('two'));await h.runtime.dispose();});

const fixtureHomes=new Set();
after(()=>{for(const home of fixtureHomes)fs.rmSync(home,{recursive:true,force:true});});
function settingsFixture(){
  const home=fs.mkdtempSync(join(tmpdir(),'memos-filter-test-'));fixtureHomes.add(home);
  fs.writeFileSync(home+'/settings-legacy.yaml','unrelated:\n  preserved: true\nmemos-cloud:\n  userId: synthetic-user\n  apiKey: synthetic-main-key\n  recallFilterApiKey: synthetic-filter-key\n');
  const settings=createLegacySettings({native:{writable:true},schema:Config,base:{recallFilterApiKey:'synthetic-base-key'},home,parseDocument});
  return {settings,home};
}
test('legacy describe hides both secrets in every layer',()=>{const {settings}=settingsFixture();const desc=settings.describe({redactSecrets:true})[0];for(const layer of ['value','base','user'])for(const key of ['apiKey','recallFilterApiKey'])assert.equal(desc[layer][key],undefined);assert.equal(desc.secrets.length,2);assert.equal(settings.get('memos-cloud').recallFilterApiKey,'synthetic-filter-key');});
test('panel exposes all six filter controls without keys',async()=>{const {settings}=settingsFixture();const state=await createController({settings}).state();assert.equal(DISPLAY_FIELDS.filter(x=>x.key.startsWith('recallFilter')).length,6);assert.ok(!JSON.stringify(state).includes('synthetic-filter-key'));assert.ok(!JSON.stringify(state).includes('synthetic-base-key'));assert.equal(state.secretStatus.recallFilterApiKey.set,true);});
test('panel saves filter fields and independent keys; blanks preserve keys',async()=>{
  const {settings,home}=settingsFixture(),controller=createController({settings});let state=await controller.state();
  state=await controller.save({revision:state.revision,values:{recallFilterEnabled:true,recallFilterBaseUrl:base.recallFilterBaseUrl,recallFilterModel:'fake',recallFilterTimeoutMs:7000,recallFilterFailOpen:false},recallFilterApiKey:'replacement-filter-key',apiKey:''});
  assert.equal(settings.get('memos-cloud').apiKey,'synthetic-main-key');assert.equal(settings.get('memos-cloud').recallFilterApiKey,'replacement-filter-key');assert.equal(state.values.recallFilterTimeoutMs,7000);
  await controller.save({revision:state.revision,values:{includeAssistant:false},recallFilterApiKey:''});
  assert.equal(settings.get('memos-cloud').recallFilterApiKey,'replacement-filter-key');assert.equal(parseDocument(fs.readFileSync(home+'/settings-legacy.yaml','utf8')).getIn(['unrelated','preserved']),true);
});
test('enabling with incomplete configuration is rejected without a write',async()=>{const {settings}=settingsFixture(),c=createController({settings});const s=await c.state();await assert.rejects(c.save({revision:s.revision,values:{recallFilterEnabled:true}}),/启用二次筛选前/);assert.equal(settings.get('memos-cloud').recallFilterEnabled,false);});
test('reset filter group preserves both stored keys',async()=>{const {settings}=settingsFixture(),c=createController({settings});const s=await c.state();await c.save({revision:s.revision,resetFields:DISPLAY_FIELDS.filter(x=>x.group==='recall-filter'&&x.type!=='secret').map(x=>x.key)});assert.equal(settings.get('memos-cloud').recallFilterApiKey,'synthetic-filter-key');assert.equal(settings.get('memos-cloud').apiKey,'synthetic-main-key');});
test('filter test uses draft credentials and synthetic content; does not save',async()=>{const {settings}=settingsFixture();let payload;const c=createController({settings,fetcher:async(_url,options)=>{payload=options;return response([1]);}});const before=settings.get('memos-cloud');const result=await c.testFilter({values:{recallFilterBaseUrl:base.recallFilterBaseUrl,recallFilterModel:'fake'},recallFilterApiKey:'draft-key'});assert.equal(result.ok,true);assert.equal(payload.headers.Authorization,'Bearer draft-key');assert.ok(!payload.body.includes('synthetic-user'));assert.deepEqual(settings.get('memos-cloud'),before);});
test('filter test reports invalid provider output instead of fail-open success',async()=>{const {settings}=settingsFixture(),c=createController({settings,fetcher:async()=>response('garbage')});await assert.rejects(c.testFilter({values:{recallFilterBaseUrl:base.recallFilterBaseUrl,recallFilterModel:'fake'}}),/有效的记忆编号/);});
test('new route retains host connection validation',async()=>{const routes=[];registerRoutes({register(route){routes.push(route);return()=>{};}},{requestRejection:()=>403},{testFilter(){assert.fail('must not execute');}});const route=routes.find(x=>x.path.endsWith('/test-filter'));let status;await route.handler({method:'POST'},{writeHead(s){status=s;},end(){}});assert.equal(status,403);});
