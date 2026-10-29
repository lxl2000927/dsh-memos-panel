import {FIELDS,DISPLAY_FIELDS,GROUPS,NAMESPACE,BASE_URL,PanelError,validateValues,validateBaseURL,publicValues} from './config.js';
import {PRIVACY_DEFAULTS,PRIVACY_FIELDS,PRIVACY_GROUP,validatePrivacy,inspectPayload} from './privacy.js';
import {privacyFor} from './privacy-store.js';
export const name = 'memos-panel';
export const inject = ['settings','webServer','connection'];
const API = '/memos-panel/api';
const limit = 128 * 1024;
function send(res,status,payload) {
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
  res.end(JSON.stringify(payload));
}
async function bodyOf(req) {
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new PanelError('请求内容过大。',413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw new PanelError('请求不是有效的 JSON。'); }
}
function descriptor(settings) {
  // Compatibility providers can append a legacy descriptor for the same
  // namespace. The same provider also owns mutate(), so its revision wins.
  return settings.describe({redactSecrets:true}).findLast(item=>item.ns === NAMESPACE);
}
function rawConfig(settings, desc) {
  return typeof settings.get === 'function' ? (settings.get(NAMESPACE) ?? desc?.value ?? {}) : (desc?.value ?? {});
}
function resetKeys(input) {
  const reset=input??[];
  const allowed=new Set([...FIELDS,...PRIVACY_FIELDS].map(field=>field.key));
  if(!Array.isArray(reset)||reset.length>allowed.size||reset.some(key=>!allowed.has(key)))throw new PanelError('恢复默认的字段无效。');
  return [...new Set(reset)];
}
export function createController({settings,credentials,privacy,fetcher=fetch}) {
  async function state() {
    const desc = descriptor(settings);
    const raw = rawConfig(settings,desc);
    const ref = raw.apiKeyEnv || 'MEMOS_API_KEY';
    const literal = typeof raw.apiKey === 'string' && Boolean(raw.apiKey.trim());
    let credential = {configured:false};
    if (!literal && typeof credentials?.describe === 'function') {
      try { credential = await credentials.describe(ref); } catch { /* status only */ }
    }
    const own=desc?.user??{};
    return {ok:true,version:'1.2.1',active:Boolean(desc),writable:settings.writable !== false,revision:desc?.revision ?? 0,
      values:{...publicValues(raw),...(privacy?privacy.store.value:{})},defaults:{...publicValues(desc?.base??{}),...(privacy?PRIVACY_DEFAULTS:{})},fields:privacy?[...PRIVACY_FIELDS,...DISPLAY_FIELDS]:DISPLAY_FIELDS,groups:privacy?[PRIVACY_GROUP,...GROUPS]:GROUPS,
      privacy:privacy?{...privacy.guard.state(),revision:privacy.store.revision,enabled:privacy.store.value.privacyEnabled}:undefined,
      customized:[...FIELDS.filter(field=>Object.hasOwn(own,field.key)).map(field=>field.key),...(privacy?PRIVACY_FIELDS.filter(field=>JSON.stringify(privacy.store.value[field.key])!==JSON.stringify(field.default)).map(field=>field.key):[])],
      hasApiKey:literal || credential.configured === true,
      keySource:literal ? '已保存的插件密钥' : credential.configured ? 'DSH 凭据或环境变量' : '尚未配置'};
  }
  async function save(body) {
    const desc = descriptor(settings);
    if (!desc) throw new PanelError('官方 MemOS 插件尚未加载，请先启用它。',409);
    if (settings.writable === false) throw new PanelError('当前 DSH 配置只读。',403);
    if (!Number.isInteger(body.revision) || body.revision < 0) throw new PanelError('缺少配置版本，请刷新页面。',409);
    const submitted=body.values??{};
    if(!submitted||typeof submitted!=='object'||Array.isArray(submitted))throw new PanelError('配置应为对象。');
    const privacyValues=validatePrivacy(Object.fromEntries(Object.entries(submitted).filter(([key])=>Object.hasOwn(PRIVACY_DEFAULTS,key))));
    const values = validateValues(Object.fromEntries(Object.entries(submitted).filter(([key])=>!Object.hasOwn(PRIVACY_DEFAULTS,key))));
    const allReset=resetKeys(body.resetFields);
    const reset=allReset.filter(key=>!Object.hasOwn(PRIVACY_DEFAULTS,key));
    for(const key of allReset.filter(key=>Object.hasOwn(PRIVACY_DEFAULTS,key))){if(Object.hasOwn(privacyValues,key))throw new PanelError('同一字段不能同时修改和恢复默认。');privacyValues[key]=structuredClone(PRIVACY_DEFAULTS[key]);}
    const privacyChanged=Object.keys(privacyValues).length>0;
    if(privacyChanged&&(!privacy||body.privacyRevision!==privacy.store.revision))throw new PanelError('隐私配置版本不一致，请重新载入。',409);
    if(reset.some(key=>Object.hasOwn(values,key)))throw new PanelError('同一字段不能同时修改和恢复默认。');
    const ops = Object.entries(values).map(([key,value])=> (value === null || (value === '' && ['userId','agentId','appId'].includes(key))) ? {op:'unset',path:[key]} : {op:'set',path:[key],value});
    ops.push(...reset.map(key=>({op:'unset',path:[key]})));
    if (body.apiKey !== undefined && (typeof body.apiKey !== 'string' || body.apiKey.length > 8192)) throw new PanelError('API Key 格式无效。');
    if (body.apiKey?.trim()) ops.push({op:'set',path:['apiKey'],value:body.apiKey.trim()});
    try { if(ops.length)await settings.mutate(NAMESPACE,ops,body.revision); }
    catch(error) {
      if (error?.code === 'SETTINGS_CONFLICT') throw new PanelError('配置已在其他窗口修改。请刷新后重试。',409);
      throw new PanelError('DSH 未接受这组配置，请检查字段类型以及 Agent 隔离与过滤条件是否冲突。');
    }
    if(privacyChanged){try{await privacy.save(privacyValues,body.privacyRevision);}catch{throw new PanelError('隐私配置未保存，请重新载入后重试。',409);}}
    return state();
  }
  async function test(body) {
    const desc = descriptor(settings);
    if (!desc) throw new PanelError('官方 MemOS 插件尚未加载。',409);
    const raw = rawConfig(settings,desc);
    const values = validateValues(Object.fromEntries(Object.entries(body.values??{}).filter(([key])=>!Object.hasOwn(PRIVACY_DEFAULTS,key))));
    const baseValues=publicValues(desc.base??{});
    const resetValues=Object.fromEntries(resetKeys(body.resetFields).filter(key=>!Object.hasOwn(PRIVACY_DEFAULTS,key)).map(key=>[key,baseValues[key]]));
    const config = {...raw,...resetValues,...values};
    const base = validateBaseURL(config.baseURL || BASE_URL);
    let key = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : raw.apiKey;
    if (!key && typeof credentials?.resolve === 'function') {
      try { key = (await credentials.resolve(config.apiKeyEnv || 'MEMOS_API_KEY'))?.value; } catch { /* no secret in errors */ }
    }
    if (typeof key !== 'string' || !key.trim()) throw new PanelError('请先填写 API Key，或配置相应的 DSH 凭据。');
    let probe={user_id:config.userId?.trim() || 'deepseek-harness-user',conversation_id:'dsh-memos-connection-test',query:'MemOS connectivity test',memory_limit_number:1,include_preference:false};
    if(privacy){try{if(privacy.store.error||!privacy.guard.active)throw new Error();probe=inspectPayload(probe,privacy.store.value).payload;}catch{throw new PanelError('本地隐私筛选已阻止测试；请检查筛选状态或用户 ID 是否含手机号、邮箱。');}}
    const started = Date.now();
    let response;
    try {
      response = await fetcher(`${base}/search/memory`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(5000),
        headers:{'content-type':'application/json','authorization':`Token ${key.trim()}`},
        body:JSON.stringify(probe)});
    } catch { throw new PanelError('无法连接 MemOS。请检查服务地址、网络和超时设置。',502); }
    if (!response.ok) throw new PanelError(response.status === 401 || response.status === 403 ? `鉴权未通过（HTTP ${response.status}），请核对密钥和项目权限。` : `MemOS 返回 HTTP ${response.status}。`,502);
    let result;
    try { result = await response.json(); } catch { throw new PanelError('服务返回了无法识别的响应。',502); }
    if (result?.code !== 0 && result?.code !== '0') throw new PanelError(`MemOS 返回错误码 ${Number.isFinite(Number(result?.code)) ? Number(result.code) : '未知'}。`,502);
    return {ok:true,latencyMs:Date.now()-started,message:'连接成功，鉴权与检索接口正常。测试没有写入记忆。'};
  }
  return {state,save,test};
}
export function registerRoutes(webServer,connection,controller) {
  const routes = [['/state','GET',()=>controller.state()],['/save','POST',body=>controller.save(body)],['/test','POST',body=>controller.test(body)]];
  const disposers = routes.map(([path,method,action])=>webServer.register({kind:'exact',path:API+path,handler:async(req,res)=>{
    if (typeof connection?.requestRejection !== 'function') { send(res,503,{ok:false,error:'DSH 连接校验服务不可用。'}); return; }
    let rejection;
    try { rejection=connection.requestRejection(req); } catch { rejection=403; }
    if (rejection !== undefined) {send(res,rejection,{ok:false,error:'请在已登录的 DSH 界面中操作。'});return;}
    if (req.method !== method) {send(res,405,{ok:false,error:'请求方法不受支持。'});return;}
    try {send(res,200,await action(method==='POST'?await bodyOf(req):{}));}
    catch(error) {send(res,error instanceof PanelError?error.status:500,{ok:false,error:error instanceof PanelError?error.message:'操作未完成，请刷新后重试。'});}
  }}));
  return ()=>disposers.forEach(dispose=>dispose?.());
}
export function apply(ctx) {
  const controller = createController({settings:ctx.settings,credentials:ctx.get('credentials'),privacy:privacyFor(ctx)});
  ctx.effect(()=>registerRoutes(ctx.webServer,ctx.connection,controller),'memos-panel: routes');
}
