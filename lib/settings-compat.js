import {readFileSync} from 'node:fs';
import {writeFile,rename,unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';

const namespace='memos-cloud';
const profiles=new Map();
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const snapshot=value=>typeof value?.get==='function'?value.get():value;
const conflict=()=>Object.assign(new Error('MemOS settings changed; reload before saving.'),{code:'SETTINGS_CONFLICT'});
function merge(base,over){
  const value=structuredClone(base);
  for(const [key,entry] of Object.entries(over))Object.defineProperty(value,key,{value:record(entry)&&record(value[key])?merge(value[key],entry):structuredClone(entry),enumerable:true,writable:true,configurable:true});
  return value;
}

/** A private adapter for this plugin. It never changes the host Settings service. */
export function createLegacySettings({native,schema,base={},home,parseDocument}){
  const file=join(home,'settings-legacy.yaml');
  let currentBase=structuredClone(base),validate,revision=0,previous,pending=Promise.resolve();
  function load(){
    let text='';
    try{text=readFileSync(file,'utf8');}catch(error){if(error.code!=='ENOENT')throw new Error('MemOS settings could not be read.');}
    const document=parseDocument(text);
    if(document.errors.length)throw new Error('MemOS settings document is invalid.');
    const user=document.get(namespace,true)?.toJSON?.()??{};
    if(!record(user))throw new Error('MemOS settings section is invalid.');
    const fingerprint=JSON.stringify([currentBase,user]);
    if(previous!==undefined&&previous!==fingerprint)revision++;
    previous=fingerprint;
    let value;
    try{value=snapshot(schema(merge(currentBase,user)));validate?.(value);}catch{throw new Error('MemOS settings did not pass validation.');}
    return {document,text,user,value};
  }
  const adapter={
    get documentPath(){return native.documentPath;},
    get writable(){return native.writable!==false;},
    get(ns){if(ns!==namespace)return undefined;return structuredClone(load().value);},
    describe(options){
      const {user,value}=load();
      const strip=input=>{const result=structuredClone(input);if(options?.redactSecrets)delete result.apiKey;return result;};
      return [{ns:namespace,revision,applies:'live',autoGenerate:false,schema:schema.toJSON?.(),value:strip(value),base:strip(snapshot(schema(currentBase))),user:strip(user),...(options?.redactSecrets?{secrets:[{path:['apiKey'],set:Boolean(value.apiKey)}]}:{})}];
    },
    register(ns,_schema,options={}){
      if(ns!==namespace)throw new Error('Unsupported MemOS settings namespace.');
      currentBase=structuredClone(snapshot(options.base??currentBase));validate=options.validate;
      load();
      return {get:()=>adapter.get(ns)};
    },
    mutate(ns,ops,expected){
      const operation=pending.then(async()=>{
        if(ns!==namespace||!adapter.writable)throw new Error('MemOS settings are not writable.');
        const {document,text,user}=load();
        if(expected!==revision)throw conflict();
        const next=structuredClone(user);
        for(const op of ops){
          if(!Array.isArray(op.path)||op.path.length!==1||!Object.hasOwn(schema.dict,op.path[0]))throw new Error('Unsupported MemOS settings field.');
          const key=op.path[0];
          if(op.op==='unset')delete next[key];
          else if(op.op==='set')Object.defineProperty(next,key,{value:structuredClone(op.value),enumerable:true,writable:true,configurable:true});
          else throw new Error('Unsupported MemOS settings operation.');
        }
        try{const value=snapshot(schema(merge(currentBase,next)));validate?.(value);}catch{throw new Error('MemOS settings did not pass validation.');}
        document.set(namespace,next);
        const temporary=file+'.memos-panel-'+randomUUID()+'.tmp';
        try{
          await writeFile(temporary,String(document),{mode:0o600,flag:'wx'});
          let latest='';try{latest=readFileSync(file,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
          if(latest!==text)throw conflict();
          await rename(temporary,file);
        }finally{try{await unlink(temporary);}catch(error){if(error.code!=='ENOENT')throw error;}}
        load();
      });
      pending=operation.catch(()=>{});
      return operation;
    },
  };
  return adapter;
}

export function settingsFor(ctx,schema){
  if(typeof ctx.settings.register==='function')return ctx.settings;
  const home=ctx.get('profileContext')?.home;
  if(typeof home!=='string')throw new Error('DSH profile home is unavailable.');
  const key=ctx.settings.documentPath;
  if(profiles.has(key))return profiles.get(key);
  const require=createRequire(import.meta.resolve('@memtensor/memos-cloud-dsh-plugin'));
  const {parseDocument}=require('yaml');
  const original=ctx.get('configEditor')?.entries?.().find(entry=>entry.options.id===namespace);
  const adapter=createLegacySettings({native:ctx.settings,schema,home,parseDocument,base:snapshot(schema(original?.options.config??{}))});
  profiles.set(key,adapter);
  return adapter;
}
