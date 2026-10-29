import {readFileSync,mkdirSync} from 'node:fs';
import {writeFile,rename} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {PRIVACY_DEFAULTS,validatePrivacy,PrivacyGuard} from './privacy.js';
const states=new Map();
export function privacyFor(ctx){
  const document=ctx.settings?.documentPath;
  if(typeof document!=='string')throw new Error('DSH profile settings path is unavailable');
  const path=join(dirname(document),'memos-panel.privacy.json');
  if(states.has(path))return states.get(path);
  let value=structuredClone(PRIVACY_DEFAULTS),error=false,revision=0;
  try{const saved=JSON.parse(readFileSync(path,'utf8'));if(saved.version!==1||!Number.isInteger(saved.revision)||saved.revision<0||!saved.values)throw new Error('Invalid privacy configuration');value={...value,...validatePrivacy(saved.values)};revision=saved.revision;}catch(cause){if(cause.code!=='ENOENT')error=true;}
  const store={value,error,revision,path};
  const guard=new PrivacyGuard(store);let pending=Promise.resolve();
  const result={store,guard,save(values,expected){
    const operation=pending.then(async()=>{
      if(expected!==store.revision)throw new Error('隐私配置已在其他窗口修改，请重新载入。');
      const next={...store.value,...validatePrivacy(values)};
      mkdirSync(dirname(path),{recursive:true});
      await writeFile(path+'.tmp',JSON.stringify({version:1,revision:store.revision+1,values:next},null,2)+'\n',{mode:0o600});
      await rename(path+'.tmp',path);
      store.value=next;store.revision++;store.error=false;
    });
    pending=operation.catch(()=>{});return operation;
  }};
  states.set(path,result);return result;
}
