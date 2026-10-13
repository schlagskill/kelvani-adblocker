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
 function playerEndpoint(input){try{const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url,location.href);return /(^|\.)youtube\.com$/.test(url.hostname)&&['/youtubei/v1/player','/youtubei/v1/next'].includes(url.pathname);}catch{return false;}}
 function cleanText(text){if(!active||typeof text!=='string'||text.length>5_000_000)return text;try{const value=JSON.parse(text);const before=JSON.stringify(value);cleanPlayer(value);const after=JSON.stringify(value);return before===after?text:after;}catch{return text;}}
 const XHR=window.XMLHttpRequest;
 if(typeof XHR==='function'){
  const prototype=XHR.prototype,requests=new WeakMap(),open=prototype.open;
  if(typeof open==='function'){
   prototype.open=function(method,url,...args){requests.delete(this);const result=Reflect.apply(open,this,[method,url,...args]);requests.set(this,playerEndpoint(url));return result;};
   for(const name of ['responseText','response']){
    const descriptor=Object.getOwnPropertyDescriptor(prototype,name);
    if(!descriptor?.configurable||typeof descriptor.get!=='function')continue;
    Object.defineProperty(prototype,name,{...descriptor,get(){const value=Reflect.apply(descriptor.get,this,[]);if(!active||this.readyState!==4||!requests.get(this)||this.status<200||this.status>=300)return value;const type=this.getResponseHeader('content-type')||'';if(!type.includes('application/json'))return value;if(typeof value==='string')return cleanText(value);if(this.responseType==='json'&&value&&typeof value==='object')return cleanPlayer(value);return value;}});
   }
  }
 }
 const original=window.fetch;
 if(typeof original!=='function')return;
 window.fetch=async function(input,init){
  const response=await Reflect.apply(original,this,[input,init]);
  if(!active||!response.ok||!playerEndpoint(input))return response;
  if(!(response.headers.get('content-type')||'').includes('application/json'))return response;
  if(Number(response.headers.get('content-length')||0)>5_000_000)return response;
  try{const text=await response.clone().text(),after=cleanText(text);if(after===text)return response;const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');const result=new Response(after,{status:response.status,statusText:response.statusText,headers});Object.defineProperties(result,{url:{value:response.url},redirected:{value:response.redirected},type:{value:response.type}});return result;}catch{return response;}
 };
})();
