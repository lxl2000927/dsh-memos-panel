import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHostRequire} from '../lib/host-sdk.js';

test('a clean profile without optional SDK peers loads the running host copy',async t=>{
  const root=await mkdtemp(join(tmpdir(),'memos-host-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const host=join(root,'host'),profile=join(root,'profile');
  await mkdir(join(host,'node_modules','synthetic-sdk'),{recursive:true});await mkdir(profile);
  await writeFile(join(host,'node_modules','synthetic-sdk','index.js'),'module.exports = { origin: "running-host" };');
  const primary=createRequire(join(profile,'index.cjs'));
  assert.throws(()=>primary.resolve('synthetic-sdk'),{code:'MODULE_NOT_FOUND'});
  const load=createHostRequire(primary,join(host,'main.cjs'));
  assert.equal(load('synthetic-sdk').origin,'running-host');
  assert.equal(load('synthetic-sdk'),load('synthetic-sdk'));
});

test('resolved SDK loading failures are not hidden by a host fallback',()=>{
  const problem=Object.assign(new Error('dependency failed'),{code:'MODULE_NOT_FOUND'});
  const primary=()=>{throw problem;};primary.resolve=()=>'/already/resolved/sdk.cjs';
  assert.throws(()=>createHostRequire(primary)('synthetic-sdk'),error=>error===problem);
});

test('SDK resolution failures other than missing packages are preserved',()=>{
  const problem=Object.assign(new Error('blocked export'),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});
  const primary=()=>assert.fail();primary.resolve=()=>{throw problem;};
  assert.throws(()=>createHostRequire(primary)('synthetic-sdk'),error=>error===problem);
});

test('installed RC5 host SDK resolves without NODE_PATH or profile junctions',{skip:!process.env.DSH_TEST_HOST_ENTRY},()=>{
  const code=`
    import assert from 'node:assert/strict';
    import {createRequire} from 'node:module';
    const {createHostRequire}=await import(process.argv[2]);
    const upstream=createRequire(process.argv[3]);
    const load=createHostRequire(upstream);
    for(const [name,member] of [['dsh-credentials','credentialRef'],['dsh-launch-environment','launchEnvironmentOf'],['dsh-llm','createUserMessage'],['dsh-session','isAppendSurfaceEvent']]){
      const spec='@deepseek-ai/'+name;
      assert.throws(()=>upstream.resolve(spec),{code:'MODULE_NOT_FOUND'});
      assert.equal(typeof load(spec)[member],'function');
    }
    console.log('all four host SDK modules resolved');
  `;
  const output=execFileSync(process.execPath,['--input-type=module','--eval',code,process.env.DSH_TEST_HOST_ENTRY,new URL('../lib/host-sdk.js',import.meta.url).href,process.env.MEMOS_NATIVE_ENTRY],{env:{...process.env,NODE_PATH:''},encoding:'utf8'});
  assert.match(output,/all four host SDK modules resolved/);
});
