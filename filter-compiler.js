import {compileLine} from './core.js';
const resourceTypes=['script','image','stylesheet','font','media','xmlhttprequest','sub_frame','ping','other'];
const aliases={script:'script',image:'image',stylesheet:'stylesheet',font:'font',media:'media',xmlhttprequest:'xmlhttprequest',subdocument:'sub_frame',ping:'ping',other:'other'};
export function compilePath(line,id) {
 const allow=line.startsWith('@@'); if(allow)line=line.slice(2);
 const [pattern,options='',...extra]=line.split('$');
 if(extra.length || !/^\|\|[a-z0-9.-]+(?:\^|\/[a-z0-9_%./?&=+*^|,:;@!~-]+)$/i.test(pattern))return null;
 const condition={urlFilter:pattern};const include=[],exclude=[];
 for(const option of options.split(',').filter(Boolean)){
  if(option==='third-party')condition.domainType='thirdParty';
  else if(option==='~third-party'||option==='first-party')condition.domainType='firstParty';
  else if(option==='match-case')condition.isUrlFilterCaseSensitive=true;
  else if(option.startsWith('domain=')){
   const domains=option.slice(7).split('|');const positive=[],negative=[];
   for(let domain of domains){const neg=domain.startsWith('~');if(neg)domain=domain.slice(1);if(!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain))return null;(neg?negative:positive).push(domain.toLowerCase());}
   if(positive.length)condition.initiatorDomains=positive;if(negative.length)condition.excludedInitiatorDomains=negative;
  }else{const neg=option.startsWith('~');const type=aliases[neg?option.slice(1):option];if(!type)return null;(neg?exclude:include).push(type);}
 }
 condition.resourceTypes=[...new Set(include.length?include:resourceTypes)].filter(t=>!exclude.includes(t));
 if(!condition.resourceTypes.length)return null;
 return {id,priority:allow?2:1,action:{type:allow?'allow':'block'},condition};
}
export function compileAbsolute(line,id) {
 const allow=line.startsWith('@@'),body=allow?line.slice(2):line;
 const [pattern,options='',...extra]=body.split('$');
 if(extra.length||!/^\|https?:\/\/[a-z0-9.-]+\/[a-z0-9_%./?&=+*^|,:;@!~-]+$/i.test(pattern))return null;
 const host=/^\|https?:\/\/([a-z0-9.-]+)/i.exec(pattern)[1];
 const scoped=compilePath((allow?'@@':'')+'||'+host+'/filter-placeholder'+(options?'$'+options:''),id);
 if(!scoped)return null;
 return {...scoped,condition:{...scoped.condition,urlFilter:pattern}};
}
export function compileFilters(source) {
 const lines=source.split(/\r?\n/);const domains=[];const paths=[];const seen=new Set();
 // Supported exceptions retain their scope; only unsupported exceptions require
 // conservatively omitting related domain blocks.
 const exempt=new Set(lines.filter(l=>l.startsWith('@@')&&!compilePath(l,1)&&!compileAbsolute(l,1)).flatMap(l=>[...l.matchAll(/\|\|([a-z0-9.-]+)|\|https?:\/\/([a-z0-9.-]+)/gi)].map(m=>(m[1]||m[2]).toLowerCase())));
 for(const line of lines){
  let rule=compileLine(line,1);const pathRule=!rule && (compilePath(line,1)||compileAbsolute(line,1));rule=rule||pathRule;if(!rule)continue;
  const host=(/^\|\|([a-z0-9.-]+)/i.exec(rule.condition.urlFilter)?.[1]||/^\|https?:\/\/([a-z0-9.-]+)/i.exec(rule.condition.urlFilter)?.[1])?.toLowerCase();
  if(rule.action.type==='block' && [...exempt].some(e=>host===e||host.endsWith('.'+e)||e.endsWith('.'+host)))continue;
  const key=JSON.stringify([rule.action,rule.condition]);if(seen.has(key))continue;seen.add(key);
  (pathRule?paths:domains).push(rule);
 }
 const packed=[];
 for(const thirdParty of [false,true]){
  const names=[...new Set(domains.filter(r=>Boolean(r.condition.domainType)===thirdParty).map(r=>r.condition.urlFilter.slice(2,-1)))];
  for(let offset=0;offset<names.length;offset+=500){const condition={requestDomains:names.slice(offset,offset+500),resourceTypes};if(thirdParty)condition.domainType='thirdParty';packed.push({id:packed.length+1,priority:1,action:{type:'block'},condition});}
 }
 for(const rule of paths)packed.push({...rule,id:packed.length+1});
 return {rules:packed,domainFilters:domains.length,pathFilters:paths.length};
}
