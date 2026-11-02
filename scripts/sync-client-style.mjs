import fs from 'node:fs';
const client=new URL('../client/client.js',import.meta.url);
const source=fs.readFileSync(client,'utf8');
const start=source.indexOf('    const STYLE='),end=source.indexOf('    async function request(',start);
if(start<0||end<0)throw new Error('Client style anchors are missing.');
const updated=source.slice(0,start)+'    const STYLE='+JSON.stringify(fs.readFileSync(new URL('../client/panel.css',import.meta.url),'utf8'))+';\n'+source.slice(end);
if(process.argv.includes('--check')){
  if(source!==updated)throw new Error('Embedded CSS is stale. Run pnpm run sync:styles.');
}else fs.writeFileSync(client,updated);
