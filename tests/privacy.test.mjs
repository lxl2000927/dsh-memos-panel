import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {PRIVACY_DEFAULTS,PrivacyBlocked,PrivacyGuard,inspectPayload,validatePrivacy} from '../lib/privacy.js';
import {privacyFor} from '../lib/privacy-store.js';
import {createController} from '../lib/index.js';

const dummyKey='sk-proj-'+('Synthetic0nlyABC_'.repeat(4));
const rejects=value=>assert.throws(()=>inspectPayload(value),PrivacyBlocked);
test('keys, short passwords, headers, database passwords and private keys block complete payloads',()=>{
  for(const text of [dummyKey,'API_KEY="short"','密码是 1234','password: a','Authorization: Bearer synthetic-token-value','Cookie: session=demo','postgres://demo:password@localhost/demo','-----BEGIN OPENSSH PRIVATE KEY-----\ndummy\n-----END OPENSSH PRIVATE KEY-----'])rejects({messages:[{content:'ordinary text'},{content:text}]});
});
test('encoded, invisible-character and split credentials are checked locally',()=>{
  for(const text of [encodeURIComponent('password=short'),Buffer.from('password=short-demo-value').toString('base64'),'pass\u200bword=short','\\u0070assword=short'])rejects({query:text});
  rejects({messages:[{content:'sk-proj-Synthetic0nly'},{content:'ABC_Synthetic0nlyABC_'}]});
});
test('phones and emails are removed from query, messages, tool JSON and metadata without changing input',()=>{
  const input={user_id:'synthetic-user',query:'联系 +86 138 0013 8000 或 demo.person@example.test',messages:[{role:'user',content:'邮箱 user+tag@example.test'},{role:'assistant',tool_calls:[{function:{arguments:'{"phone":"13912345678"}'}}]}],info:{contact:'13712345678'}};
  const before=structuredClone(input);const result=inspectPayload(input);
  assert.deepEqual(input,before);assert.equal(result.payload.user_id,'synthetic-user');assert(result.redacted>=4);
  assert(!JSON.stringify(result.payload).includes('example.test'));assert(!JSON.stringify(result.payload).includes('138 0013'));
  assert.equal(JSON.parse(result.payload.messages[1].tool_calls[0].function.arguments).phone,'[手机号已移除]');
});
test('identity fields containing PII block requests instead of silently changing memory ownership',()=>{
  rejects({user_id:'someone@example.test',query:'ordinary'});
  rejects({user_id:'13800138000',query:'ordinary'});
});
test('custom rules are bounded literal text, support blocking and redaction, and block wins',()=>{
  const policy={...PRIVACY_DEFAULTS,customBlockTerms:['客户名单'],customRedactTerms:['internal.example.test','a+b']};
  assert.throws(()=>inspectPayload({query:'查看客户名单'},policy),PrivacyBlocked);
  assert.equal(inspectPayload({query:'visit internal.example.test and a+b'},policy).payload.query,'visit [自定义信息已移除] and [自定义信息已移除]');
  assert.throws(()=>validatePrivacy({customBlockTerms:['x'.repeat(257)]}));
  assert.equal(inspectPayload({query:'abc'}, {...policy,customBlockTerms:['.*']}).payload.query,'abc');
});
test('switches are explicit; oversize input, bad configuration and scan failures never allow fallback',()=>{
  assert.equal(inspectPayload({query:dummyKey},{privacyEnabled:false}).payload.query,dummyKey);
  assert.equal(inspectPayload({query:'13800138000'},{redactPhone:false}).payload.query,'13800138000');
  rejects({query:'a'.repeat(2*1024*1024+1)});
  const store={value:structuredClone(PRIVACY_DEFAULTS),error:true};const guard=new PrivacyGuard(store),session={};
  assert.equal(guard.screen(session,'ordinary'),false);assert(!JSON.stringify(guard.state()).includes('ordinary'));
  store.error=false;guard.begin(session);assert(guard.screen(session,'ordinary'));
  assert(!guard.screen(session,dummyKey));assert(!guard.screen(session,'safe answer'));assert(!JSON.stringify(guard.state()).includes(dummyKey));
});
test('privacy settings are separate and privacy-only saves do not mutate native accounts or credentials',async(t)=>{
  const root=await mkdtemp(join(tmpdir(),'memos-privacy-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const native={apiKey:'synthetic-account-key',userId:'unchanged-user',apiKeyEnv:'EXISTING_REF',baseURL:'https://example.test/api'};let nativeWrites=0;
  const settings={documentPath:join(root,'cordis.patch.yml'),writable:true,get:()=>structuredClone(native),describe:()=>[{ns:'memos-cloud',revision:7,user:{},base:{}}],mutate:()=>{nativeWrites++;}};
  const privacy=privacyFor({settings}),controller=createController({settings,privacy});
  const result=await controller.save({revision:7,privacyRevision:0,values:{customBlockTerms:['private project'],redactPhone:false}});
  assert.equal(nativeWrites,0);assert.equal(result.values.redactPhone,false);assert.equal(result.fields.length,41);
  const disk=await readFile(join(root,'memos-panel.privacy.json'),'utf8');assert(!disk.includes(native.apiKey));assert(!disk.includes(native.userId));
  assert.deepEqual(native,{apiKey:'synthetic-account-key',userId:'unchanged-user',apiKeyEnv:'EXISTING_REF',baseURL:'https://example.test/api'});
});

const hasUpstream=Boolean(process.env.MEMOS_NATIVE_ENTRY);
test('real bundle composition disables the original lifecycle and mounts only one guarded entry',{skip:!hasUpstream},async()=>{
  const require=createRequire(import.meta.url);
  const {applyEntryPatches}=require('@deepseek-ai/cordis-plugin-include');
  const {parse}=createRequire(process.env.MEMOS_NATIVE_ENTRY)('yaml');
  const patch=parse(await readFile(new URL('../cordis.patch.yml',import.meta.url),'utf8'));
  const original={id:'memos-cloud',name:'@memtensor/memos-cloud-dsh-plugin',config:{apiKey:'synthetic-key-retained',userId:'unchanged'}};
  const result=applyEntryPatches([original],patch,()=>assert.fail('unexpected patch warning'));
  assert.equal(result.find(entry=>entry.id==='memos-cloud').disabled,true);
  assert.deepEqual(result.find(entry=>entry.id==='memos-cloud').config,original.config);
  assert.equal(result.filter(entry=>entry.name==='dsh-memos-panel/guarded-memos'&&!entry.disabled).length,1);
});
test('real lifecycle: pre-truncation block, full-turn block, PII redaction, isolation and unchanged auth',{skip:!hasUpstream},async(t)=>{
  const {installGuardedLifecycle}=await import('../lib/guarded-memos.js');
  const captured=[];
  const server=http.createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;captured.push({path:req.url,body:JSON.parse(body),authorization:req.headers.authorization});res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({code:0,data:req.url==='/search/memory'?{memory_detail_list:[]}: {}}));});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const events=new Map(),warnings=[],disposers=[];
  const ctx={fiber:{},logger:()=>({warn:message=>warnings.push(message)}),get:name=>name==='launchEnvironment'?{get:()=>undefined}:undefined,inject:()=>{},on:(name,fn)=>{events.set(name,fn);return()=>events.delete(name);},effect:fn=>{const dispose=fn();if(typeof dispose==='function')disposers.push(dispose);return dispose;}};
  const store={value:structuredClone(PRIVACY_DEFAULTS),error:false};const privacy={store,guard:new PrivacyGuard(store)};
  const runtime=installGuardedLifecycle(ctx,{userId:'synthetic-owner',apiKey:'unchanged-auth-only',baseURL:`http://127.0.0.1:${server.address().port}`,maxQueryChars:16,maxMessageChars:12},privacy);
  t.after(async()=>{await runtime.dispose();});
  async function start(session,text){const decision={kind:'enter',messages:[{source:{kind:'user'},content:[{type:'text',text}]}]};await events.get('agent/pre-step')({agent:{session},step:1,signal:new AbortController().signal},async()=>decision);}
  function end(session,text,answer='ordinary answer'){
    const time=Date.now(),turn='synthetic-turn';
    session.events=[{seq:0,type:'turn/start',data:{turn},time},{seq:1,type:'user/message',surfaceOp:'append',data:{id:'u',turn,source:{kind:'user'},content:[{type:'text',text}]},time},{seq:2,type:'assistant/message',surfaceOp:'append',data:{turn,message:{id:'a',content:[{type:'text',text:answer}]}},time},{seq:3,type:'turn/end',data:{turn,reason:{kind:'completed'}},time}];
    events.get('session/event')(session,session.events[3]);
  }
  const blocked={id:'blocked-session',header:{}};
  await start(blocked,'ordinary context '.repeat(5)+dummyKey);end(blocked,'ordinary context '.repeat(5)+dummyKey);await runtime.drain();assert.equal(captured.length,0);
  const assistantBlocked={id:'assistant-blocked',header:{}};
  await start(assistantBlocked,'ordinary question');assert.equal(captured.length,1);end(assistantBlocked,'ordinary question','ordinary answer '.repeat(10)+'password=short');await runtime.drain();assert.equal(captured.length,1);
  const clean={id:'clean-session',header:{}};
  await start(clean,'ordinary question');end(clean,'email demo@example.test','phone 13800138000');await runtime.drain();
  const add=captured.find(entry=>entry.path==='/add/message');assert(add);assert.equal(add.authorization,'Token unchanged-auth-only');assert.equal(add.body.user_id,'synthetic-owner');assert(!JSON.stringify(add.body).includes('demo@example.test'));assert(!JSON.stringify(add.body).includes('13800138000'));
  assert(!JSON.stringify(add.body).includes('demo@'));assert(!JSON.stringify(add.body).includes('138'));
  assert(!JSON.stringify(warnings).includes(dummyKey));assert(!JSON.stringify(warnings).includes('password=short'));
  assert.equal(captured.filter(entry=>entry.path==='/add/message').length,1);
});
