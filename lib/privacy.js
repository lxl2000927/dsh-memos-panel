// All detection runs locally. No secret validation requests or content logging.
export const PRIVACY_DEFAULTS={privacyEnabled:true,blockCredentials:true,redactPhone:true,redactEmail:true,customBlockTerms:[],customRedactTerms:[]};
export const PRIVACY_FIELDS=[
  {key:'privacyEnabled',label:'启用本地隐私筛选',type:'boolean',default:true,hint:'同时检查召回和写回。筛选异常时跳过 MemOS 请求；关闭后不再过滤。'},
  {key:'blockCredentials',label:'密钥、密码与私钥整轮拦截',type:'boolean',default:true,hint:'任一当前消息命中凭据规则，该轮不写回；当前查询命中时也不召回。检测仍可能漏报或误报。'},
  {key:'redactPhone',label:'手机号脱敏',type:'boolean',default:true,hint:'替换中国大陆手机号（含 +86）及常见国际号码，不保留尾号。'},
  {key:'redactEmail',label:'邮箱脱敏',type:'boolean',default:true,hint:'将邮箱地址整体替换为 [邮箱已移除]。'},
  {key:'customBlockTerms',label:'自定义拦截词',type:'array',default:[],wide:true,rows:4,hint:'每行一个文本，忽略大小写；命中后拦截整轮。使用字面文本，不执行正则表达式。仅保存在本机。',placeholder:'客户名单\n未公开项目'},
  {key:'customRedactTerms',label:'自定义脱敏词',type:'array',default:[],wide:true,rows:4,hint:'每行一个文本，发送前替换为 [自定义信息已移除]；与拦截词冲突时优先拦截。仅保存在本机。',placeholder:'internal.example.test'},
].map(field=>({...field,group:'privacy'}));
export const PRIVACY_GROUP={id:'privacy',title:'本地隐私筛选',description:'密钥、密码和私钥整轮拦截；手机号、邮箱及自定义文本在本机处理。仅保护发往 MemOS 的内容。'};
const placeholders=/^\[(?:手机号|邮箱|自定义信息|敏感信息)已移除\]$/;
const privateKey=/-----\s*BEGIN\s+(?:[A-Z0-9 -]*\s)?PRIVATE\s+KEY\s*-----|PuTTY-User-Key-File-/i;
const provider=/(?:\bsk-(?:proj-|ant-(?:api\d+-|admin\d+-)?)?[A-Za-z0-9_-]{12,}|\bgh[pousr]_[A-Za-z0-9_]{12,}|\bgithub_pat_[A-Za-z0-9_]{12,}|\bmpg-[A-Za-z0-9_-]{12,}|\bAIza[A-Za-z0-9_-]{20,}|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bLTAI[A-Za-z0-9]{12,}|\bxox[baprs]-[A-Za-z0-9-]{12,}|\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,})/;
const credentialField=/(?:^|[\s{"'`,?&;])(?:api[ _-]?key|access[ _-]?(?:token|key|secret)|refresh[ _-]?token|client[ _-]?secret|secret[ _-]?key|private[ _-]?key|password|passwd|pwd|token|secret|key|authorization|cookie|set-cookie|密码|口令|密钥|令牌)["'\s]*(?:[:=：]|是|为)\s*["']?([^\s"'`,;&}\]]+)/i;
const sensitiveName=/^(?:api[_-]?key|access[_-]?(?:token|key|secret)|refresh[_-]?token|client[_-]?secret|secret[_-]?key|private[_-]?key|password|passwd|pwd|token|secret|authorization|cookie|set-cookie|密码|口令|密钥|令牌)$/i;
const bearer=/\b(?:Bearer|Basic)\s+[A-Za-z0-9+/_.=-]{6,}/i;
const database= /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqps?):\/\/[^\s/@:]+:[^\s/@]+@/i;
const phone=/(?<!\d)(?:(?:\+?86)[ -]?)?1[3-9](?:[ -]?\d){9}(?!\d)/g;
const internationalPhone=/\+\d[\d ()-]{6,}\d/g;
const email=/[\p{L}\p{N}.!#$%&'*+/=?^_`{|}~-]+@[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?(?:\.[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?)+/gu;
const identityFields=new Set(['user_id','agent_id','app_id','conversation_id','knowledgebase_ids','allow_knowledgebase_ids']);
const MAX_CHARS=2*1024*1024;
export class PrivacyBlocked extends Error{constructor(reason='privacy'){super('MemOS request blocked by local privacy filter');this.reason=reason;}}
export function validatePrivacy(input={}){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('隐私配置格式无效。');
  const result={};
  for(const [key,value] of Object.entries(input)){
    if(!Object.hasOwn(PRIVACY_DEFAULTS,key))throw new Error('包含未知的隐私配置字段。');
    if(Array.isArray(PRIVACY_DEFAULTS[key])){
      if(!Array.isArray(value)||value.length>64||value.some(term=>typeof term!=='string'||!term.trim()||term.length>256))throw new Error('自定义规则最多 64 项，每项 1–256 字符。');
      result[key]=[...new Set(value.map(term=>term.trim()))];
    }else{if(typeof value!=='boolean')throw new Error('隐私开关应为布尔值。');result[key]=value;}
  }
  return result;
}
const normalize=text=>text.normalize('NFKC').replace(/[\u200B-\u200D\u2060\uFEFF]/g,'');
function variants(text){
  const all=new Set([text,normalize(text)]);
  if(/%[0-9a-f]{2}/i.test(text)){try{all.add(normalize(decodeURIComponent(text)));}catch{}}
  if(/\\u[0-9a-f]{4}/i.test(text))all.add(normalize(text.replace(/\\u([0-9a-f]{4})/gi,(_,hex)=>String.fromCharCode(parseInt(hex,16)))));
  let count=0;
  for(const part of text.matchAll(/[A-Za-z0-9+/_-]{24,}={0,2}/g)){
    if(++count>128)throw new PrivacyBlocked('budget');
    if(part[0].length>32768)throw new PrivacyBlocked('budget');
    const decoded=Buffer.from(part[0],'base64').toString('utf8');
    if(!decoded.includes('\uFFFD')&&/[\x20-\x7e\u4e00-\u9fff]/.test(decoded))all.add(normalize(decoded));
  }
  return [...all];
}
function entropy(value){const counts=new Map();for(const c of value)counts.set(c,(counts.get(c)||0)+1);let total=0;for(const n of counts.values()){const p=n/value.length;total-=p*Math.log2(p);}return total;}
function secretReason(text){
  if(privateKey.test(text))return 'private-key';
  if(provider.test(text)||bearer.test(text)||database.test(text))return 'credential';
  const field=credentialField.exec(text);
  if(field&&!placeholders.test(field[1]))return 'credential';
  for(const item of text.matchAll(/(?<![A-Za-z0-9_-])[A-Za-z0-9_+/=-]{32,256}(?![A-Za-z0-9_-])/g)){
    if(/[a-zA-Z]/.test(item[0])&&/\d/.test(item[0])&&entropy(item[0])>=4.3)return 'suspicious-token';
  }
}
function replaceLiteral(text,term){
  const escaped=[...term].map(char=>'\\^$.*+?()[]{}|'.includes(char)?'\\'+char:char).join('');
  return text.replace(new RegExp(escaped,'giu'),'[自定义信息已移除]');
}
function redact(text,options){
  let result=text;
  if(options.redactEmail)result=result.replace(email,'[邮箱已移除]');
  if(options.redactPhone)result=result.replace(phone,'[手机号已移除]').replace(internationalPhone,match=>{const digits=match.replace(/\D/g,'');return digits.length>=7&&digits.length<=15?'[手机号已移除]':match;});
  for(const term of options.customRedactTerms)result=replaceLiteral(result,term);
  return result;
}
export function inspectPayload(payload,input=PRIVACY_DEFAULTS){
  const options={...PRIVACY_DEFAULTS,...validatePrivacy(input)};
  if(!options.privacyEnabled)return {payload:structuredClone(payload),redacted:0};
  const leaves=[];let size=0,nodes=0;
  function inspect(text,key=''){
    size+=text.length;if(size>MAX_CHARS||++nodes>20000)throw new PrivacyBlocked('budget');
    if(options.blockCredentials&&sensitiveName.test(key)&&text.trim()&&!placeholders.test(text.trim()))throw new PrivacyBlocked('credential');
    for(const candidate of variants(text)){
      if(options.customBlockTerms.some(term=>candidate.toLowerCase().includes(normalize(term).toLowerCase())))throw new PrivacyBlocked('custom');
      const reason=options.blockCredentials&&secretReason(candidate);if(reason)throw new PrivacyBlocked(reason);
    }
    leaves.push(text);
  }
  function scan(value,key=''){
    if(typeof value==='string'){inspect(value,key);return;}
    if(typeof value==='number'&&sensitiveName.test(key))inspect(String(value),key);
    if(Array.isArray(value)){for(const item of value)scan(item,key);return;}
    if(value&&typeof value==='object')for(const [name,item] of Object.entries(value)){inspect(name);scan(item,name);}
  }
  scan(payload);
  // Check adjacent text fragments as well as individual leaves, without keeping them.
  for(const combined of [leaves.join('\n'),leaves.join('')]){
    if(options.customBlockTerms.some(term=>normalize(combined).toLowerCase().includes(normalize(term).toLowerCase())))throw new PrivacyBlocked('custom');
    if(options.blockCredentials){const reason=secretReason(normalize(combined));if(reason)throw new PrivacyBlocked(reason);}
  }
  let redacted=0;const sanitizedLeaves=[];
  function transform(value,key='',identity=false){
    identity=identity||identityFields.has(key);
    if(typeof value==='string'){
      let result=redact(value,options);
      if(variants(result).some(candidate=>redact(candidate,options)!==candidate))result='[敏感信息已移除]';
      if(result!==value){if(identity)throw new PrivacyBlocked('identifier');redacted++;}
      sanitizedLeaves.push(result);return result;
    }
    if(Array.isArray(value))return value.map(item=>transform(item,key,identity));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([name,item])=>{
      if(redact(name,options)!==name)throw new PrivacyBlocked('field-name');
      return [name,transform(item,name,identity)];
    }));
    return value;
  }
  const safe=transform(payload);
  // A fragmented address/phone which survived per-field replacement is not sent.
  if(sanitizedLeaves.some(value=>redact(value,options)!==value)||redact(sanitizedLeaves.join(''),options)!==sanitizedLeaves.join(''))throw new PrivacyBlocked('fragmented-pii');
  return {payload:safe,redacted};
}

export class PrivacyGuard{
  constructor(store){this.store=store;this.blocked=new WeakSet();this.counts={blocked:0,redacted:0,errors:0};this.lastReason='';this.active=false;}
  begin(session){this.blocked.delete(session);}
  check(session,payload,final=false){
    try{
      if(this.store.error)throw new PrivacyBlocked('settings');
      if(this.blocked.has(session))throw new PrivacyBlocked('turn');
      const result=inspectPayload(payload,this.store.value);
      if(final)this.counts.redacted+=result.redacted;
      return result.payload;
    }catch(error){this.blocked.add(session);this.counts.blocked++;this.lastReason=error instanceof PrivacyBlocked?error.reason:'filter-error';if(!(error instanceof PrivacyBlocked))this.counts.errors++;throw new PrivacyBlocked(this.lastReason);}
  }
  screen(session,payload){try{this.check(session,payload);return true;}catch{return false;}}
  state(){return {active:this.active,...this.counts,lastReason:this.lastReason,error:Boolean(this.store.error)};}
}
