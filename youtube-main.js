// Original Kelvani implementation. Runs only on YouTube, after explicit opt-in.
(() => {
 if(!/(^|\.)youtube\.com$/.test(location.hostname))return;
 let active=true;
 addEventListener('kelvani:disable-youtube',()=>{active=false;});
 const adKeys=['adPlacements','playerAds','adSlots'];
 function cleanPlayer(value) {
  if(!active || !value || typeof value!=='object')return value;
  // Do not traverse arbitrary page data or alter playability/attestation fields.
  const targets=[value,value.playerResponse];
  if(Array.isArray(value))for(const item of value.slice(0,100))if(item?.playerResponse)targets.push(item.playerResponse);
  for(const target of targets) {
   if(!target || typeof target!=='object')continue;
   for(const key of adKeys)if(Object.hasOwn(target,key)){
    const descriptor=Object.getOwnPropertyDescriptor(target,key);
    if(descriptor?.configurable)delete target[key];
   }
  }
  return value;
 }
 const descriptor=Object.getOwnPropertyDescriptor(window,'ytInitialPlayerResponse');
 if(!descriptor || (descriptor.configurable && 'value' in descriptor)) {
  let response=cleanPlayer(descriptor?.value);
  Object.defineProperty(window,'ytInitialPlayerResponse',{configurable:true,enumerable:true,get(){return active?cleanPlayer(response):response;},set(value){response=cleanPlayer(value);}});
 }
 const original=window.fetch;
 if(typeof original!=='function')return;
 window.fetch=async function(input,init){
  const response=await Reflect.apply(original,this,[input,init]);
  if(!active || !response.ok)return response;
  let url;
  try{url=new URL(typeof input==='string'||input instanceof URL ? String(input) : input.url,location.href);}catch{return response;}
  if(!/(^|\.)youtube\.com$/.test(url.hostname) || url.pathname!=='/youtubei/v1/player')return response;
  const contentType=response.headers.get('content-type')||'';
  if(!contentType.includes('application/json'))return response;
  const length=Number(response.headers.get('content-length')||0);
  if(length>5_000_000)return response;
  try {
   const text=await response.clone().text();if(text.length>5_000_000)return response;
   const parsed=JSON.parse(text); const before=JSON.stringify(parsed);cleanPlayer(parsed);const after=JSON.stringify(parsed);
   if(before===after)return response;
   const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');
   const result=new Response(after,{status:response.status,statusText:response.statusText,headers});
   Object.defineProperties(result,{url:{value:response.url},redirected:{value:response.redirected},type:{value:response.type}});
   return result;
  }catch{return response;}
 };
})();
