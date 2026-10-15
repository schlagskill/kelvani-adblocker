import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
const source=fs.readFileSync(new URL('../youtube-main.js',import.meta.url),'utf8');
const player=()=>({videoDetails:{videoId:'a'},streamingData:{formats:[{url:'https://media.example/video'}]},playabilityStatus:{status:'OK'},attestation:{token:'keep'},playerAds:[{verification:'keep'}],adPlacements:[{advert:'pre-roll'}],adSlots:[{advert:'mid-roll'}]});
function page(fetcher=async()=>new Response(JSON.stringify(player()),{headers:{'content-type':'application/json'}})){
 const events=new Map();const c={URL,Response,Headers,setTimeout,clearTimeout,location:{hostname:'www.youtube.com',href:'https://www.youtube.com/watch?v=a'},fetch:fetcher,addEventListener:(key,fn)=>events.set(key,fn)};c.window=c;vm.createContext(c);vm.runInContext(source,c);return {c,disable:()=>events.get('kelvani:disable-youtube')()};
}
test('bootstrap removes ad scheduling before player reads it, retains video and verification',()=>{const {c}=page();const value=player();c.ytInitialPlayerResponse=value;assert.equal(value.adSlots,undefined);assert.equal(value.adPlacements,undefined);assert.equal(value.attestation.token,'keep');assert.equal(value.playerAds[0].verification,'keep');assert.equal(value.streamingData.formats[0].url,'https://media.example/video');});
test('native response json receives filtered player data without skip clicks',async()=>{const {c}=page();const r=await c.fetch('/youtubei/v1/player?prettyPrint=false');const value=await r.json();assert.equal(value.adSlots,undefined);assert.equal(value.videoDetails.videoId,'a');assert.equal(r.bodyUsed,true);});
test('JSON parse covers nested initial navigation and XHR text payloads',()=>{const {c}=page();const text=JSON.stringify([{playerResponse:player()}]);c.payload=text;const result=vm.runInContext('JSON.parse(payload)',c);assert.equal(result[0].playerResponse.adPlacements,undefined);});
test('unrelated fetch and malformed player payload preserve response identity',async()=>{for(const [url,body] of [['https://other.example/youtubei/v1/player',JSON.stringify(player())],['/youtubei/v1/player','not json'],['/youtubei/v1/next',JSON.stringify(player())]]){const original=new Response(body);const {c}=page(async()=>original);assert.equal(await c.fetch(url),original);assert.equal(original.bodyUsed,false);}});
test('unplayable or incomplete player responses remain unchanged',()=>{const {c}=page();for(const value of [{...player(),playabilityStatus:{status:'UNPLAYABLE'}},{adPlacements:[1]}]){c.ytInitialPlayerResponse=value;assert.ok(value.adPlacements);}});
test('pause stops pending responses and later bootstrap mutation',async()=>{let resolve;const {c,disable}=page(()=>new Promise(r=>resolve=r));const waiting=c.fetch('/youtubei/v1/player');disable();const original=new Response(JSON.stringify(player()));resolve(original);assert.equal(await waiting,original);const value=player();c.ytInitialPlayerResponse=value;assert.ok(value.adPlacements);});
test('network rejection and JSON reviver behavior remain intact',async()=>{const {c}=page(async()=>{throw Error('offline')});await assert.rejects(c.fetch('/youtubei/v1/player'),/offline/);assert.equal(vm.runInContext('JSON.parse("{\\"a\\":2}", (k,v)=>k==="a"?v+1:v).a',c),3);});
test('stalled response inspection falls back to the untouched player response',async()=>{
 const original={ok:true,clone:()=>({text:()=>new Promise(()=>{})})};
 const {c}=page(async()=>original);let deadline;
 c.setTimeout=fn=>{deadline=setTimeout(fn,5);return deadline;};
 assert.equal(await c.fetch('/youtubei/v1/player'),original);
});

test('XHR JSON player response is filtered while binary and unrelated responses remain intact',()=>{
 let body=player();class XHR{constructor(url,type='json'){this.responseURL=url;this.responseType=type;}}
 Object.defineProperty(XHR.prototype,'response',{configurable:true,get(){return body;}});
 const c={URL,Response,Headers,XMLHttpRequest:XHR,location:{hostname:'www.youtube.com',href:'https://www.youtube.com/watch?v=a'},fetch:async()=>new Response('{}'),addEventListener(){}};c.window=c;vm.createContext(c);vm.runInContext(source,c);
 assert.equal(new XHR('https://www.youtube.com/youtubei/v1/player').response.adSlots,undefined);
 body=player();assert.ok(new XHR('https://other.example/youtubei/v1/player').response.adSlots);
 assert.ok(new XHR('https://www.youtube.com/youtubei/v1/player','arraybuffer').response.adSlots);
});
