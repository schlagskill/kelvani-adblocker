(() => {
 let settings, style, observer, scheduled=false;
 const excluded=()=>settings.exceptions.some(d=>location.hostname===d||location.hostname.endsWith('.'+d));
 function update(){
   style?.remove(); observer?.disconnect();
   const exception=excluded();
   if(!settings.enabled||exception||!settings.youtube)dispatchEvent(new Event('kelvani:disable-youtube'));
   if(!settings.enabled||exception||!(settings.antiSites||[]).some(d=>location.hostname===d||location.hostname.endsWith('.'+d)))dispatchEvent(new Event('kelvani:disable-compatibility'));
   if(!settings.enabled||exception)return;
   if(settings.cosmetic){style=document.createElement('style');style.textContent='ins.adsbygoogle,[data-ad-slot],iframe[src*="doubleclick.net"],iframe[src*="googlesyndication.com"]{display:none!important}';(document.head||document.documentElement).append(style);}
   if(settings.youtube && /(^|\.)youtube\.com$/.test(location.hostname)){
     const check=()=>{scheduled=false;if(!settings.enabled||!settings.youtube||excluded())return;const player=document.querySelector('#movie_player.ad-showing'); if(!player)return; const button=player.querySelector('.ytp-skip-ad-button,.ytp-ad-skip-button-modern,.ytp-ad-skip-button'); if(button && button.getClientRects().length)button.click();};
     observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;setTimeout(check,150);}});
     observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});check();
   }
 }
 chrome.storage.local.get('settings').then(result=>{settings=result.settings||{enabled:true,cosmetic:true,youtube:false,exceptions:[]};update();});
 chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.settings){settings=changes.settings.newValue;update();}});
})();
