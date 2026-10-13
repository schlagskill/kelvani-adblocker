import {defaults,validate,hostname,isExcluded} from './core.js';

export function createPopupController(api) {
  let tab=null;
  async function readSettings(){const data=await api.storage.local.get('settings');return data.settings?validate(data.settings):validate(defaults);}
  async function initialize(){
    const [settings,tabs]=await Promise.all([readSettings(),api.tabs.query({active:true,currentWindow:true})]);
    tab=tabs[0]||null;let host=null;
    try{host=hostname(tab?.url);}catch{}
    return {settings,host,tabId:tab?.id??null};
  }
  async function save(settings){
    const response=await api.runtime.sendMessage({type:'save',settings});
    if(response?.error)throw Error(response.error);
    if(!response?.settings)throw Error('Speichern fehlgeschlagen.');
    return validate(response.settings);
  }
  async function toggleException(){
    if(!tab)throw Error('Keine Website geöffnet.');
    const host=hostname(tab.url);const latest=await api.tabs.get(tab.id);
    if(hostname(latest.url)!==host)throw Error('Website wurde gewechselt. Popup bitte neu öffnen.');
    const state=await readSettings();const excluded=isExcluded(host,state.exceptions);
    const exceptions=excluded?state.exceptions.filter(domain=>!isExcluded(host,[domain])):[...state.exceptions,host];
    const settings=await save({...state,exceptions});
    let reloadFailed=false;
    try{await api.tabs.reload(tab.id);}catch{reloadFailed=true;}
    return {settings,host,excluded:!excluded,reloadFailed};
  }
  async function toggleEnabled(){const state=await readSettings();return save({...state,enabled:!state.enabled});}
  async function toggleYouTube(){
    if(!tab)throw Error('Keine YouTube-Seite geöffnet.');
    const host=hostname(tab.url),latest=await api.tabs.get(tab.id);
    if(!/(^|\.)youtube\.com$/.test(host)||hostname(latest.url)!==host)throw Error('YouTube-Seite wurde gewechselt. Popup bitte neu öffnen.');
    const state=await readSettings();
    if(!state.enabled||isExcluded(host,state.exceptions))throw Error('Zuerst den Schutz für diese Website aktivieren.');
    const settings=await save({...state,youtube:!state.youtube});let reloadFailed=false;
    try{await api.tabs.reload(tab.id);}catch{reloadFailed=true;}
    return {settings,reloadFailed};
  }
  return {initialize,toggleException,toggleEnabled,toggleYouTube};
}
