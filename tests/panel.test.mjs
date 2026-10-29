import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import {createController,registerRoutes} from '../lib/index.js';
import {DISPLAY_FIELDS,GROUPS} from '../lib/config.js';

function fixture(initial={}) {
  let config={recallEnabled:false,addEnabled:false,...initial};
  let revision=3;
  const settings={writable:true,
    get:()=>structuredClone(config),
    describe:()=>[{ns:'memos-cloud',revision:0,value:{}},{ns:'memos-cloud',revision,value:structuredClone(config),user:structuredClone(config),base:{}}],
    async mutate(ns,ops,expected){
      assert.equal(ns,'memos-cloud');
      if(expected!==revision)throw Object.assign(new Error('conflict'),{code:'SETTINGS_CONFLICT'});
      for(const op of ops){if(op.op==='unset')delete config[op.path[0]];else config[op.path[0]]=op.value;}
      revision++;
    }};
  return {settings,read:()=>structuredClone(config),controller:createController({settings})};
}

test('write-only secret never reaches the browser; unrelated settings survive edits',async()=>{
  const f=fixture({apiKey:'private-secret-do-not-return',userId:'existing-user',futureParameter:'keep'});
  const before=await f.controller.state();
  assert.equal(before.revision,3);
  assert.equal(before.hasApiKey,true);
  assert(!JSON.stringify(before).includes('private-secret'));
  const saved=await f.controller.save({revision:before.revision,values:{memoryLimitNumber:9},apiKey:''});
  assert.equal(saved.values.memoryLimitNumber,9);
  assert.equal(f.read().apiKey,'private-secret-do-not-return');
  assert.equal(f.read().userId,'existing-user');
  assert.equal(f.read().futureParameter,'keep');
  assert(!JSON.stringify(saved).includes('private-secret'));
  await assert.rejects(f.controller.save({revision:before.revision,values:{recallEnabled:true}}),/其他窗口/);
});

test('new key is persisted once, stays redacted and blank input preserves it',async()=>{
  const f=fixture();
  await f.controller.save({revision:3,values:{userId:'research'},apiKey:'  newly-entered-key  '});
  assert.equal(f.read().apiKey,'newly-entered-key');
  const next=await f.controller.save({revision:4,values:{addEnabled:true},apiKey:''});
  assert.equal(f.read().apiKey,'newly-entered-key');
  assert(!JSON.stringify(next).includes('newly-entered-key'));
});

test('reset removes only chosen overrides while keeping keys and unrelated fields',async()=>{
  const f=fixture({apiKey:'keep-this-key',memoryLimitNumber:15,preferenceLimitNumber:12,futureParameter:'keep'});
  const before=await f.controller.state();
  assert(before.customized.includes('memoryLimitNumber'));
  const saved=await f.controller.save({revision:3,values:{},resetFields:['memoryLimitNumber']});
  assert.equal(saved.values.memoryLimitNumber,6);
  assert(!saved.customized.includes('memoryLimitNumber'));
  assert.equal(f.read().apiKey,'keep-this-key');
  assert.equal(f.read().preferenceLimitNumber,12);
  assert.equal(f.read().futureParameter,'keep');
  await assert.rejects(f.controller.save({revision:4,values:{},resetFields:['apiKey']}),/字段无效/);
  await assert.rejects(f.controller.save({revision:4,values:{relativity:0.6},resetFields:['relativity']}),/同时修改/);
});

test('all 35 native fields are described and assigned to a valid section',()=>{
  assert.equal(DISPLAY_FIELDS.length,35);
  assert.equal(new Set(DISPLAY_FIELDS.map(field=>field.key)).size,35);
  for(const field of DISPLAY_FIELDS){assert(field.hint);assert(GROUPS.some(group=>group.id===field.group));}
});

test('display fields match the installed official Config schema',{skip:!process.env.MEMOS_NATIVE_ENTRY},async()=>{
  const official=await import(pathToFileURL(process.env.MEMOS_NATIVE_ENTRY));
  assert.deepEqual(DISPLAY_FIELDS.map(field=>field.key).sort(),Object.keys(official.Config.dict).sort());
});

test('the configuration page registers only under Settings, never in either plugin detail',async()=>{
  const registrations=[];
  const source=await readFile(new URL('../client/client.js',import.meta.url),'utf8');
  const context={effect:fn=>fn(),slots:{inject:(_name,fn)=>fn(),register:(options)=>{registrations.push(options);return ()=>{};}}};
  const sandbox={window:{__ModuleLoader__:{load:({factory})=>factory(()=>({})).apply(context)}},document:{createElement:()=>({dataset:{},remove(){}}),head:{appendChild(){}}}};
  vm.runInNewContext(source,sandbox,{timeout:1000});
  assert.equal(registrations.length,1);
  assert.equal(registrations[0].name,'settings.section');
  assert.equal(registrations[0].id,'memos');
});

test('bad input cannot change settings or send a secret to an insecure endpoint',async()=>{
  const f=fixture({apiKey:'never-send'});
  await assert.rejects(f.controller.save({revision:3,values:{memoryLimitNumber:26}}),/取值范围/);
  await assert.rejects(f.controller.save({revision:3,values:{userId:{value:'wrong'}}}),/格式/);
  await assert.rejects(f.controller.save({revision:3,values:{apiKey:'inject'}}),/不支持/);
  await assert.rejects(f.controller.save({revision:3,values:{knowledgebaseIds:['all','kb_1']}}),/混用/);
  await assert.rejects(f.controller.test({values:{baseURL:'http://example.com'}}),/HTTPS/);
  assert.equal(f.read().memoryLimitNumber,undefined);
});

test('connectivity probe uses fixed synthetic text and no add endpoint',async()=>{
  const f=fixture({apiKey:'test-token',userId:'test-user'});
  const calls=[];
  const controller=createController({settings:f.settings,fetcher:async(url,options)=>{
    calls.push({url,options});return {ok:true,json:async()=>({code:0,data:{memory_detail_list:[{memory_value:'sensitive-existing-memory'}]}})};
  }});
  const response=await controller.test({values:{}});
  assert.equal(calls.length,1);
  assert(calls[0].url.endsWith('/search/memory'));
  assert.equal(calls[0].options.headers.authorization,'Token test-token');
  assert.equal(calls[0].options.redirect,'error');
  assert.equal(JSON.parse(calls[0].options.body).query,'MemOS connectivity test');
  assert(!JSON.stringify(response).includes('sensitive-existing-memory'));
});

test('routes require DSH session checks and never return raw exceptions',async(t)=>{
  const routes=new Map();
  const f=fixture();
  const controller=createController({settings:f.settings,fetcher:async()=>{throw new Error('TOP-SECRET');}});
  let rejection=401;
  const dispose=registerRoutes({register:({path,handler})=>{routes.set(path,handler);return ()=>routes.delete(path);}},
    {requestRejection:()=>rejection},controller);
  const server=http.createServer((req,res)=>{
    const route=routes.get(req.url);if(route)return route(req,res);res.writeHead(404).end();
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>{dispose();server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const root=`http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(root+'/memos-panel/api/state')).status,401);
  rejection=undefined;
  assert.equal((await fetch(root+'/memos-panel/api/state')).status,200);
  assert.equal((await fetch(root+'/memos-panel/api/save')).status,405);
  const failed=await fetch(root+'/memos-panel/api/save',{method:'POST',body:'not json'});
  assert.equal(failed.status,400);
  const config=await failed.json();assert(!JSON.stringify(config).includes('TOP-SECRET'));
});
