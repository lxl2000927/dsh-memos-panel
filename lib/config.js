export const NAMESPACE = 'memos-cloud';
export const BASE_URL = 'https://memos.memtensor.cn/api/openmem/v1';
const field = (key, label, type, value, group, extra = {}) => ({key, label, type, default: value, group, ...extra});
const NATIVE_FIELDS = [
  field('userId', '账号 / 用户 ID', 'text', '', '连接', {hint:'为自己设置稳定标识；跨设备使用相同 ID。这里无需填写登录密码。', placeholder:'例如：my-personal-memory'}),
  field('baseURL', 'API 服务地址', 'url', BASE_URL, '连接'),
  field('apiKeyEnv', '密钥引用名称', 'text', 'MEMOS_API_KEY', '连接', {hint:'已有环境变量或 DSH 凭据时使用此名称；也可以直接在上方填写 API Key。'}),
  field('recallEnabled', '回答前检索记忆', 'boolean', true, '记忆行为'),
  field('addEnabled', '对话完成后保存记忆', 'boolean', true, '记忆行为', {hint:'启用后，后续完成的对话会发送至配置的 MemOS 服务。'}),
  field('includeAssistant', '保存助手的回答', 'boolean', true, '记忆行为'),
  field('includeSubagents', '处理子智能体的会话', 'boolean', false, '记忆行为'),
  field('multiAgentMode', '按 Agent 预设隔离记忆', 'boolean', false, '记忆行为'),
  field('recallGlobal', '跨会话全局检索', 'boolean', false, '记忆行为', {hint:'开启后不优先关联当前会话。'}),
  field('asyncMode', '异步处理记忆写入', 'boolean', true, '记忆行为'),
  field('allowPublic', '允许写入项目公共记忆', 'boolean', false, '记忆行为', {hint:'公共记忆可供该 MemOS 项目下其他用户检索。'}),
  field('memoryLimitNumber', '事实记忆条数', 'number', 6, '检索与知识库', {min:1,max:25,step:1}),
  field('includePreference', '检索偏好记忆', 'boolean', true, '检索与知识库'),
  field('preferenceLimitNumber', '偏好记忆条数', 'number', 6, '检索与知识库', {min:1,max:25,step:1}),
  field('includeToolMemory', '检索并保存工具记忆', 'boolean', false, '检索与知识库', {hint:'启用后也会保存工具参数和文本结果。'}),
  field('toolMemoryLimitNumber', '工具记忆条数', 'number', 6, '检索与知识库', {min:1,max:25,step:1}),
  field('relativity', '最低相关性', 'number', 0.45, '检索与知识库', {min:0,max:1,step:0.05}),
  field('knowledgebaseIds', '检索知识库 ID', 'array', [], '检索与知识库', {hint:'多个 ID 用逗号或换行分隔；all 不能与具体 ID 混用。'}),
  field('tags', '写入标签', 'array', ['deepseek-harness'], '检索与知识库'),
  field('agentId', 'Agent ID', 'text', '', '检索与知识库', {hint:'未启用按预设隔离时，用于固定 Agent 的记忆分区。'}),
  field('appId', '应用 ID', 'text', '', '检索与知识库'),
  field('queryPrefix', '检索前缀', 'textarea', '', '高级'),
  field('filter', '检索过滤条件（JSON）', 'json', null, '高级', {hint:'可留空；使用 MemOS filter 格式。'}),
  field('info', '写入元数据（JSON）', 'json', {}, '高级', {hint:'对象中的值需为非空字符串。'}),
  field('allowKnowledgebaseIds', '允许写入的知识库 ID', 'array', [], '高级'),
  field('maxQueryChars', '检索输入字符上限', 'number', 4000, '高级', {min:1,max:100000,step:1}),
  field('maxRecallChars', '注入记忆字符总上限', 'number', 12000, '高级', {min:1,max:100000,step:1}),
  field('maxItemChars', '单条记忆字符上限', 'number', 2000, '高级', {min:1,max:100000,step:1}),
  field('maxMessageChars', '单条写入消息字符上限', 'number', 12000, '高级', {min:1,max:100000,step:1}),
  field('searchTimeoutMs', '检索超时（毫秒）', 'number', 5000, '高级', {min:100,max:5000,step:1}),
  field('timeoutMs', '请求超时（毫秒）', 'number', 5000, '高级', {min:100,max:180000,step:1}),
  field('syncAddTimeoutMs', '同步写入超时（毫秒）', 'number', 5000, '高级', {min:100,max:180000,step:1}),
  field('searchRetries', '检索额外重试次数', 'number', 1, '高级', {min:0,max:3,step:1}),
  field('addRetries', '写入额外重试次数', 'number', 0, '高级', {min:0,max:3,step:1}),
];
export const GROUPS = [
  {id:'connection',title:'连接与鉴权',description:'连接 MemOS 服务，设置密钥与长期记忆所属的用户。'},
  {id:'recall',title:'会话与召回',description:'决定回答前检索什么，以及向上下文注入多少记忆。'},
  {id:'capture',title:'写回与存储',description:'控制每轮完成后保存的内容、标签与处理方式。'},
  {id:'identity',title:'Agent 与共享',description:'按预设隔离记忆，管理应用标记与公共记忆。'},
  {id:'knowledge',title:'知识库与过滤',description:'限制可检索、可写入的知识库，以及精确筛选条件。'},
  {id:'requests',title:'超时与重试',description:'为检索和写入分别设置等待预算与重试次数。'},
];
const META = {
  userId:{group:'connection',hint:'记忆所属的稳定用户标识。跨会话、跨设备使用同一个 ID，即可使用同一份长期记忆；留空沿用宿主环境或官方默认标识。'},
  baseURL:{group:'connection',hint:'MemOS OpenMem API 根地址。云服务使用默认地址；自建兼容服务时可修改。',wide:true},
  apiKeyEnv:{group:'connection',hint:'当未直接填写 API Key 时，官方插件会按这个名称读取 DSH 凭据或启动环境。'},
  recallEnabled:{group:'recall',hint:'每轮直接用户请求的第一个模型步骤前，自动检索相关记忆。'},
  recallGlobal:{group:'recall',hint:'开启后不发送 conversation_id，跨该用户的全部记忆检索；关闭时优先关联当前会话。'},
  queryPrefix:{group:'recall',hint:'附加在当前问题前的检索文本，用于补充检索语境。它只影响查询，不会作为系统提示词保存。',wide:true,placeholder:'可留空，例如：优先检索用户偏好、项目决策与未完成事项'},
  memoryLimitNumber:{group:'recall',hint:'一次检索返回的事实记忆条数上限。更高的值会增加上下文占用。'},
  includePreference:{group:'recall',hint:'同时召回用户的显式或隐式偏好，例如回答风格、格式与习惯。'},
  preferenceLimitNumber:{group:'recall',hint:'一次检索返回的偏好记忆条数上限。',when:'includePreference',whenText:'开启“检索偏好记忆”后生效。'},
  includeToolMemory:{group:'recall',hint:'召回工具经验；写回时也允许采集关联的工具调用参数和文本结果。'},
  toolMemoryLimitNumber:{group:'recall',hint:'一次检索返回的工具经验条数上限。',when:'includeToolMemory',whenText:'开启“检索并保存工具记忆”后生效。'},
  relativity:{group:'recall',hint:'低于此相关性分数的记忆不参与召回。提高阈值会减少结果；0 表示不按相关性门槛过滤。',step:0.01},
  maxQueryChars:{group:'recall',hint:'发送到 MemOS 前，对检索问题进行截断。单位为字符。',unit:'字符'},
  maxRecallChars:{group:'recall',hint:'本轮注入模型上下文的全部召回记忆总长度预算。',unit:'字符',wide:true},
  maxItemChars:{group:'recall',hint:'单条召回记忆注入上下文时保留的最大长度。',unit:'字符'},
  addEnabled:{group:'capture',hint:'当前轮成功完成后，将本轮选定的消息发送到 MemOS 生成或更新记忆。'},
  includeAssistant:{group:'capture',hint:'除了用户消息，还保存本轮助手的文本回复。系统提示词和推理内容始终被排除。'},
  includeSubagents:{group:'capture',hint:'允许处理 origin 为 subagent 的子智能体会话；默认只处理直接用户会话。'},
  asyncMode:{group:'capture',hint:'等待云端接受写入后即可继续，精加工在后台完成。关闭后等待同步处理结果。'},
  maxMessageChars:{group:'capture',hint:'对每条待写入消息分别截断，限制单次采集内容的长度。',unit:'字符'},
  tags:{group:'capture',hint:'写入记忆时附带的分类标签。每行一项，也支持逗号分隔。',rows:3,placeholder:'deepseek-harness\nproject-research'},
  info:{group:'capture',hint:'写入时附带的业务元数据。使用 JSON 对象，每个值必须为非空字符串。',wide:true,placeholder:'{\n  "source": "desktop",\n  "project": "research"\n}'},
  multiAgentMode:{group:'identity',hint:'按当前会话的 Agent 预设生成 agent_id；切换预设时切换记忆分区。'},
  agentId:{group:'identity',hint:'固定的 Agent 标识；按预设隔离开启但会话没有预设时，也用它作为回退。',placeholder:'例如：research-assistant'},
  appId:{group:'identity',hint:'写入时标记记忆来自哪个应用。它不会自动成为检索过滤条件。',placeholder:'例如：dsh-desktop'},
  allowPublic:{group:'identity',hint:'允许本次写入生成的记忆进入项目公共记忆库，供该项目下其他用户检索。'},
  knowledgebaseIds:{group:'knowledge',hint:'检索时同时查询这些知识库。每行一个 ID；all 表示全部，不能与具体 ID 混用。',rows:4,placeholder:'kb-project\nkb-documentation'},
  allowKnowledgebaseIds:{group:'knowledge',hint:'限定生成的记忆允许写入哪些知识库。留空时不额外指定。',rows:4,placeholder:'kb-project'},
  filter:{group:'knowledge',hint:'按标签、时间、业务元数据等精确筛选。支持 and / or 与比较运算；按预设隔离时不要再固定 agent_id。',wide:true,placeholder:'{\n  "and": [{ "tags": { "contains": "research" } }]\n}'},
  timeoutMs:{group:'requests',hint:'兼容的基础 HTTP 超时。未单独配置检索或同步写入超时时，以此为回退值。',unit:'毫秒'},
  searchTimeoutMs:{group:'requests',hint:'检索总等待预算，包含重试和凭据读取，最多 5 秒。超时后继续正常回答。',unit:'毫秒'},
  syncAddTimeoutMs:{group:'requests',hint:'仅同步写入使用的单次 HTTP 超时，最多 180 秒。异步写入仍使用短超时。',unit:'毫秒',wide:true,unless:'asyncMode',whenText:'关闭“异步处理记忆写入”后生效。'},
  searchRetries:{group:'requests',hint:'首次检索失败后的额外重试次数；所有尝试共享检索总预算。',unit:'次'},
  addRetries:{group:'requests',hint:'首次写入失败后的额外重试次数。默认不重试，避免重复提交。',unit:'次'},
};
export const FIELDS=NATIVE_FIELDS.map(spec=>({...spec,...META[spec.key]}));
export const SECRET_FIELD={key:'apiKey',label:'MemOS API Key',type:'secret',group:'connection',wide:true,hint:'输入后通过 DSH 本地设置保存。留空保留现有密钥；保存后不回显。',placeholder:'粘贴 MemOS API Key'};
const DISPLAY_ORDER=[
  'apiKey','userId','apiKeyEnv','baseURL',
  'recallEnabled','recallGlobal','memoryLimitNumber','relativity','includePreference','preferenceLimitNumber',
  'includeToolMemory','toolMemoryLimitNumber','maxQueryChars','maxItemChars','maxRecallChars','queryPrefix',
  'addEnabled','includeAssistant','includeSubagents','asyncMode','tags','maxMessageChars','info',
  'multiAgentMode','allowPublic','agentId','appId',
  'knowledgebaseIds','allowKnowledgebaseIds','filter',
  'timeoutMs','searchTimeoutMs','searchRetries','addRetries','syncAddTimeoutMs',
];
export const DISPLAY_FIELDS=[SECRET_FIELD,...FIELDS].sort((a,b)=>DISPLAY_ORDER.indexOf(a.key)-DISPLAY_ORDER.indexOf(b.key));
const byKey = new Map(FIELDS.map(item => [item.key,item]));
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export class PanelError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function validateBaseURL(value) {
  let url;
  try { url = new URL(value); } catch { throw new PanelError('API 服务地址无效。'); }
  if (url.username || url.password || url.search || url.hash) throw new PanelError('API 地址不能包含账号、密码、查询参数或片段。');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) {
    throw new PanelError('API 地址请使用 HTTPS；本机调试地址允许 HTTP。');
  }
  return url.href.replace(/\/+$/,'');
}
export function validateValues(input) {
  if (!record(input)) throw new PanelError('配置应为对象。');
  const result = {};
  for (const [key,value] of Object.entries(input)) {
    const spec = byKey.get(key);
    if (!spec) throw new PanelError('包含不支持的配置字段。');
    if (spec.type === 'boolean') {
      if (typeof value !== 'boolean') throw new PanelError(`${spec.label}应为开关值。`);
      result[key] = value;
    } else if (spec.type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < spec.min || value > spec.max || (spec.step === 1 && !Number.isInteger(value))) throw new PanelError(`${spec.label}的取值范围为 ${spec.min}–${spec.max}。`);
      result[key] = value;
    } else if (spec.type === 'array') {
      if (!Array.isArray(value) || value.length > 100 || value.some(x=>typeof x !== 'string' || !x.trim() || x.length > 2000)) throw new PanelError(`${spec.label}应为非空字符串列表。`);
      result[key] = [...new Set(value.map(x=>x.trim()))];
    } else if (spec.type === 'json') {
      if (value !== null && !record(value)) throw new PanelError(`${spec.label}应为 JSON 对象。`);
      if (key === 'info' && (value === null || Object.values(value).some(x=>typeof x !== 'string' || !x.trim()))) throw new PanelError('写入元数据的值需为非空字符串。');
      result[key] = value;
    } else {
      if (typeof value !== 'string' || value.length > 20000) throw new PanelError(`${spec.label}的格式或长度无效。`);
      result[key] = key === 'baseURL' ? validateBaseURL(value) : value;
    }
  }
  if (result.apiKeyEnv !== undefined && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(result.apiKeyEnv)) throw new PanelError('密钥引用名称请使用字母、数字和下划线，且不能以数字开头。');
  if (result.knowledgebaseIds?.includes('all') && result.knowledgebaseIds.length > 1) throw new PanelError('all 不能与具体知识库 ID 混用。');
  return result;
}
export function publicValues(input = {}) {
  const result = Object.fromEntries(FIELDS.map(spec => [spec.key, structuredClone(input[spec.key] ?? spec.default)]));
  result.searchTimeoutMs = input.searchTimeoutMs ?? Math.min(input.timeoutMs ?? 5000,5000);
  result.syncAddTimeoutMs = input.syncAddTimeoutMs ?? input.timeoutMs ?? 5000;
  return result;
}
