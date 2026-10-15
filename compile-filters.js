import fs from 'node:fs';
import {compileFilters} from './filter-compiler.js';
let total=0;const reports=[];
for(const name of ['easylist','easyprivacy']){
 const source=fs.readFileSync(new URL(`filters/${name}.txt`,import.meta.url),'utf8');
 const result=compileFilters(source);total+=result.rules.length;
 fs.writeFileSync(new URL(`filters/${name==='easylist'?'rules':'privacy-rules'}.json`,import.meta.url),JSON.stringify(result.rules));
 reports.push({name,version:source.match(/! Version: (.+)/)?.[1],...result,rules:undefined,networkRules:result.rules.length});
 console.log(`${name}: ${result.domainFilters} domain filters, ${result.pathFilters} path filters, ${result.rules.length} native rules.`);
}
if(total>30000)throw Error('Guaranteed static rule budget exceeded');
fs.writeFileSync(new URL('filters/report.json',import.meta.url),JSON.stringify({source:'The EasyList authors',compiled:reports.reduce((n,r)=>n+r.domainFilters+r.pathFilters,0),networkRules:total,lists:reports,scope:'Plain domain, domain-anchored path and protocol-anchored URL rules; supported resource, third-party and initiator options. Unsupported exception scopes conservatively omit affected domain blocks.'},null,2));
