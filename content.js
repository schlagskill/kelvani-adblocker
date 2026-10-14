(() => {
 let settings, style, observer, scheduled=false, generation=0; let clickedButtons=new WeakSet();
 const excluded=()=>settings.exceptions.some(d=>location.hostname===d||location.hostname.endsWith('.'+d));
 function update(){
   const epoch=++generation; scheduled=false; style?.remove(); observer?.disconnect();
   const exception=excluded();
   dispatchEvent(new Event('kelvani:disable-youtube'));
   if(!settings.enabled||exception||!(settings.antiSites||[]).some(d=>location.hostname===d||location.hostname.endsWith('.'+d)))dispatchEvent(new Event('kelvani:disable-compatibility'));
   if(!settings.enabled||exception)return;
   if(settings.cosmetic && !/(^|\.)youtube(?:-nocookie)?\.com$/.test(location.hostname)){style=document.createElement('style');style.textContent='ins.adsbygoogle,[data-ad-slot],iframe[src*="doubleclick.net"],iframe[src*="googlesyndication.com"]{display:none!important}';(document.head||document.documentElement).append(style);}
   if(settings.youtube && /(^|\.)youtube\.com$/.test(location.hostname)){
     const check=()=>{if(epoch!==generation)return;scheduled=false;if(!settings.enabled||!settings.youtube||excluded())return;const player=document.querySelector('#movie_player.ad-showing'); if(!player){clickedButtons=new WeakSet();return;} const button=player.querySelector('.ytp-skip-ad-button,.ytp-ad-skip-button-modern,.ytp-ad-skip-button,.ytp-ad-skip-button-container button,.ytp-ad-skip-button-container-modern button'); if(button && button.getClientRects().length && !clickedButtons.has(button)){clickedButtons.add(button);button.click();}};
     observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;setTimeout(check,150);}});
     observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});check();
   }
 }
 chrome.storage.local.get('settings').then(result=>{settings=result.settings||{enabled:true,cosmetic:true,youtube:false,exceptions:[]};update();});
 chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.settings){settings=changes.settings.newValue;update();}});
})();
