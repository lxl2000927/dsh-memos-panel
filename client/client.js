window.__ModuleLoader__.load({
  id:'dsh-memos-panel',
  factory:(require)=>{
    'use strict';
    const React=require('react');
    const h=React.createElement;
    const API='/memos-panel/api';
    const STYLE=".mmp {\n  --mp-text: var(--dsw-alias-label-primary, #202b33);\n  --mp-bg: var(--dsw-alias-background-primary, #fff);\n  --mp-muted: color-mix(in srgb, var(--mp-text) 74%, var(--mp-bg));\n  --mp-line: color-mix(in srgb, var(--mp-text) 13%, var(--mp-bg));\n  --mp-accent: #177f73;\n  --mp-soft: color-mix(in srgb, var(--mp-accent) 6%, var(--mp-bg));\n  width: 100%; max-width: 1120px; padding: 2px 0 20px; box-sizing: border-box;\n  color: var(--mp-text); font: 15px/1.6 \"Microsoft YaHei UI\", \"Microsoft YaHei\", \"Segoe UI\", \"PingFang SC\", sans-serif;\n  container-type: inline-size;\n}\n.mmp *, .mmp *::before, .mmp *::after { box-sizing: border-box; }\n.mmp * { font-family: inherit !important; }\n.mmp button, .mmp input, .mmp textarea, .mmp select { font: inherit; }\n.mmp button { cursor: pointer; }\n.mmp button:disabled { opacity: .48; cursor: default; }\n.mmp button:focus-visible, .mmp select:focus-visible { outline: 2px solid var(--mp-accent); outline-offset: 3px; }\n.mmp h2, .mmp h3, .mmp p { margin: 0; }\n.mmp-top { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }\n.mmp-brand { display: flex; align-items: center; gap: 10px; }\n.mmp-logo { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--mp-accent); color: #fff; font-size: 21px; font-weight: 700; }\n.mmp h2 { font-size: 24px; font-weight: 650; line-height: 1.35; letter-spacing: 0; }\n.mmp-sub { margin-top: 7px !important; font-size: 14px; color: var(--mp-muted); }\n.mmp-status { display: inline-flex; align-items: center; gap: 6px; flex: none; border: 1px solid var(--mp-line); padding: 4px 9px; border-radius: 20px; font-size: 12px; margin-top: 4px; color: var(--mp-muted); }\n.mmp-status i, .mmp-stat i { width: 6px; height: 6px; border-radius: 50%; background: #a08147; flex: none; }\n.mmp-status[data-ready=true] i, .mmp-stat[data-on=true] i { background: var(--mp-accent); }\n.mmp-summary { display: flex; flex-wrap: wrap; gap: 7px 18px; padding: 8px 12px; margin-bottom: 6px; border-radius: 9px; background: var(--mp-soft); }\n.mmp-stat { display: flex; gap: 6px; align-items: center; font-size: 13px; }\n.mmp-stat span { color: var(--mp-muted); }\n.mmp-stat strong { font-size: 13px; font-weight: 600; }\n.mmp-toolbar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 8px; background: var(--mp-bg); padding: 10px 0; border-bottom: 1px solid var(--mp-line); }\n.mmp-search { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 120px; border: 1px solid var(--mp-line); border-radius: 8px; padding: 0 10px; background: var(--mp-bg); }\n.mmp-search svg { width: 16px; height: 16px; color: var(--mp-muted); flex: none; }\n.mmp-search input { min-width: 0; width: 100%; padding: 8px 0; border: 0; outline: none; background: transparent; color: var(--mp-text); font-size: 14px; line-height: 22px; }\n.mmp-search:focus-within { border-color: var(--mp-accent); box-shadow: 0 0 0 2px var(--mp-soft); }\n.mmp-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }\n.mmp-btn { min-height: 38px; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--mp-line); color: var(--mp-text); background: var(--mp-bg); font-size: 14px !important; line-height: 22px; white-space: nowrap; }\n.mmp-btn:hover:not(:disabled) { border-color: var(--mp-accent); color: var(--mp-accent); }\n.mmp-btn-primary { background: var(--mp-accent); color: #fff; border-color: var(--mp-accent); }\n.mmp-btn-primary:hover:not(:disabled) { background: #116b61; color: #fff; }\n.mmp-categories { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 0 8px; }\n.mmp-category-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 0; min-height: 32px; padding: 4px 8px; border: 1px solid var(--mp-line); border-radius: 7px; color: var(--mp-muted); background: var(--mp-bg); font-size: 13px !important; line-height: 20px; white-space: nowrap; transition: background-color .16s ease, border-color .16s ease, color .16s ease; }\n.mmp-category-btn:hover { color: var(--mp-accent); border-color: color-mix(in srgb, var(--mp-accent) 40%, var(--mp-line)); background: var(--mp-soft); }\n.mmp-category-btn[aria-pressed=true] { color: var(--mp-accent); border-color: color-mix(in srgb, var(--mp-accent) 50%, var(--mp-line)); background: var(--mp-soft); }\n.mmp-category-count { font-size: 11px; line-height: 18px; font-variant-numeric: tabular-nums; opacity: .8; }\n.mmp-change-filter { display: flex; gap: 6px; align-items: center; font-size: 13px; color: var(--mp-muted); cursor: pointer; white-space: nowrap; }\n.mmp-change-filter input { accent-color: var(--mp-accent); }\n.mmp-view-meta { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; font-size: 12px; color: var(--mp-muted); }\n.mmp-view-meta > .mmp-actions { margin-left: auto; }\n.mmp-text-btn { border: 0; padding: 3px 2px; background: transparent; color: var(--mp-muted); font-size: 13px !important; line-height: 1.5; white-space: nowrap; }\n.mmp-text-btn:hover:not(:disabled) { color: var(--mp-accent); }\n.mmp-sections { display: grid; gap: 12px; }\n.mmp-section { min-width: 0; border: 1px solid var(--mp-line); border-radius: 12px; padding: 0; overflow: hidden; background: var(--mp-bg); transition: border-color .2s ease, box-shadow .2s ease; }\n.mmp-section[data-collapsed=false] { border-color: color-mix(in srgb, var(--mp-accent) 24%, var(--mp-line)); box-shadow: 0 3px 12px #00000005; }\n.mmp-section:hover { border-color: color-mix(in srgb, var(--mp-accent) 40%, var(--mp-line)); }\n.mmp-section-heading { margin: 0 !important; }\n.mmp-section-trigger { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%; min-height: 48px; border: 0; padding: 9px 14px; color: var(--mp-text); background: transparent; text-align: left; user-select: none; transition: background-color .18s ease; }\n.mmp-section-trigger[aria-expanded=true] { background: color-mix(in srgb, var(--mp-accent) 4%, var(--mp-bg)); }\n.mmp-section-trigger:hover { background: var(--mp-soft); }\n.mmp-section-trigger:active { background: color-mix(in srgb, var(--mp-accent) 10%, var(--mp-bg)); }\n.mmp-section-trigger:focus-visible { outline-offset: -3px; border-radius: 11px; }\n.mmp-section-trigger:hover .mmp-collapse-label { color: var(--mp-accent); }\n.mmp-trigger-title { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 17px; font-weight: 650; }\n.mmp-section-count { padding: 1px 7px; border: 1px solid var(--mp-line); border-radius: 20px; font-size: 12px; font-weight: 400; color: var(--mp-muted); background: var(--mp-bg); white-space: nowrap; }\n.mmp-section-pending, .mmp-pending { color: #a66b1c; font-size: 12px; font-weight: 500; }\n.mmp-collapse-label { display: inline-flex; align-items: center; justify-content: flex-end; gap: 7px; min-width: 70px; font-size: 13px; font-weight: 400; color: var(--mp-muted); white-space: nowrap; }\n.mmp-chevron { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 8px; border: 1px solid var(--mp-line); background: var(--mp-bg); transition: background-color .2s ease, border-color .2s ease; }\n.mmp-collapse-label svg { width: 16px; height: 16px; transition: transform 260ms cubic-bezier(.22, 1, .36, 1); }\n.mmp-section-trigger[aria-expanded=true] .mmp-collapse-label { color: var(--mp-accent); }\n.mmp-section-trigger[aria-expanded=true] .mmp-chevron { background: var(--mp-soft); border-color: color-mix(in srgb, var(--mp-accent) 25%, var(--mp-line)); }\n.mmp-section-trigger[aria-expanded=true] .mmp-collapse-label svg { transform: rotate(-180deg); }\n.mmp-disclosure { display: grid; grid-template-rows: 1fr; opacity: 1; visibility: visible; transition: grid-template-rows 260ms cubic-bezier(.22, 1, .36, 1), opacity 180ms ease 30ms, visibility 0s linear; }\n.mmp-disclosure[data-closed=true] { grid-template-rows: 0fr; opacity: 0; visibility: hidden; pointer-events: none; transition-delay: 0s, 0s, 260ms; }\n.mmp-disclosure-clip { min-height: 0; overflow: hidden; }\n.mmp-section-content { padding: 10px 14px 0; }\n.mmp-section-desc { font-size: 14px; color: var(--mp-muted); line-height: 1.65; padding: 0 0 8px; }\n.mmp-section-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding-bottom: 8px; }\n.mmp-section-actions > .mmp-text-btn:last-child { margin-left: auto; }\n.mmp-section-meta-compact:not([hidden]) { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: start; }\n.mmp-fields { display: grid; grid-template-columns: 1fr; }\n.mmp-field { min-width: 0; padding: 14px 0; border-top: 1px solid var(--mp-line); }\n.mmp-field-heading { display: flex; gap: 12px; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }\n.mmp-field-title { display: flex; flex: 1 1 45%; min-width: 0; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; }\n.mmp-field-heading label { font-size: 15px; font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }\n.mmp-field-heading .mmp-pending { flex: none; }\n.mmp-field-key { display: block; flex: 0 1 auto; max-width: 55%; min-width: 0; margin: 0; padding: 0; color: var(--mp-muted); font-family: \"Cascadia Code\", Consolas, monospace !important; font-size: 12px; font-weight: 400; line-height: 1.6; text-align: right; overflow-wrap: anywhere; user-select: text; }\n.mmp-field-desc { color: var(--mp-muted); font-size: 14px; line-height: 1.65; overflow-wrap: anywhere; }\n.mmp-field-control { min-width: 0; margin-top: 10px; }\n.mmp-input-wrap { display: flex; align-items: center; position: relative; min-width: 0; }\n.mmp-input, .mmp-textarea { width: 100%; min-width: 0; padding: 9px 11px; border: 1px solid var(--mp-line); border-radius: 8px; background: var(--mp-bg); color: var(--mp-text); outline: none; font-size: 15px !important; line-height: 1.55; }\n.mmp-input::placeholder, .mmp-textarea::placeholder { color: color-mix(in srgb, var(--mp-text) 53%, var(--mp-bg)); opacity: 1; }\n.mmp-input:focus, .mmp-textarea:focus { border-color: var(--mp-accent); box-shadow: 0 0 0 2px var(--mp-soft); }\n.mmp-input[aria-invalid=true], .mmp-textarea[aria-invalid=true] { border-color: #b85343; }\n.mmp-textarea { min-height: 88px; resize: vertical; }\n.mmp-mono { font-family: \"Cascadia Code\", Consolas, \"Microsoft YaHei UI\", monospace !important; font-size: 13px !important; line-height: 1.7; }\n.mmp-unit { position: absolute; right: 26px; font-size: 12px; color: var(--mp-muted); pointer-events: none; }\n.mmp-number { padding-right: 66px; font-variant-numeric: tabular-nums; }\n.mmp-secret { display: flex; align-items: stretch; gap: 8px; }\n.mmp-secret .mmp-input { flex: 1; }\n.mmp-field-foot { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-top: 7px; color: var(--mp-muted); font-size: 12px; line-height: 1.6; }\n.mmp-field-foot > span { overflow-wrap: anywhere; min-width: 0; }\n.mmp-field-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; flex: none; }\n.mmp-segment { display: flex; gap: 2px; padding: 3px; border: 1px solid var(--mp-line); border-radius: 8px; background: var(--mp-soft); min-height: 39px; }\n.mmp-segment button { flex: 1; border: 0; border-radius: 5px; background: transparent; color: var(--mp-muted); padding: 5px 7px; font-size: 13px !important; white-space: nowrap; }\n.mmp-segment button:first-child { flex: 1.6; }\n.mmp-segment button[aria-pressed=true] { color: var(--mp-accent); background: var(--mp-bg); box-shadow: 0 1px 3px #00000010; font-weight: 600; }\n.mmp-field-error { color: #b34d3b; font-size: 13px; margin-top: 7px !important; }\n.mmp-dependency { display: block; margin-top: 7px; color: #946320; font-size: 13px; }\n.mmp-configure { color: var(--mp-accent); margin-top: 3px; }\n.mmp-notice { padding: 10px 12px; margin: 0 0 12px !important; border-radius: 8px; border: 1px solid var(--mp-line); background: var(--mp-soft); font-size: 14px; overflow-wrap: anywhere; }\n.mmp-notice[role=alert] { color: #b34d3b; background: color-mix(in srgb, #bd5441 6%, var(--mp-bg)); }\n.mmp-empty { padding: 30px 16px; text-align: center; border: 1px dashed var(--mp-line); border-radius: 10px; color: var(--mp-muted); font-size: 14px; }\n.mmp-empty button { margin-top: 12px; }\n.mmp-bottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; margin-top: 16px; color: var(--mp-muted); font-size: 12px; }\n.mmp-links { display: flex; gap: 12px; }\n.mmp-links a { color: var(--mp-muted); text-underline-offset: 3px; }\n@container (min-width: 480px) {\n  .mmp-field-inline { display: grid; grid-template-columns: minmax(0, 1fr) 184px; gap: 0 22px; align-items: center; }\n  .mmp-field-inline > .mmp-field-heading { grid-column: 1 / -1; }\n  .mmp-field-inline .mmp-field-control { margin-top: 0; }\n  .mmp-field-inline > .mmp-field-error, .mmp-field-inline > .mmp-dependency { grid-column: 1 / -1; }\n}\n@container (min-width: 920px) {\n  .mmp-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }\n  .mmp-field-wide { grid-column: 1 / -1; }\n}\n@container (max-width: 479px) {\n  .mmp-top { flex-wrap: wrap; gap: 5px; }\n  .mmp-status { margin-left: 44px; }\n  .mmp-toolbar { flex-wrap: wrap; }\n  .mmp-search { flex-basis: 100%; }\n  .mmp-toolbar .mmp-btn-primary { margin-left: auto; }\n  .mmp-categories { gap: 5px; }\n  .mmp-category-btn { padding-right: 7px; padding-left: 7px; }\n  .mmp-section-trigger { padding-right: 13px; padding-left: 13px; }\n  .mmp-section-content { padding-right: 13px; padding-left: 13px; }\n  .mmp-field-foot { flex-wrap: wrap; }\n  .mmp-field-actions { margin-left: auto; }\n  .mmp-section-meta-compact:not([hidden]) { grid-template-columns: 1fr; gap: 0; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .mmp-disclosure, .mmp-collapse-label svg, .mmp-section, .mmp-section-trigger, .mmp-chevron, .mmp-category-btn { transition: none !important; }\n}\n";
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
        }else if(field.type==='array')value=String(value).split(field.group==='privacy'?/\n/:/[,，\n]/).map(x=>x.trim()).filter(Boolean);
        else if(field.type==='json'){
          try{value=String(value).trim()?JSON.parse(value):(field.key==='filter'?null:{});if(value!==null&&(typeof value!=='object'||Array.isArray(value)))throw new Error();}
          catch{errors[field.key]='请填写有效的 JSON 对象。';continue;}
        }
        values[field.key]=value;
      }
      return {values,errors};
    }
    const COMMON_KEYS=['recallEnabled','addEnabled','includeAssistant','includePreference','memoryLimitNumber','maxRecallChars','recallFilterEnabled'];
    const COMMON_GROUP={id:'common',title:'常用设置',description:'日常使用的记忆行为。连接、模型和高级参数可在上方分类中设置。'};
    const GROUP_ORDER=['connection','recall','recall-filter','capture','privacy','identity','knowledge','requests'];
    function Field({field,value,base,changed,resetting,customized,disabled,error,change,reset,reportError,secret,setSecret,showSecret,toggleSecret,hasKey,keySource,draft,configure}){
      const id='mmp-'+field.key;
      const shared={id,disabled,'aria-describedby':id+'-hint','aria-invalid':Boolean(error)};
      let control;
      if(field.type==='secret')control=h('div',{className:'mmp-secret'},h('input',{...shared,type:showSecret?'text':'password',className:'mmp-input',value:secret,autoComplete:'new-password',placeholder:hasKey?'已保存密钥，填写新值可替换':field.placeholder,onChange:e=>setSecret(e.target.value)}),h('button',{className:'mmp-btn',type:'button',disabled:disabled||!secret,onClick:toggleSecret,'aria-label':(showSecret?'隐藏':'显示')+field.label},showSecret?'隐藏':'显示'));
      else if(field.type==='boolean'){
        const mode=resetting||(!customized&&!changed)?'default':value?'on':'off';
        control=h('div',{className:'mmp-segment',role:'group','aria-label':field.label},[['default','默认·'+(base?'开':'关')],['on','开'],['off','关']].map(([kind,label])=>h('button',{type:'button',key:kind,disabled,'aria-pressed':mode===kind,onClick:()=>kind==='default'?reset(field):change(field.key,kind==='on')},label)));
      }else if(field.type==='json'||field.type==='textarea'||field.type==='array')control=h('textarea',{...shared,className:'mmp-textarea'+(field.type==='json'?' mmp-mono':''),rows:field.type==='json'?5:field.rows||3,value,placeholder:field.placeholder,spellCheck:false,onChange:e=>change(field.key,e.target.value)});
      else control=h('div',{className:'mmp-input-wrap'},h('input',{...shared,className:'mmp-input'+(field.unit?' mmp-number':''),type:field.type==='number'?'number':field.type==='url'?'url':'text',value,min:field.min,max:field.max,step:field.step,placeholder:field.placeholder,autoComplete:'off',onChange:e=>change(field.key,e.target.value)}),field.unit?h('span',{className:'mmp-unit'},field.unit):null);
      const dependency=(field.when&&!draft[field.when])||(field.unless&&draft[field.unless]);
      const metadata=field.type==='secret'?keySource+' · 不回显':field.type==='number'?'默认 '+shortValue(base)+' · '+field.min+'–'+field.max:customized?'已自定义':'默认：'+shortValue(base);
      return h('div',{className:'mmp-field'+(field.wide?' mmp-field-wide':'')+(['boolean','number'].includes(field.type)?' mmp-field-inline':''),'data-field':field.key},
        h('div',{className:'mmp-field-heading'},
          h('div',{className:'mmp-field-title'},h('label',{htmlFor:field.type==='boolean'?undefined:id,title:field.key},field.label),changed||resetting?h('span',{className:'mmp-pending'},resetting?'待重置':'待保存'):null),
          h('code',{className:'mmp-field-key',title:field.key},field.key)),
        h('div',{className:'mmp-field-info'},
          h('p',{className:'mmp-field-desc',id:id+'-hint'},field.hint),
          configure?h('button',{type:'button',className:'mmp-text-btn mmp-configure',onClick:configure},'配置筛选 API →'):null),
        h('div',{className:'mmp-field-control'},control,
          field.type!=='boolean'?h('div',{className:'mmp-field-foot'},h('span',null,metadata),
            h('div',{className:'mmp-field-actions'},field.type==='json'?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>{try{change(field.key,JSON.stringify(JSON.parse(value),null,2));}catch{reportError(field.key,'请填写有效的 JSON 后再格式化。');}}},'格式化'):null,
              field.type==='json'&&field.placeholder?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>change(field.key,field.placeholder)},'示例'):null,
              field.type!=='secret'?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>reset(field),'aria-label':'恢复'+field.label+'默认'},'重置'):null,
              field.type==='secret'&&secret?h('button',{type:'button',className:'mmp-text-btn',disabled,onClick:()=>setSecret('')},'清空输入'):null)):null),
        dependency?h('span',{className:'mmp-dependency'},field.whenText):null,
        error?h('p',{className:'mmp-field-error',role:'alert'},error):null);
    }
    function GroupSection({item,closed,count,pendingCount,onToggle,children}){
      const bodyRef=React.useRef(null),triggerRef=React.useRef(null);
      const triggerId='mmp-trigger-'+item.id,bodyId='mmp-body-'+item.id;
      React.useLayoutEffect(()=>{
        const body=bodyRef.current;
        if(!body)return;
        if(closed&&body.contains(document.activeElement))triggerRef.current?.focus({preventScroll:true});
        // Keep draft controls mounted for animation, but exclude collapsed controls from focus/navigation.
        body.inert=closed;
      },[closed]);
      return h('section',{className:'mmp-section','data-collapsed':closed,'aria-label':item.title},
        h('header',{className:'mmp-section-head'},h('h3',{className:'mmp-section-heading'},h('button',{
          ref:triggerRef,id:triggerId,className:'mmp-section-trigger',type:'button','aria-expanded':!closed,'aria-controls':bodyId,
          'aria-label':(closed?'展开':'收起')+item.title,onClick:onToggle
        },
          h('span',{className:'mmp-trigger-title'},item.title,h('span',{className:'mmp-section-count'},count+' 项'),pendingCount?h('span',{className:'mmp-section-pending'},pendingCount+' 项待保存'):null),
          h('span',{className:'mmp-collapse-label','aria-hidden':true},closed?'展开':'收起',h('span',{className:'mmp-chevron'},h('svg',{viewBox:'0 0 20 20',fill:'none'},h('path',{d:'m5 7.5 5 5 5-5',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round'}))))))),
        h('div',{ref:bodyRef,id:bodyId,className:'mmp-disclosure','data-closed':closed,'aria-hidden':closed,role:'region','aria-labelledby':triggerId},
          h('div',{className:'mmp-disclosure-clip'},h('div',{className:'mmp-section-content'},children))));
    }
    function Form(){
      const [data,setData]=React.useState(null),[draft,setDraft]=React.useState({}),[dirty,setDirty]=React.useState(()=>new Set()),[resets,setResets]=React.useState(()=>new Set());
      const [secrets,setSecrets]=React.useState({}),[showSecrets,setShowSecrets]=React.useState({}),[group,setGroup]=React.useState('common'),[query,setQuery]=React.useState(''),[changedOnly,setChangedOnly]=React.useState(false);
      const [busy,setBusy]=React.useState(''),[notice,setNotice]=React.useState(null),[errors,setErrors]=React.useState({}),[collapsed,setCollapsed]=React.useState(()=>new Set());
      const alive=React.useRef(false),pending=React.useRef(null);
      function accept(result){setData(result);setDraft(Object.fromEntries(result.fields.map(field=>[field.key,displayValue(field,result.values[field.key])])));setDirty(new Set());setResets(new Set());setSecrets({});setShowSecrets({});setErrors({});}
      React.useEffect(()=>{
        alive.current=true;const abort=new AbortController();pending.current=abort;
        request('/state',undefined,abort.signal).then(result=>{if(alive.current)accept(result);}).catch(error=>{if(alive.current&&!abort.signal.aborted)setNotice({error:true,text:error.message});});
        return()=>{alive.current=false;pending.current?.abort();};
      },[]);
      function change(key,value){setDraft(current=>({...current,[key]:value}));setDirty(current=>new Set([...current,key]));setResets(current=>{const next=new Set(current);next.delete(key);return next;});setErrors(current=>{const next={...current};delete next[key];return next;});setNotice(null);}
      function setSecret(key,value){setSecrets(current=>({...current,[key]:value}));setNotice(null);}
      function chooseGroup(value){setGroup(value);setQuery('');setChangedOnly(false);setCollapsed(new Set());}
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
        if(Object.keys(collected.errors).length){const first=data.fields.find(field=>collected.errors[field.key]);chooseGroup(first.group);setNotice({error:true,text:'有参数需要修正，请查看标出的字段。'});return;}
        const abort=new AbortController();pending.current?.abort();pending.current=abort;setBusy(kind);
        try{
          const result=await request(kind==='refresh'?'/state':kind==='save'?'/save':kind==='test-filter'?'/test-filter':'/test',kind==='refresh'?undefined:{values:collected.values,resetFields:[...resets],revision:data.revision,privacyRevision:data.privacy?.revision,...Object.fromEntries(Object.entries(secrets).filter(([,value])=>value.trim()))},abort.signal);
          if(!alive.current)return;
          if(kind==='refresh'||kind==='save')accept(result);
          setNotice({error:false,text:kind==='save'?'配置已保存，后续对话使用新参数。':kind==='refresh'?'已读取最新配置。':result.message+'（'+result.latencyMs+' ms）'});
        }catch(error){if(alive.current&&!abort.signal.aborted)setNotice({error:true,text:error.message});}
        finally{if(alive.current)setBusy('');}
      }
      const fields=data?.fields||[],groups=[...(data?.groups||[])].sort((a,b)=>GROUP_ORDER.indexOf(a.id)-GROUP_ORDER.indexOf(b.id)),term=query.trim().toLocaleLowerCase();
      const changedCount=dirty.size+resets.size+Object.values(secrets).filter(value=>value.trim()).length,disabled=Boolean(busy)||!data?.active||!data?.writable;
      const visible=fields.filter(field=>{
        if(group==='common'&&!COMMON_KEYS.includes(field.key))return false;
        if(group!=='all'&&group!=='common'&&field.group!==group)return false;
        if(changedOnly&&!dirty.has(field.key)&&!resets.has(field.key)&&!secrets[field.key]?.trim())return false;
        return !term||[field.label,field.key,field.hint,groups.find(item=>item.id===field.group)?.title].join(' ').toLocaleLowerCase().includes(term);
      });
      if(group==='common')visible.sort((a,b)=>COMMON_KEYS.indexOf(a.key)-COMMON_KEYS.indexOf(b.key));
      const displayGroups=group==='common'?[COMMON_GROUP]:groups;
      const visibleGroups=displayGroups.filter(item=>item.id==='common'?visible.length:visible.some(field=>field.group===item.id));
      function foldVisible(close){setCollapsed(current=>{const next=new Set(current);for(const item of visibleGroups){if(close)next.add(item.id);else next.delete(item.id);}return next;});}
      const healthyPrivacy=data?.privacy?.active&&!data.privacy.error;
      const summary=[['召回',data?.values.recallEnabled],['写回',data?.values.addEnabled],['隐私',healthyPrivacy&&data.privacy.enabled]];
      return h('section',{className:'mmp','aria-label':'MemOS 记忆配置'},
        h('header',{className:'mmp-top'},h('div',null,h('div',{className:'mmp-brand'},h('span',{className:'mmp-logo','aria-hidden':true},'M'),h('h2',null,'记忆设置')),h('p',{className:'mmp-sub'},'管理长期记忆的连接、召回与写回。')),
          h('button',{className:'mmp-status',type:'button','data-ready':Boolean(data?.active&&data?.hasApiKey),onClick:()=>chooseGroup('connection'),title:'查看连接与鉴权设置'},h('i',null),!data?'读取中':!data.active?'插件未加载':data.hasApiKey?'密钥已配置':'配置连接 →')),
        h('div',{className:'mmp-summary','aria-label':'当前已保存的记忆状态'},summary.map(([label,on])=>h('div',{key:label,className:'mmp-stat','data-on':Boolean(on)},h('i',{'aria-hidden':true}),h('span',null,label),h('strong',null,!data?'读取中':on?'已开启':'已关闭')))),
        h('div',{className:'mmp-toolbar'},h('label',{className:'mmp-search'},h('svg',{viewBox:'0 0 20 20',fill:'none','aria-hidden':true},h('circle',{cx:8.5,cy:8.5,r:5.5,stroke:'currentColor',strokeWidth:1.5}),h('path',{d:'m13 13 4 4',stroke:'currentColor',strokeWidth:1.5})),h('input',{type:'search',value:query,onChange:e=>{setQuery(e.target.value);if(e.target.value.trim()){setGroup('all');setCollapsed(new Set());}},placeholder:'搜索全部设置','aria-label':'搜索设置参数'})),
          h('button',{className:'mmp-btn',type:'button',disabled:Boolean(busy),onClick:()=>action('refresh')},busy==='refresh'?'读取中…':'重新载入'),
          h('button',{className:'mmp-btn mmp-btn-primary',type:'button',disabled:disabled||!changedCount,onClick:()=>action('save')},busy==='save'?'保存中…':'保存配置'+(changedCount?' · '+changedCount:''))),
        h('nav',{className:'mmp-categories','aria-label':'设置分类'},[{id:'common',title:'常用设置',count:COMMON_KEYS.length},{id:'all',title:'全部设置',count:fields.length},...groups.map(item=>({...item,count:fields.filter(field=>field.group===item.id).length}))].map(item=>h('button',{key:item.id,className:'mmp-category-btn',type:'button','aria-pressed':group===item.id,'aria-label':item.title+'，'+item.count+' 项设置',onClick:()=>chooseGroup(item.id)},h('span',null,item.title),h('span',{className:'mmp-category-count','aria-hidden':true},item.count)))),
        h('div',{className:'mmp-view-meta'},h('span',null,term?'找到 '+visible.length+' 项匹配设置':changedOnly?'显示 '+visible.length+' 项更改':changedCount?changedCount+' 项更改尚未保存':visible.length+' 项设置 · 当前无未保存更改'),
          h('div',{className:'mmp-actions'},changedCount?h('button',{className:'mmp-text-btn',type:'button',disabled:Boolean(busy),onClick:discard},'放弃更改'):null,visibleGroups.length>1?h(React.Fragment,null,h('button',{className:'mmp-text-btn',type:'button',disabled:visibleGroups.every(item=>!collapsed.has(item.id)),onClick:()=>foldVisible(false)},'展开全部'),h('button',{className:'mmp-text-btn',type:'button',disabled:visibleGroups.every(item=>collapsed.has(item.id)),onClick:()=>foldVisible(true)},'收起全部')):null,
            h('label',{className:'mmp-change-filter'},h('input',{type:'checkbox',checked:changedOnly,onChange:e=>{setChangedOnly(e.target.checked);if(e.target.checked){setGroup('all');setQuery('');setCollapsed(new Set());}}}),'仅看更改'))),
        data?.privacy&&!healthyPrivacy?h('p',{className:'mmp-notice',role:'alert'},data.privacy.error?'隐私配置读取异常，MemOS 请求已停止。请检查隐私设置。':'隐私适配层未运行，请启用插件并重启 DSH。'):null,
        notice?h('p',{className:'mmp-notice',role:notice.error?'alert':'status'},notice.text):null,
        !data?h('div',{className:'mmp-empty'},'正在读取插件配置…'):!visible.length?h('div',{className:'mmp-empty'},changedOnly?'没有待保存的更改。':'没有找到匹配的设置。',h('div',null,h('button',{type:'button',className:'mmp-btn',onClick:()=>chooseGroup('common')},'返回常用设置'))):h('div',{className:'mmp-sections'},displayGroups.map(item=>{
          const groupFields=item.id==='common'?visible:visible.filter(field=>field.group===item.id);if(!groupFields.length)return null;
          const closed=collapsed.has(item.id),sectionFields=item.id==='common'?fields.filter(field=>COMMON_KEYS.includes(field.key)):fields.filter(field=>field.group===item.id),pendingCount=sectionFields.filter(field=>dirty.has(field.key)||resets.has(field.key)||secrets[field.key]?.trim()).length;
          return h(GroupSection,{key:item.id,item,closed,count:groupFields.length,pendingCount,onToggle:()=>setCollapsed(current=>{const next=new Set(current);if(next.has(item.id))next.delete(item.id);else next.add(item.id);return next;})},
              h('div',{className:'mmp-section-meta'+(!['connection','recall-filter'].includes(item.id)?' mmp-section-meta-compact':'')},h('p',{className:'mmp-section-desc'},item.id==='privacy'?'在本机检查发往 MemOS 与二次筛选服务的内容，不处理主模型请求。':item.description),
                h('div',{className:'mmp-section-actions'},item.id==='connection'?h('button',{className:'mmp-btn',type:'button',disabled,onClick:()=>action('test')},busy==='test'?'测试中…':'测试 MemOS 连接'):item.id==='recall-filter'?h('button',{className:'mmp-btn',type:'button',disabled,onClick:()=>action('test-filter')},busy==='test-filter'?'测试中…':'测试筛选连接'):null,
                  h('button',{className:'mmp-text-btn',type:'button',disabled,onClick:()=>resetFields(sectionFields),'aria-label':'恢复'+item.title+'默认'},'恢复本组默认'))),
            h('div',{className:'mmp-fields',id:'mmp-fields-'+item.id},groupFields.map(field=>h(Field,{key:field.key,field,value:draft[field.key],base:data.defaults[field.key],changed:dirty.has(field.key)||Boolean(secrets[field.key]?.trim()),resetting:resets.has(field.key),customized:data.customized.includes(field.key),disabled,error:errors[field.key],change,reset:field=>resetFields([field]),reportError:(key,text)=>setErrors(current=>({...current,[key]:text})),secret:secrets[field.key]??'',setSecret:value=>setSecret(field.key,value),showSecret:Boolean(showSecrets[field.key]),toggleSecret:()=>setShowSecrets(current=>({...current,[field.key]:!current[field.key]})),hasKey:data.secretStatus?.[field.key]?.set??data.hasApiKey,keySource:data.secretStatus?.[field.key]?.source??data.keySource,draft,configure:item.id==='common'&&field.key==='recallFilterEnabled'?()=>chooseGroup('recall-filter'):undefined}))));
        })),
        h('footer',{className:'mmp-bottom'},h('span',null,'更改后点击保存。密钥留空保留已有值。'),h('nav',{className:'mmp-links','aria-label':'MemOS 帮助'},h('a',{href:'https://memos-dashboard.openmem.net/cn/apikeys/',target:'_blank',rel:'noreferrer'},'获取 Key ↗'),h('a',{href:'https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin/blob/main/packages/dsh/README.zh.md',target:'_blank',rel:'noreferrer'},'参数说明 ↗'))));
    }
    function apply(ctx){
      ctx.effect(()=>{const style=document.createElement('style');style.dataset.memosPanel='1';style.textContent=STYLE;document.head.appendChild(style);return()=>style.remove();},'memos-panel: styles');
      ctx.effect(()=>ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'memos',order:19,label:()=> 'MemOS 记忆',inject:()=>({})},Form)),'memos-panel: settings page');
    }
    return {apply,inject:['slots']};
  }
});
