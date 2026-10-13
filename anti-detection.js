// Compatibility for two named detection libraries; no universal invisibility claim.
// Registered only for sites individually enabled by the user.
(() => {
 let active=true;
 addEventListener('kelvani:disable-compatibility',()=>{active=false;});
 function Detector(){this.clearEvent();}
 Detector.prototype.setOption=function(){return this;};
 Detector.prototype.clearEvent=function(){this.callbacks=[];this.pending=false;return this;};
 Detector.prototype.onDetected=function(){return this;};
 Detector.prototype.onNotDetected=function(callback){if(typeof callback==='function'){this.callbacks.push(callback);this.emitEvent();}return this;};
 Detector.prototype.on=function(detected,callback){return detected?this.onDetected(callback):this.onNotDetected(callback);};
 Detector.prototype.emitEvent=function(){if(this.pending)return this;this.pending=true;queueMicrotask(()=>{this.pending=false;if(active)for(const callback of this.callbacks.slice()){try{callback();}catch{}}});return this;};
 Detector.prototype.check=function(){return this.emitEvent();};
 Detector.prototype._checkBait=function(){return this.emitEvent();};
 const instance=new Detector();
 for(const [key,replacement] of [['BlockAdBlock',Detector],['FuckAdBlock',Detector],['blockAdBlock',instance],['fuckAdBlock',instance]]){
  const descriptor=Object.getOwnPropertyDescriptor(window,key);
  if(descriptor && (!descriptor.configurable || !('value' in descriptor)))continue;
  let original=descriptor?.value;
  Object.defineProperty(window,key,{configurable:true,enumerable:true,get(){return active?replacement:original;},set(value){original=value;}});
 }
})();
