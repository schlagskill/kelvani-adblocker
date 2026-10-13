export function hostname(value) {
  const url = new URL(value.includes('://') ? value : `https://${value}`);
  const host=url.hostname.toLowerCase().replace(/\.$/,'');
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || host.length>253 || !host.includes('.') || !host.split('.').every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) throw Error('Bitte eine gültige Website eingeben.');
  return host;
}
export const defaults = {enabled:true, cosmetic:true, youtube:false, tracking:true, exceptions:[], blocked:[], antiSites:[],revision:0};
export function validate(input) {
  if (!input || typeof input !== 'object') throw Error('Ungültige Einstellungen.');
  const result = {...defaults};
  if(input.revision!==undefined && (!Number.isSafeInteger(input.revision)||input.revision<0))throw Error('Ungültige Revision.');
  result.revision=input.revision??0;
  if(input.tracking!==undefined && typeof input.tracking!=='boolean')throw Error('Ungültiger Tracking-Schalter.');
  result.tracking=input.tracking??true;
  for (const key of ['enabled','cosmetic','youtube']) { if (typeof input[key] !== 'boolean') throw Error('Ungültiger Schalter.'); result[key] = input[key]; }
  for (const key of ['exceptions','blocked','antiSites']) {
    const list=key==='antiSites' && input[key]===undefined ? [] : input[key];
    if (!Array.isArray(list) || list.length > 500) throw Error('Höchstens 500 Websites pro Liste.');
    result[key] = [...new Set(list.map(hostname))];
  }
  return result;
}
export function scriptsFor(state) {
  if(!state.enabled)return [];
  const excludeMatches=state.exceptions.map(host=>`*://*.${host}/*`);
  const base={runAt:'document_start',world:'MAIN',persistAcrossSessions:true,excludeMatches};
  const scripts=[];
  if(state.youtube) scripts.push({...base,id:'kelvani-youtube',matches:['*://*.youtube.com/*'],js:['youtube-main.js']});
  const domains=state.antiSites.filter(host=>!isExcluded(host,state.exceptions));
  if(domains.length) scripts.push({...base,id:'kelvani-compatibility',matches:domains.map(host=>`*://*.${host}/*`),js:['anti-detection.js']});
  return scripts;
}
export function isExcluded(host, exceptions) { return exceptions.some(domain => host === domain || host.endsWith(`.${domain}`)); }
export function dynamicRules(state) {
  if (!state.enabled) return [{id:1,priority:100000,action:{type:'allow'},condition:{urlFilter:'*'}}];
  let id=1; const rules=[];
  for (const domain of state.exceptions) {
    rules.push({id:id++,priority:1000,action:{type:'allow'},condition:{initiatorDomains:[domain]}});
    rules.push({id:id++,priority:1000,action:{type:'allowAllRequests'},condition:{requestDomains:[domain],resourceTypes:['main_frame','sub_frame']}});
  }
  for (const domain of state.blocked) rules.push({id:id++,priority:20,action:{type:'block'},condition:{urlFilter:`||${domain}^`,resourceTypes:['script','image','stylesheet','font','media','xmlhttprequest','sub_frame','ping','other']}});
  return rules;
}
export function compileLine(line, id) {
  // Only plain, explicit domain rules are supported. Unsupported syntax is skipped, never guessed.
  const match = /^(\|\|)([a-z0-9.-]+)\^(\$third-party)?$/i.exec(line);
  if (!match || !match[2].includes('.')) return null;
  const condition={urlFilter:`||${match[2]}^`,resourceTypes:['script','image','stylesheet','font','media','xmlhttprequest','sub_frame','ping','other']};
  if (match[3]) condition.domainType='thirdParty';
  return {id,priority:1,action:{type:'block'},condition};
}
