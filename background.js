import {defaults,validate,dynamicRules,scriptsFor} from './core.js';
let queue=Promise.resolve();
async function replaceRules(rules){const existing=await chrome.declarativeNetRequest.getDynamicRules();await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:existing.map(r=>r.id),addRules:rules});}
async function replaceScripts(scripts){
 const current=await chrome.scripting.getRegisteredContentScripts();
 const wanted=new Set(scripts.map(s=>s.id));const removed=current.filter(s=>!wanted.has(s.id));
 if(removed.length)await chrome.scripting.unregisterContentScripts({ids:removed.map(s=>s.id)});
 const existing=new Set(current.map(s=>s.id));const added=scripts.filter(s=>!existing.has(s.id));const updated=scripts.filter(s=>existing.has(s.id));
 if(updated.length)await chrome.scripting.updateContentScripts(updated);
 if(added.length)await chrome.scripting.registerContentScripts(added);
}
async function save(input,reconcile=false){
 const state=validate(input);const data=await chrome.storage.local.get('settings');
 if(!reconcile && state.revision!==(data.settings?.revision??0))throw Error('Einstellungen wurden in einem anderen Fenster geändert. Bitte erneut versuchen.');
 const previousRules=await chrome.declarativeNetRequest.getDynamicRules();
 const previousScripts=await chrome.scripting.getRegisteredContentScripts();
 const previousEnabled=(await chrome.declarativeNetRequest.getEnabledRulesets()).includes('easyprivacy');
 try{
  await replaceRules(dynamicRules(state));await replaceScripts(scriptsFor(state));
  await chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds:['easylist',...(state.tracking?['easyprivacy']:[])],disableRulesetIds:state.tracking?[]:['easyprivacy']});
  if(!reconcile)state.revision++;
  await chrome.storage.local.set({settings:state});
 }catch(error){
  try{await replaceRules(previousRules);await replaceScripts(previousScripts);await chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds:previousEnabled?['easyprivacy']:[],disableRulesetIds:previousEnabled?[]:['easyprivacy']});}
  catch{throw Error('Schutz konnte nicht wiederhergestellt werden. Erweiterung neu laden.');}
  throw error;
 }
 try{await chrome.action.setBadgeText({text:state.enabled?'':'OFF'});}catch{}
 return state;
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(sender.id!==chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL('')))return;
 if(message?.type==='diagnose'){
  queue=queue.catch(()=>{}).then(async()=>{
   const result=await chrome.declarativeNetRequest.testMatchOutcome({url:'https://doubleclick.com/kelvani-test.js',initiator:'https://example.org',type:'script'});
   return {matched:result.matchedRules,ruleSets:await chrome.declarativeNetRequest.getEnabledRulesets(),scripts:(await chrome.scripting.getRegisteredContentScripts()).map(s=>s.id)};
  });queue.then(result=>reply({result}),error=>reply({error:error.message}));return true;
 }
 if(message?.type!=='save')return;
 queue=queue.catch(()=>{}).then(()=>save(message.settings));
 queue.then(settings=>reply({settings}),error=>reply({error:error.message}));return true;
});
function startup(){queue=queue.catch(()=>{}).then(async()=>{const {settings}=await chrome.storage.local.get('settings');await save(settings||defaults,true);}).catch(async error=>{console.error('Kelvani protection initialization:',error.message);try{await chrome.action.setBadgeText({text:'ERR'});}catch{}});}
chrome.runtime.onInstalled.addListener(startup);
chrome.runtime.onStartup.addListener(startup);
