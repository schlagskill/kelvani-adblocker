import "./assets/ui/review.js";
import { showNotice } from "./assets/ui/feedback.js?v=1";
import { icon } from "./assets/ui/icons.js?v=1.0";
import {defaults,validate,isExcluded} from './core.js?v=0.3.2';
import {createPopupController} from './popup-controller.js?v=0.3.2';
const native=Boolean(globalThis.chrome?.runtime?.id),$=id=>document.getElementById(id);
const controller=native?createPopupController(chrome):null;
let state=validate(defaults),host=null,ready=false,busy=false,timer;
function notice(text,error=false){showNotice($("notice"),text,{error});}
function render(){
 const excluded=Boolean(host&&isExcluded(host,state.exceptions));
 $('host').textContent=host||'Hier ist keine Website geöffnet';
 $('site-status').textContent=!host?'Öffne eine normale Website.':excluded?'Diese Website ist ausgenommen.':state.enabled?'Schutz für diese Website aktiv.':'Werbeblocker ist pausiert.';
 $('enabled').checked=state.enabled;$('enabled').disabled=!ready||busy;
 $('exception').disabled=!ready||busy||!host;
 $('exception').textContent=excluded?'Schutz wieder aktivieren':'Website ausnehmen';
 $('exception').classList.toggle('excluded',excluded);
 $('site-status').classList.toggle('site-excluded',excluded);
 $('preview').hidden=native;
 const youtube=Boolean(host&&/(^|\.)youtube\.com$/.test(host));$('youtube-controls').hidden=!youtube;$('youtube-switch').checked=state.youtube;$('youtube-switch').disabled=!native||!ready||busy||excluded||!state.enabled;
 $('youtube-status').textContent=excluded?'Diese Website ist ausgenommen.':!state.enabled?'Der gesamte Schutz ist pausiert.':state.youtube?'Assistent aktiv: klickt sichtbare Überspringen-Buttons. Werbung kann weiterhin erscheinen.':'Assistent ausgeschaltet. YouTube-Werbung wird derzeit nicht vollständig blockiert.';
 if(youtube&&!excluded&&state.enabled)$('site-status').textContent='Kompatibilitätsmodus für YouTube.';
}
function readPreview(){try{return validate(JSON.parse(localStorage.getItem('kelvani-adblocker-preview')));}catch{return validate(defaults);}}
function savePreview(next){state=validate({...next,revision:next.revision+1});localStorage.setItem('kelvani-adblocker-preview',JSON.stringify(state));}
$('exception').addEventListener('click',async()=>{
 if(!ready||busy||!host)return;busy=true;render();
 try{
  if(native){const result=await controller.toggleException();state=result.settings;notice(result.reloadFailed?'Gespeichert. Bitte Website neu laden.':result.excluded?'Website ausgenommen und neu geladen.':'Schutz aktiviert und Website neu geladen.');}
  else{state=readPreview();const excluded=isExcluded(host,state.exceptions);savePreview({...state,exceptions:excluded?state.exceptions.filter(domain=>!isExcluded(host,[domain])):[...state.exceptions,host]});notice('Vorschau gespeichert.');}
 }catch(error){notice(error.message,true);}finally{busy=false;render();}
});
$('enabled').addEventListener('change',async()=>{
 if(!ready||busy)return;busy=true;render();
 try{if(native)state=await controller.toggleEnabled();else{state=readPreview();savePreview({...state,enabled:!state.enabled});}notice(state.enabled?'Schutz aktiviert.':'Schutz pausiert.');}
 catch(error){notice(error.message,true);}finally{busy=false;render();}
});
$('youtube-switch').addEventListener('change',async()=>{if(!ready||busy||!native)return;busy=true;render();try{const result=await controller.toggleYouTube();state=result.settings;notice(result.reloadFailed?'Gespeichert. Bitte YouTube neu laden.':state.youtube?'Überspring-Assistent eingeschaltet. Seite wird neu geladen.':'Überspring-Assistent ausgeschaltet.');}catch(error){notice(error.message,true);}finally{busy=false;render();}});
$('expand').addEventListener('click',async()=>{
 try{if(native)await chrome.tabs.create({url:chrome.runtime.getURL('index.html')});else window.open('index.html','_blank','noopener');}catch(error){notice(error.message,true);}
});
try{
 if(native){const result=await controller.initialize();state=result.settings;host=result.host;
 chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.settings){try{state=validate(changes.settings.newValue);render();}catch(error){notice(error.message,true);}}});
 }else{state=readPreview();host=new URLSearchParams(location.search).get('site')==='youtube'?'www.youtube.com':'example.com';$('preview').textContent='Design-Vorschau · '+host+' ist ein Beispiel. Hier wird keine Werbung blockiert.';}
 ready=true;
}catch(error){notice(error.message,true);}render();

$("expand").textContent="Alle Einstellungen";$("expand").append(icon("expand"));
