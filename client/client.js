window.__ModuleLoader__.load({
  id:'dsh-memos-panel',
  factory:(require)=>{
    'use strict';
    const React=require('react');
    const h=React.createElement;
    const API='/memos-panel/api';
    const STYLE=`
.mmp{--mp-text:var(--dsw-alias-label-primary,#21312f);--mp-muted:var(--dsw-alias-label-tertiary,#75817f);--mp-line:var(--dsw-alias-border-primary,#e2e8e5);--mp-bg:var(--dsw-alias-background-primary,#fff);--mp-accent:#177f73;--mp-soft:color-mix(in srgb,var(--mp-accent) 5%,var(--mp-bg));color:var(--mp-text);font:14px/1.6 var(--dsw-font-family,system-ui,sans-serif);width:100%;max-width:1120px;padding:4px 0 22px;box-sizing:border-box;container-type:inline-size}
.mmp *{box-sizing:border-box}.mmp button,.mmp input,.mmp textarea{font:inherit}.mmp button{cursor:pointer}.mmp button:disabled{opacity:.45;cursor:default}.mmp button:focus-visible{outline:2px solid var(--mp-accent);outline-offset:3px}.mmp h2,.mmp h3,.mmp p{margin:0}.mmp h2{font-size:27px;line-height:1.25;letter-spacing:-.6px;font-weight:650}.mmp h3{font-size:17px;line-height:1.4;font-weight:650}.mmp-top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.mmp-brand{display:flex;align-items:center;gap:13px}.mmp-logo{width:43px;height:43px;display:grid;place-items:center;border-radius:12px;background:var(--mp-accent);color:#fff;font-size:24px;font-weight:750;flex:none}.mmp-eyebrow{font-size:10px;font-weight:650;color:var(--mp-accent);letter-spacing:1.8px;margin-bottom:5px!important}.mmp-sub{font-size:12px;color:var(--mp-muted);margin-top:7px!important;line-height:1.7}.mmp-status{display:flex;align-items:center;gap:7px;border:1px solid var(--mp-line);border-radius:99px;font-size:11px;white-space:nowrap;padding:5px 10px;margin-top:7px;color:var(--mp-muted)}.mmp-status i{width:6px;height:6px;border-radius:50%;background:#cba45e}.mmp-status[data-ready=true] i{background:var(--mp-accent)}
.mmp-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-bottom:20px;border:1px solid var(--mp-line);border-radius:12px;background:var(--mp-soft);padding:14px 0}.mmp-stat{padding:0 18px;border-right:1px solid var(--mp-line)}.mmp-stat:last-child{border:0}.mmp-stat span{font-size:11px;color:var(--mp-muted);display:block;margin-bottom:3px}.mmp-stat strong{font-size:15px;font-weight:600}.mmp-stat em{font-style:normal;font-size:11px;color:var(--mp-muted);margin-left:7px}
.mmp-toolbar{position:sticky;top:0;z-index:5;display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:var(--mp-bg);padding:12px 0 13px;border-bottom:1px solid var(--mp-line)}.mmp-search{display:flex;gap:8px;align-items:center;flex:1;min-width:170px;background:var(--mp-soft);border:1px solid var(--mp-line);border-radius:8px;padding:0 11px;color:var(--mp-muted)}.mmp-search svg{width:15px;height:15px;flex:none}.mmp-search input{border:0;background:transparent;color:var(--mp-text);width:100%;padding:9px 0;font-size:12px;outline:none;min-width:0}.mmp-search:focus-within{border-color:var(--mp-accent)}.mmp-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.mmp-btn{border:1px solid var(--mp-line);background:var(--mp-bg);color:var(--mp-text);border-radius:8px;padding:8px 12px;font-size:12px!important;line-height:1.5;white-space:nowrap}.mmp-btn:hover:not(:disabled){border-color:var(--mp-accent);color:var(--mp-accent)}.mmp-btn-primary{background:var(--mp-accent);border-color:var(--mp-accent);color:#fff}.mmp-btn-primary:hover:not(:disabled){background:#116c62;color:#fff}.mmp-filterbar{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:11px 0 8px;color:var(--mp-muted);font-size:11px}.mmp-filterbar label{display:flex;align-items:center;gap:6px;cursor:pointer}.mmp-filterbar input{accent-color:var(--mp-accent)}.mmp-groups{display:flex;gap:6px;flex-wrap:wrap;padding:3px 0 18px}.mmp-group-btn{border:1px solid transparent;background:transparent;color:var(--mp-muted);padding:6px 10px;border-radius:7px;font-size:12px!important}.mmp-group-btn[aria-pressed=true]{color:var(--mp-accent);background:var(--mp-soft);border-color:color-mix(in srgb,var(--mp-accent) 18%,var(--mp-line));font-weight:600}.mmp-group-btn small{font-size:10px;margin-left:6px;opacity:.75}
.mmp-sections{display:grid;gap:18px}.mmp-section{border:1px solid var(--mp-line);border-radius:14px;background:var(--mp-bg);padding:19px 20px 3px;min-width:0}.mmp-section-head{display:flex;gap:14px;justify-content:space-between;align-items:flex-start;margin-bottom:8px}.mmp-section-title{display:flex;gap:10px;align-items:center}.mmp-section-number{font:10px ui-monospace,Consolas,monospace;color:var(--mp-accent);border:1px solid var(--mp-line);border-radius:6px;padding:4px 6px;line-height:1}.mmp-section-desc{font-size:11px;color:var(--mp-muted);line-height:1.7;margin-top:6px!important}.mmp-section-tools{display:flex;align-items:center;gap:8px;flex:none}.mmp-text-btn{border:0;background:transparent;color:var(--mp-muted);font-size:11px!important;padding:3px 0}.mmp-text-btn:hover:not(:disabled){color:var(--mp-accent)}.mmp-collapse{border:1px solid var(--mp-line);background:var(--mp-bg);color:var(--mp-muted);width:24px;height:24px;border-radius:6px;font-size:15px!important;line-height:1}.mmp-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px}.mmp-field{padding:15px 0 16px;border-top:1px solid color-mix(in srgb,var(--mp-line) 75%,transparent);min-width:0}.mmp-field-wide{grid-column:1/-1}.mmp-field-heading{display:flex;align-items:center;justify-content:space-between;gap:7px;margin-bottom:4px}.mmp-field-heading label{font-size:13px;font-weight:600}.mmp-field-heading code{font:10px ui-monospace,Consolas,monospace;color:var(--mp-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mmp-field-desc{font-size:11px;line-height:1.75;color:var(--mp-muted);margin-bottom:10px!important}.mmp-input-wrap{display:flex;align-items:center;position:relative;min-width:0}.mmp-input,.mmp-textarea{width:100%;min-width:0;background:var(--mp-bg);color:var(--mp-text);border:1px solid var(--mp-line);border-radius:8px;padding:9px 11px;outline:none;font-size:12px!important;line-height:1.7}.mmp-input:focus,.mmp-textarea:focus{border-color:var(--mp-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--mp-accent) 10%,transparent)}.mmp-input[aria-invalid=true],.mmp-textarea[aria-invalid=true]{border-color:#be5a46}.mmp-textarea{resize:vertical;min-height:84px}.mmp-mono{font-family:ui-monospace,Consolas,monospace!important;line-height:1.65}.mmp-unit{font-size:10px;white-space:nowrap;position:absolute;right:25px;color:var(--mp-muted);pointer-events:none}.mmp-number{padding-right:60px}.mmp-secret{display:flex;gap:7px}.mmp-secret .mmp-input{flex:1}.mmp-field-foot{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;font-size:10px;color:var(--mp-muted);line-height:1.6;margin-top:7px;min-height:18px}.mmp-field-foot span{overflow-wrap:anywhere}.mmp-field-actions{display:flex;gap:10px;flex:none}.mmp-segment{display:flex;background:var(--mp-soft);padding:3px;border:1px solid var(--mp-line);border-radius:8px;gap:3px}.mmp-segment button{flex:1;border:0;background:transparent;border-radius:5px;color:var(--mp-muted);padding:6px;font-size:11px!important;line-height:1.5}.mmp-segment button[aria-pressed=true]{background:var(--mp-bg);color:var(--mp-accent);font-weight:600;box-shadow:0 1px 4px #0000000a}.mmp-pending{color:#a56b24!important}.mmp-field-error{font-size:11px;color:#b64d38;padding-top:7px}.mmp-dependency{display:block;font-size:10px;color:#a56b24;margin-top:6px}.mmp-notice{padding:11px 14px;margin:0 0 16px;border-radius:8px;font-size:12px;background:var(--mp-soft);border:1px solid var(--mp-line);color:var(--mp-accent);overflow-wrap:anywhere}.mmp-notice[role=alert]{background:color-mix(in srgb,#c05c43 5%,var(--mp-bg));color:#b54e38}.mmp-empty{border:1px dashed var(--mp-line);border-radius:12px;padding:32px 20px;text-align:center;color:var(--mp-muted);font-size:12px}.mmp-empty button{margin-top:12px}.mmp-bottom{padding:17px 2px 0;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--mp-muted);line-height:1.7}.mmp-links{display:flex;gap:14px;flex-wrap:wrap}.mmp-links a{color:var(--mp-muted);text-decoration:underline;text-underline-offset:3px}.mmp-draft-note{font-size:11px;color:var(--mp-muted)}
.mmp p{white-space:normal;overflow-wrap:anywhere}
@container(max-width:650px){.mmp-top{flex-wrap:wrap;margin-bottom:12px}.mmp h2{font-size:23px}.mmp-summary{padding:10px 0;margin-bottom:12px}.mmp-stat{padding:0 11px}.mmp-stat strong{font-size:13px}.mmp-stat em{display:none}.mmp-section{padding:16px 15px 3px}.mmp-section-head{flex-wrap:wrap;gap:8px}.mmp-section-tools{margin-left:auto}.mmp-field-heading{align-items:flex-start}.mmp-field-heading code{max-width:45%}.mmp-toolbar{gap:8px;padding:9px 0 10px}.mmp-groups{gap:3px;padding-bottom:12px}.mmp-group-btn{padding:6px 8px}.mmp-logo{width:38px;height:38px}.mmp-field-foot{flex-wrap:wrap}.mmp-btn{padding:8px 9px}}
@container(max-width:520px){.mmp-fields{grid-template-columns:1fr}.mmp-field-wide{grid-column:auto}.mmp-search{flex-basis:100%}.mmp-toolbar>.mmp-actions{width:100%}.mmp-btn-primary{margin-left:auto}.mmp-filterbar{flex-wrap:wrap}.mmp-filterbar>span{white-space:nowrap;flex:none}.mmp-filterbar>.mmp-actions{width:auto;margin-left:auto}}
`;
    async function request(path,body,signal){
      const response=await fetch(API+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',signal,
        headers:body===undefined?undefined:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
      let result;
      try{result=await response.json();}catch{throw new Error('DSH 未返回有效数据，请确认配置面板插件已加载。');}
      if(!response.ok||!result.ok)throw new Error(result.error||'操作没有完成。');
      return result;
    }
    function displayValue(field,value){
      if(field.type==='secret')return '';
      if(field.type==='array')return (value||[]).join('\n');
      if(field.type==='json')return value===null||value===undefined?'':JSON.stringify(value,null,2);
      if(field.type==='boolean')return Boolean(value);
      return value===undefined||value===null?'':String(value);
    }
    function shortValue(value){
      if(value===true)return '开';if(value===false)return '关';
      if(value===undefined||value===null||value==='')return '未设置';
      if(Array.isArray(value))return value.length?value.join('、'):'空列表';
      const text=typeof value==='object'?JSON.stringify(value):String(value);
      return text.length>65?text.slice(0,65)+'…':text;
    }
    function collect(fields,draft,dirty){
      const values={},errors={};
      for(const field of fields){
        if(field.type==='secret'||!dirty.has(field.key))continue;
        let value=draft[field.key];
        if(field.type==='number'){
          value=String(value).trim()===''?NaN:Number(value);
          if(!Number.isFinite(value)||value<field.min||value>field.max||(field.step===1&&!Number.isInteger(value))){errors[field.key]='请填写 '+field.min+'–'+field.max+' 之间的'+(field.step===1?'整数。':'数字。');continue;}
        }else if(field.type==='array')value=String(value).split(/[,，\n]/).map(x=>x.trim()).filter(Boolean);
        else if(field.type==='json'){
          try{value=String(value).trim()?JSON.parse(value):(field.key==='filter'?null:{});if(value!==null&&(typeof value!=='object'||Array.isArray(value)))throw new Error();}
          catch{errors[field.key]='请填写有效的 JSON 对象。';continue;}
        }
        values[field.key]=value;
      }
      return {values,errors};
    }
    function Field({field,value,base,changed,resetting,customized,disabled,error,change,reset,reportError,secret,setSecret,showSecret,toggleSecret,hasKey,keySource,draft}){
      const id='mmp-'+field.key;
      const shared={id,disabled,'aria-describedby':id+'-hint','aria-invalid':Boolean(error)};
      let control;
      if(field.type==='secret')control=h('div',{className:'mmp-secret'},h('input',{...shared,type:showSecret?'text':'password',className:'mmp-input',value:secret,autoComplete:'new-password',placeholder:hasKey?'输入新密钥可替换现有值':field.placeholder,onChange:e=>setSecret(e.target.value)}),h('button',{className:'mmp-btn',type:'button',disabled:disabled||!secret,onClick:toggleSecret,'aria-label':showSecret?'隐藏输入的密钥':'显示输入的密钥'},showSecret?'隐藏':'显示'));
      else if(field.type==='boolean'){
        const mode=resetting||(!customized&&!changed)?'default':value?'on':'off';
        control=h('div',{className:'mmp-segment',role:'group','aria-label':field.label},[['default','默认'],['on','开'],['off','关']].map(([kind,label])=>h('button',{type:'button',key:kind,disabled,'aria-pressed':mode===kind,onClick:()=>kind==='default'?reset(field):change(field.key,kind==='on')},label)));
      }else if(field.type==='json'||field.type==='textarea'||field.type==='array')control=h('textarea',{...shared,className:'mmp-textarea'+(field.type==='json'||field.type==='array'?' mmp-mono':''),rows:field.type==='json'?6:field.rows||3,value,placeholder:field.placeholder,spellCheck:false,onChange:e=>change(field.key,e.target.value)});
      else control=h('div',{className:'mmp-input-wrap'},h('input',{...shared,className:'mmp-input'+(field.unit?' mmp-number':''),type:field.type==='number'?'number':field.type==='url'?'url':'text',value,min:field.min,max:field.max,step:field.step,placeholder:field.placeholder,autoComplete:'off',onChange:e=>change(field.key,e.target.value)}),field.unit?h('span',{className:'mmp-unit'},field.unit):null);
      const pending=resetting?'待恢复默认':changed?'待保存':customized?'已覆盖':'跟随默认';
      const dependency=(field.when&&!draft[field.when])||(field.unless&&draft[field.unless]);
      return h('div',{className:'mmp-field'+(field.wide?' mmp-field-wide':''),'data-field':field.key},
        h('div',{className:'mmp-field-heading'},h('label',{htmlFor:field.type==='boolean'?undefined:id},field.label),h('code',{title:field.key},field.key)),
        h('p',{className:'mmp-field-desc',id:id+'-hint'},field.hint),control,
        h('div',{className:'mmp-field-foot'},h('span',{className:changed||resetting?'mmp-pending':''},field.type==='secret'?keySource+' · 保存后不回显':pending+' · 默认：'+shortValue(base)+(field.type==='boolean'?' · 当前：'+shortValue(value):field.type==='number'?' · 范围：'+field.min+'–'+field.max:'')),
          h('div',{className:'mmp-field-actions'},field.type==='json'?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>{try{change(field.key,JSON.stringify(JSON.parse(value),null,2));}catch{reportError(field.key,'请填写有效的 JSON 后再格式化。');}}},'格式化'):null,
            field.type==='json'&&field.placeholder?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>change(field.key,field.placeholder)},'填入示例'):null,
            field.type!=='boolean'&&field.type!=='secret'?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>reset(field),'aria-label':'恢复'+field.label+'默认'},'恢复默认'):null,
            field.type==='secret'&&secret?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>setSecret('')},'清空输入'):null)),
        dependency?h('span',{className:'mmp-dependency'},field.whenText):null,
        error?h('p',{className:'mmp-field-error',role:'alert'},error):null);
    }
    function Form(){
      const [data,setData]=React.useState(null),[draft,setDraft]=React.useState({}),[dirty,setDirty]=React.useState(()=>new Set()),[resets,setResets]=React.useState(()=>new Set());
      const [secret,setSecretState]=React.useState(''),[showSecret,setShowSecret]=React.useState(false),[group,setGroup]=React.useState('all'),[query,setQuery]=React.useState(''),[changedOnly,setChangedOnly]=React.useState(false);
      const [busy,setBusy]=React.useState(''),[notice,setNotice]=React.useState(null),[errors,setErrors]=React.useState({}),[collapsed,setCollapsed]=React.useState(()=>new Set());
      const alive=React.useRef(false),pending=React.useRef(null);
      function accept(result){setData(result);setDraft(Object.fromEntries(result.fields.map(field=>[field.key,displayValue(field,result.values[field.key])])));setDirty(new Set());setResets(new Set());setSecretState('');setShowSecret(false);setErrors({});}
      React.useEffect(()=>{
        alive.current=true;const abort=new AbortController();pending.current=abort;
        request('/state',undefined,abort.signal).then(result=>{if(alive.current)accept(result);}).catch(error=>{if(alive.current&&!abort.signal.aborted)setNotice({error:true,text:error.message});});
        return()=>{alive.current=false;pending.current?.abort();};
      },[]);
      function change(key,value){setDraft(current=>({...current,[key]:value}));setDirty(current=>new Set([...current,key]));setResets(current=>{const next=new Set(current);next.delete(key);return next;});setErrors(current=>{const next={...current};delete next[key];return next;});setNotice(null);}
      function setSecret(value){setSecretState(value);setNotice(null);}
      function resetFields(fields){
        const keys=fields.filter(field=>field.type!=='secret').map(field=>field.key);
        setDraft(current=>({...current,...Object.fromEntries(fields.filter(field=>field.type!=='secret').map(field=>[field.key,displayValue(field,data.defaults[field.key])]))}));
        setDirty(current=>new Set([...current].filter(key=>!keys.includes(key))));setResets(current=>new Set([...current,...keys]));setErrors(current=>Object.fromEntries(Object.entries(current).filter(([key])=>!keys.includes(key))));setNotice(null);
      }
      function discard(){if(data)accept(data);setNotice({error:false,text:'已放弃未保存的更改。'});}
      async function action(kind){
        if(busy)return;
        setNotice(null);const collected=kind==='refresh'?{values:{},errors:{}}:collect(data.fields,draft,dirty);
        setErrors(collected.errors);
        if(Object.keys(collected.errors).length){const first=data.fields.find(field=>collected.errors[field.key]);setGroup(first.group);setQuery('');setChangedOnly(false);setNotice({error:true,text:'有参数需要修正，请查看标出的字段。'});return;}
        const abort=new AbortController();pending.current?.abort();pending.current=abort;setBusy(kind);
        try{
          const result=await request(kind==='refresh'?'/state':kind==='save'?'/save':'/test',kind==='refresh'?undefined:{values:collected.values,resetFields:[...resets],revision:data.revision,...(secret.trim()?{apiKey:secret}:{})},abort.signal);
          if(!alive.current)return;
          if(kind==='refresh'||kind==='save')accept(result);
          setNotice({error:false,text:kind==='save'?'配置已保存，后续对话使用新参数。':kind==='refresh'?'已读取最新配置。':result.message+'（'+result.latencyMs+' ms）'});
        }catch(error){if(alive.current&&!abort.signal.aborted)setNotice({error:true,text:error.message});}
        finally{if(alive.current)setBusy('');}
      }
      const fields=data?.fields||[],groups=data?.groups||[],term=query.trim().toLocaleLowerCase();
      const changedCount=dirty.size+resets.size+(secret.trim()?1:0),disabled=Boolean(busy)||!data?.active||!data?.writable;
      const visible=fields.filter(field=>{
        if(group!=='all'&&field.group!==group)return false;
        if(changedOnly&&!dirty.has(field.key)&&!resets.has(field.key)&&!(field.type==='secret'&&secret.trim()))return false;
        return !term||[field.label,field.key,field.hint,groups.find(item=>item.id===field.group)?.title].join(' ').toLocaleLowerCase().includes(term);
      });
      return h('section',{className:'mmp','aria-label':'MemOS 记忆配置'},
        h('header',{className:'mmp-top'},h('div',null,h('div',{className:'mmp-brand'},h('span',{className:'mmp-logo','aria-hidden':true},'M'),h('div',null,h('p',{className:'mmp-eyebrow'},'MEMOS / DEEPSEEK HARNESS'),h('h2',null,'记忆设置'))),h('p',{className:'mmp-sub'},'连接、检索和存储，一处配置。完整展示官方 DSH 插件的 '+(fields.length||35)+' 项参数。')),h('span',{className:'mmp-status','data-ready':Boolean(data?.active&&data?.hasApiKey)},h('i',null),!data?'读取配置中':!data.active?'官方插件未加载':data.hasApiKey?'密钥已配置':'等待配置密钥')),
        h('div',{className:'mmp-summary','aria-label':'当前记忆状态'},h('div',{className:'mmp-stat'},h('span',null,'回答前召回'),h('strong',null,draft.recallEnabled?'已开启':'已关闭'),h('em',null,'关联长期记忆')),h('div',{className:'mmp-stat'},h('span',null,'完成后写回'),h('strong',null,draft.addEnabled?'已开启':'已关闭'),h('em',null,'保存本轮消息')),h('div',{className:'mmp-stat'},h('span',null,'配置范围'),h('strong',null,'6 个分组'),h('em',null,'全部原生参数'))),
        h('div',{className:'mmp-toolbar'},h('label',{className:'mmp-search'},h('svg',{viewBox:'0 0 20 20',fill:'none','aria-hidden':true},h('circle',{cx:8.5,cy:8.5,r:5.5,stroke:'currentColor',strokeWidth:1.5}),h('path',{d:'m13 13 4 4',stroke:'currentColor',strokeWidth:1.5})),h('input',{type:'search',value:query,onChange:e=>setQuery(e.target.value),placeholder:'搜索参数、用途或字段名','aria-label':'搜索设置参数'})),h('div',{className:'mmp-actions'},h('button',{className:'mmp-btn',type:'button',disabled:Boolean(busy),onClick:()=>action('refresh')},busy==='refresh'?'读取中…':'重新载入'),h('button',{className:'mmp-btn',type:'button',disabled,onClick:()=>action('test')},busy==='test'?'测试中…':'测试连接'),h('button',{className:'mmp-btn mmp-btn-primary',type:'button',disabled:disabled||!changedCount,onClick:()=>action('save')},busy==='save'?'保存中…':'保存配置'+(changedCount?' · '+changedCount:'')))),
        h('div',{className:'mmp-filterbar'},h('span',null,'显示 '+visible.length+' / '+(fields.length||35)+' 项'+(changedCount?' · '+changedCount+' 项待保存':'')),h('div',{className:'mmp-actions'},changedCount?h('button',{className:'mmp-text-btn',type:'button',disabled:Boolean(busy),onClick:discard},'放弃更改'):null,h('label',null,h('input',{type:'checkbox',checked:changedOnly,onChange:e=>setChangedOnly(e.target.checked)}),'仅看待保存'))),
        h('nav',{className:'mmp-groups','aria-label':'参数分组'},h('button',{className:'mmp-group-btn',type:'button','aria-pressed':group==='all',onClick:()=>setGroup('all')},'全部参数',h('small',null,fields.length||35)),groups.map(item=>h('button',{className:'mmp-group-btn',type:'button',key:item.id,'aria-pressed':group===item.id,onClick:()=>setGroup(item.id)},item.title,h('small',null,fields.filter(field=>field.group===item.id).length)))),
        notice?h('p',{className:'mmp-notice',role:notice.error?'alert':'status'},notice.text):null,
        !data?h('div',{className:'mmp-empty'},'正在读取插件配置…'):!visible.length?h('div',{className:'mmp-empty'},changedOnly?'当前筛选下没有待保存的参数。':'没有找到匹配的参数。',h('div',null,h('button',{type:'button',className:'mmp-btn',onClick:()=>{setQuery('');setGroup('all');setChangedOnly(false);}},'显示全部参数'))):h('div',{className:'mmp-sections'},groups.map((item,index)=>{
          const groupFields=visible.filter(field=>field.group===item.id);if(!groupFields.length)return null;
          const closed=collapsed.has(item.id)&&!term&&!changedOnly;
          return h('section',{className:'mmp-section',key:item.id,'aria-label':item.title},h('header',{className:'mmp-section-head'},h('div',null,h('div',{className:'mmp-section-title'},h('span',{className:'mmp-section-number'},String(index+1).padStart(2,'0')),h('h3',null,item.title)),h('p',{className:'mmp-section-desc'},item.description)),h('div',{className:'mmp-section-tools'},h('button',{className:'mmp-text-btn',type:'button',disabled,onClick:()=>resetFields(fields.filter(field=>field.group===item.id)),'aria-label':'恢复'+item.title+'默认'},'恢复本组默认'),h('button',{className:'mmp-collapse',type:'button','aria-expanded':!closed,'aria-controls':'mmp-fields-'+item.id,'aria-label':(closed?'展开':'收起')+item.title,onClick:()=>setCollapsed(current=>{const next=new Set(current);if(next.has(item.id))next.delete(item.id);else next.add(item.id);return next;})},closed?'+':'−'))),!closed?h('div',{className:'mmp-fields',id:'mmp-fields-'+item.id},groupFields.map(field=>h(Field,{key:field.key,field,value:draft[field.key],base:data.defaults[field.key],changed:dirty.has(field.key),resetting:resets.has(field.key),customized:data.customized.includes(field.key),disabled,error:errors[field.key],change,reset:field=>resetFields([field]),reportError:(key,text)=>setErrors(current=>({...current,[key]:text})),secret,setSecret,showSecret,toggleSecret:()=>setShowSecret(value=>!value),hasKey:data.hasApiKey,keySource:data.keySource,draft}))):null);
        })),
        h('footer',{className:'mmp-bottom'},h('div',null,h('p',null,'默认与重置会跟随宿主继承值，点击“保存配置”后生效。密钥留空会保留原值。'),h('p',null,'连接测试使用固定测试语句，不写入记忆、不展示已有内容。')),h('nav',{className:'mmp-links','aria-label':'MemOS 官方链接'},h('a',{href:'https://memos-dashboard.openmem.net/cn/apikeys/',target:'_blank',rel:'noreferrer'},'获取 API Key ↗'),h('a',{href:'https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin/blob/main/packages/dsh/README.zh.md',target:'_blank',rel:'noreferrer'},'参数说明 ↗'))));
    }
    function apply(ctx){
      ctx.effect(()=>{const style=document.createElement('style');style.dataset.memosPanel='1';style.textContent=STYLE;document.head.appendChild(style);return()=>style.remove();},'memos-panel: styles');
      ctx.effect(()=>ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'memos',order:19,label:()=> 'MemOS 记忆',inject:()=>({})},Form)),'memos-panel: settings page');
    }
    return {apply,inject:['slots']};
  }
});
