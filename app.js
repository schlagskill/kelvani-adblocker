import './language.js';
globalThis.KelvaniLanguage.startLanguage();
import {exportSettings,importSettings} from "./settings-backup.js";
import "./assets/ui/review.js";
import { showNotice } from "./assets/ui/feedback.js?v=1";
import { icon } from "./assets/ui/icons.js?v=1.0";
import {defaults,validate,hostname,isExcluded} from './core.js?v=0.2.4';
const $=id=>document.getElementById(id);const native=Boolean(globalThis.chrome?.runtime?.id);
let state={...defaults},currentHost=null,timer,busy=false,dirty=false;
if(location.pathname.endsWith('popup.html'))document.body.classList.add('popup');
function notice(text,error=false){showNotice($("notice"),text,{error});}
function render(reset=false){
 for(const key of ['enabled','cosmetic','youtube','tracking','compatibilityAll'])$(key).checked=state[key];
 if(reset||!dirty)for(const key of ['exceptions','blocked','antiSites'])$(key).value=state[key].join('\n');
 $('status').hidden=native&&state.enabled; $('status').textContent=native?(state.enabled?'':'Schutz pausiert.'):'Design-Vorschau · hier werden keine Anfragen blockiert.';
 for(const control of document.querySelectorAll('button,input'))control.disabled=busy;
}
async function persist(next,reset=false){
 if(busy)return;busy=true;render();
 try{
  next=validate(next);
  if(native){const response=await chrome.runtime.sendMessage({type:'save',settings:next});if(response?.error)throw Error(response.error);if(!response?.settings)throw Error('Speichern fehlgeschlagen.');state=response.settings;}
  else{next.revision++;localStorage.setItem('kelvani-adblocker-preview',JSON.stringify(next));state=next;}
  if(reset)dirty=false;
  notice('Gespeichert · betroffene Website neu laden.');
 }catch(error){
  if(native){const data=await chrome.storage.local.get('settings');if(data.settings)state=validate(data.settings);}
  notice(error.message,true);
 }finally{busy=false;render(reset&&!dirty);}
}
for(const key of ['enabled','cosmetic','youtube','tracking','compatibilityAll'])$(key).addEventListener('change',()=>persist({...state,[key]:$(key).checked}));
for(const key of ['exceptions','blocked','antiSites'])$(key).addEventListener('input',()=>{dirty=true;});
$('save').addEventListener('click',()=>persist({...state,...Object.fromEntries(['exceptions','blocked','antiSites'].map(key=>[key,$(key).value.split(/\s+/).filter(Boolean)]))},true));
$('diagnose').addEventListener('click',async()=>{
 if(!native){$('diagnostic').textContent='Nur in der installierten Erweiterung verfügbar. Die Vorschau simuliert keine Browser-Prüfung.';return;}
 $('diagnose').disabled=true;
 try{const response=await chrome.runtime.sendMessage({type:'diagnose'});if(response?.error)throw Error(response.error);const {matched,ruleSets,scripts}=response.result;
 $('diagnostic').textContent=`Testadresse: doubleclick.com\nPassende Regeln: ${matched.length}\nAktive Listen: ${ruleSets.join(', ')}\nZusatzmodule: ${scripts.join(', ')||'keine'}\nKein Werbeserver wurde angefragt. Dies prüft nicht die tatsächliche YouTube-Wiedergabe.`;
 }catch(error){$('diagnostic').textContent=`Prüfung nicht verfügbar: ${error.message}. Diese Browser-Prüfung wird für entpackte Erweiterungen unterstützt.`;}
 finally{$('diagnose').disabled=false;}
});
try{
 if(native){const data=await chrome.storage.local.get('settings');state=data.settings?validate(data.settings):{...defaults};const [tab]=await chrome.tabs.query({active:true,currentWindow:true});try{currentHost=hostname(tab.url);}catch{}
 chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.settings){state=validate(changes.settings.newValue);render();}});
 }else{try{state=validate(JSON.parse(localStorage.getItem('kelvani-adblocker-preview')));}catch{}currentHost='example.com';}
 const report=await(await fetch('filters/report.json')).json();$('rules').textContent=`${report.compiled.toLocaleString('de-DE')} Filter`;
}catch(error){notice(error.message,true);}render();


$('export-settings').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(exportSettings(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='KelvaniAdBlocker-Einstellungen.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Einstellungen lokal exportiert.');
});
$('import-settings').addEventListener('click',()=>{if(!busy)$('settings-file').click();});
$('settings-file').addEventListener('change',async()=>{
 const file=$('settings-file').files[0];$('settings-file').value='';if(!file)return;
 try{
  if(file.size>1000000)throw new Error('Die Sicherung ist zu groß.');
  if(dirty&&!confirm(globalThis.KelvaniLanguage.translate('Ungespeicherte Änderungen durch die Sicherung ersetzen?')))return;
  const latest=native?(await chrome.storage.local.get('settings')).settings:JSON.parse(localStorage.getItem('kelvani-adblocker-preview')||'null');
  const next=importSettings(await file.text(),latest||defaults);
  if(!confirm(globalThis.KelvaniLanguage.translate('Gespeicherte Ausnahmen und Regeln mit dieser Sicherung ersetzen?')))return;
  await persist(next,true);
 }catch(error){notice(error.message,true);}
});
