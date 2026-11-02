const GROUPS=['facts','preferences','tools'];
const length=text=>Array.from(text).length;

// Exact text matching only: preserve case, numbers, signs and punctuation.
// Similar-looking facts can have opposite meanings or different dates.
export function deduplicateRecall(projection){
  if(!projection)return projection;
  let changed=false;const result={...projection};
  for(const group of GROUPS){
    if(!projection[group])continue;
    const seen=new Set();
    result[group]=projection[group].filter(item=>{
      const key=item.text.trim();
      if(seen.has(key)){changed=true;return false;}
      seen.add(key);return true;
    });
  }
  return changed?result:projection;
}

// Share a bounded text budget across categories. Within each category retain
// relevance order; unused quotas are redistributed to categories with demand.
export function fitRecallBudget(projection,maxChars){
  if(!projection||!Number.isInteger(maxChars))return projection;
  const groups=GROUPS.filter(group=>projection[group]?.length);
  const demand=Object.fromEntries(groups.map(group=>[group,projection[group].reduce((n,item)=>n+length(item.text),0)]));
  if(Object.values(demand).reduce((a,b)=>a+b,0)<=maxChars)return projection;
  if(maxChars<=0)return undefined;
  const budgets=Object.fromEntries(groups.map(group=>[group,0]));
  let remaining=maxChars,active=[...groups];
  while(remaining>0&&active.length){
    const share=Math.max(1,Math.floor(remaining/active.length));
    for(const group of active){const amount=Math.min(share,demand[group]-budgets[group],remaining);budgets[group]+=amount;remaining-=amount;}
    active=active.filter(group=>budgets[group]<demand[group]);
  }
  const result={facts:[],preferences:[]};
  for(const group of groups){
    let budget=budgets[group];const entries=[];
    for(const item of projection[group]){
      if(!budget)break;
      const chars=Array.from(item.text),text=chars.slice(0,budget).join('');budget-=length(text);
      if(text)entries.push(chars.length===length(text)?item:{...item,text});
    }
    if(entries.length||group!=='tools')result[group]=entries;
  }
  return result;
}

export function candidateBudget(config){
  const limit=config.maxRecallChars;
  return Math.max(limit,Math.min(limit*2,24000));
}

const formatOnly=text=>text.normalize('NFC').replace(/\s+/gu,'').replace(/[。！]+$/u,'');
const acknowledgement=/^(?:好的|好|收到|明白|了解|已记住|记住了|已记录|记录好了)(?:[，,。！!\s]+|[：:]|(?=(?:以下|这)?(?:[一二三四五六七八九十\d]+[项条])?(?:测试)?(?:事实|信息|资料|内容)[：:]))/u;
function acknowledgementBody(text){
  const trimmed=text.trim().replace(/^\*\*|\*\*$/g,'');
  const match=acknowledgement.exec(trimmed);if(!match)return undefined;
  let rest=trimmed.slice(match[0].length);
  // A short confirmation heading such as “已记录三项测试事实：”.
  if(!/[，,。！!\s：:]$/.test(match[0])){const colon=rest.search(/[：:]/);if(colon<0||colon>24)return undefined;rest=rest.slice(colon+1);}
  return rest;
}

export function compactWriteMessages(messages){
  if(!Array.isArray(messages))return messages;
  const users=messages.filter(m=>m.role==='user'&&typeof m.content==='string').map(m=>formatOnly(m.content));
  if(!users.length)return messages;
  return messages.filter(message=>{
    if(message.role!=='assistant'||typeof message.content!=='string'||message.tool_calls?.length||length(message.content)>800)return true;
    const body=acknowledgementBody(message.content);if(body===undefined)return true;
    const normalized=formatOnly(body);
    if(!normalized)return false;
    // Only discard content demonstrably already in a current user message.
    // No fuzzy matching: novel results, negations, dates and numbers survive.
    return !users.some(text=>text.includes(normalized));
  });
}

export function selectionMetadata(item){
  const result={};
  for(const key of ['createdAt','updatedAt']){
    const value=item[key];
    const valid=typeof value==='number'&&Number.isFinite(value)||typeof value==='string'&&/^\d{4}-\d{2}-\d{2}(?:[T ][0-9:.+Z-]+)?$/.test(value);
    if(valid){const time=new Date(value);if(Number.isFinite(time.getTime()))result[key]=time.toISOString();}
  }
  if(typeof item.relativity==='number'&&Number.isFinite(item.relativity))result.relevance=item.relativity;
  return result;
}
