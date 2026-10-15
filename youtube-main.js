// Original implementation: remove ad scheduling, preserve media and verification.
(() => {
 if (!/(^|\.)youtube(?:-nocookie)?\.com$/.test(location.hostname)) return;
 let enabled=true;
 addEventListener('kelvani:disable-youtube',()=>{enabled=false;});
 const parse=JSON.parse;
 function prune(value){
  if(!enabled||!value||typeof value!=='object')return value;
  for(const candidate of Array.isArray(value)?value:[value]){
   if(!candidate||typeof candidate!=='object')continue;
   const player=candidate.playerResponse||candidate;
   if(!player.videoDetails||!player.streamingData||player.playabilityStatus?.status!=='OK')continue;
   for(const key of ['adPlacements','adSlots']){
    const d=Object.getOwnPropertyDescriptor(player,key);
    if(d?.configurable&&'value' in d)delete player[key];
   }
  }
  return value;
 }
 JSON.parse=new Proxy(parse,{apply(target,receiver,args){return prune(Reflect.apply(target,receiver,args));}});
 const d=Object.getOwnPropertyDescriptor(window,'ytInitialPlayerResponse');
 if(!d||(d.configurable&&'value' in d)){
  let value=prune(d?.value);
  Object.defineProperty(window,'ytInitialPlayerResponse',{configurable:true,enumerable:d?.enumerable??true,get:()=>value,set:next=>{value=prune(next);}});
 }
 window.fetch=new Proxy(window.fetch,{async apply(target,receiver,args){
  const response=await Reflect.apply(target,receiver,args);
  if(!enabled||!response.ok)return response;
  let url;try{url=new URL(typeof args[0]==='string'||args[0] instanceof URL?args[0]:args[0].url,location.href);}catch{return response;}
  if(!/(^|\.)youtube(?:-nocookie)?\.com$/.test(url.hostname)||!/^\/youtubei\/v1\/player$/.test(url.pathname))return response;
  try{
   // A delayed inspection must not stall playback. Keep the original response
   // untouched and return it when inspection cannot finish promptly.
   const copy=response.clone();let timeout;
   const text=await Promise.race([
    copy.text(),
    new Promise(resolve=>{timeout=setTimeout(()=>resolve(null),1500);})
   ]).finally(()=>clearTimeout(timeout));
   if(text===null||!enabled||text.length>5000000)return response;
   const body=Reflect.apply(parse,JSON,[text]),before=JSON.stringify(body);prune(body);const after=JSON.stringify(body);
   if(before===after)return response;
   const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');
   const replacement=new Response(after,{status:response.status,statusText:response.statusText,headers});
   return new Proxy(replacement,{get(object,key){if(['url','redirected','type'].includes(key))return response[key];const value=Reflect.get(object,key,object);return typeof value==='function'?value.bind(object):value;}});
  }catch{return response;}
 }});
 // XHR JSON responses bypass JavaScript JSON.parse; handle those separately.
 const prototype=window.XMLHttpRequest?.prototype;
 const responseDescriptor=prototype&&Object.getOwnPropertyDescriptor(prototype,'response');
 if(responseDescriptor?.configurable&&responseDescriptor.get){
  Object.defineProperty(prototype,'response',{...responseDescriptor,get(){
   const value=Reflect.apply(responseDescriptor.get,this,[]);
   if(!enabled||this.responseType!=='json')return value;
   try{
    const url=new URL(this.responseURL,location.href);
    if(/(^|\.)youtube(?:-nocookie)?\.com$/.test(url.hostname)&&/^\/youtubei\/v1\/player$/.test(url.pathname))return prune(value);
   }catch{}
   return value;
  }});
 }
})();
