(() => {
 let settings, style;
 const excluded=()=>settings.exceptions.some(d=>location.hostname===d||location.hostname.endsWith('.'+d));
 function update(){
   style?.remove();
   const exception=excluded();
   if(!settings.enabled||!settings.youtube||exception)dispatchEvent(new Event('kelvani:disable-youtube'));
   if(!settings.enabled||exception||!(settings.antiSites||[]).some(d=>location.hostname===d||location.hostname.endsWith('.'+d)))dispatchEvent(new Event('kelvani:disable-compatibility'));
   if(!settings.enabled||exception)return;
   if(settings.cosmetic && !/(^|\.)youtube(?:-nocookie)?\.com$/.test(location.hostname)){style=document.createElement('style');style.textContent='ins.adsbygoogle,[data-ad-slot],iframe[src*="doubleclick.net"],iframe[src*="googlesyndication.com"]{display:none!important}';(document.head||document.documentElement).append(style);}

 }
 chrome.storage.local.get('settings').then(result=>{settings=result.settings||{enabled:true,cosmetic:true,youtube:false,exceptions:[]};update();});
 chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.settings){settings=changes.settings.newValue;update();}});
})();
