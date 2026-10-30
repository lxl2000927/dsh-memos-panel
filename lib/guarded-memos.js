import {createRequire} from 'node:module';
import {Config,inject as upstreamInject,installMemosLifecycle,MemosClientError} from '../vendor/memos-cloud-0.1.2.js';
import {privacyFor} from './privacy-store.js';
import {settingsFor} from './settings-compat.js';
const require=createRequire(import.meta.url);
export {Config};
export const name='memos-cloud';
export const inject=[...upstreamInject,'settings'];
export function installGuardedLifecycle(ctx,config,privacy,{fetcher=globalThis.fetch,...dependencies}={}){
  const {guard}=privacy;
  const runtime=installMemosLifecycle(ctx,config,{
    ...dependencies,
    onTurnStart:session=>guard.begin(session),
    screenQuery:(session,query)=>guard.screen(session,query),
    screenTurn:(session,messages)=>guard.screen(session,messages),
    redactText:(session,text)=>{try{return guard.check(session,text,true);}catch{return '[敏感信息已移除]';}},
    transformSearchConfig:(session,current)=>({...current,queryPrefix:guard.check(session,current.queryPrefix,true)}),
    fetchFor:(_config,_operation,session)=>async(url,options)=>{
      let safe;
      try{safe=guard.check(session,JSON.parse(options.body),true);}catch{throw new MemosClientError('MemOS local privacy filter blocked this turn',{kind:'privacy'});}
      return fetcher(url,{...options,body:JSON.stringify(safe)});
    },
  });
  const activation=Symbol('memos lifecycle');
  guard.activation=activation;guard.active=true;
  ctx.effect(()=>()=>{if(guard.activation===activation)guard.active=false;},'memos-panel: privacy status');
  return runtime;
}
export function apply(ctx,config){
  if(require('@memtensor/memos-cloud-dsh-plugin/package.json').version!=='0.1.2')throw new Error('Privacy adapter requires MemOS DSH plugin 0.1.2; memory requests remain stopped.');
  const original=ctx.get('configEditor')?.entries?.().find(entry=>entry.options.id==='memos-cloud');
  const current=typeof config?.get==='function'?config.get():config;
  installGuardedLifecycle(ctx,{...current,...structuredClone(original?.options.config??{})},privacyFor(ctx),{settings:settingsFor(ctx,Config)});
}
