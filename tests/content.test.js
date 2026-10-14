import vm from 'node:vm';import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../content.js',import.meta.url),'utf8');
async function fixture(settings,host='www.youtube.com'){
 let change,mutation,clicked=0,removed=0,disconnected=0,showAd=true;const events=[],timers=[],styles=[];
 const skip={getClientRects:()=>[{}],click:()=>clicked++};
 const document={head:{append:style=>styles.push(style)},documentElement:{},createElement:()=>({textContent:'',remove(){removed++;}}),querySelector:()=>showAd?({querySelector:()=>skip}):null};
 const context={document,location:{hostname:host},Event,dispatchEvent:event=>events.push(event.type),setTimeout:fn=>timers.push(fn),MutationObserver:class{constructor(fn){mutation=fn;}observe(){}disconnect(){disconnected++;}},chrome:{storage:{local:{get:async()=>({settings})},onChanged:{addListener:fn=>change=fn}}}};
 vm.createContext(context);vm.runInContext(source,context);await Promise.resolve();
 return {setAd:value=>showAd=value,change:data=>change({settings:{newValue:data}},'local'),mutation:()=>mutation?.(),flush:()=>timers.splice(0).forEach(fn=>fn()),stats:()=>({clicked,removed,disconnected,events,styles})};
}
test('cosmetic styles are removed and modules disabled when protection pauses',async()=>{const data={enabled:true,cosmetic:true,youtube:true,exceptions:[],antiSites:[]};const f=await fixture(data);assert.equal(f.stats().styles.length,0);assert.equal(f.stats().clicked,1);f.change({...data,enabled:false});assert.equal(f.stats().removed,0);assert.equal(f.stats().disconnected,1);assert.ok(f.stats().events.includes('kelvani:disable-youtube'));});
test('queued skip checks cannot click after a website exception is added',async()=>{const data={enabled:true,cosmetic:false,youtube:true,exceptions:[],antiSites:[]};const f=await fixture(data);f.mutation();f.change({...data,exceptions:['youtube.com']});f.flush();assert.equal(f.stats().clicked,1);});
test('excluded sites receive no cosmetic modifications or skip clicks',async()=>{const f=await fixture({enabled:true,cosmetic:true,youtube:true,exceptions:['youtube.com'],antiSites:['youtube.com']});assert.equal(f.stats().styles.length,0);assert.equal(f.stats().clicked,0);assert.ok(f.stats().events.includes('kelvani:disable-compatibility'));});
test('YouTube skip logic does not run on unrelated domains',async()=>{const f=await fixture({enabled:true,cosmetic:true,youtube:true,exceptions:[],antiSites:[]},'example.com');assert.equal(f.stats().clicked,0);});

test('repeated DOM mutations do not repeatedly click the same skip button',async()=>{const f=await fixture({enabled:true,cosmetic:false,youtube:true,exceptions:[],antiSites:[]});f.mutation();f.flush();f.mutation();f.flush();assert.equal(f.stats().clicked,1);});
test('callbacks from an old generation cannot click after pause and re-enable',async()=>{const data={enabled:true,cosmetic:false,youtube:true,exceptions:[],antiSites:[]};const f=await fixture(data);f.mutation();f.change({...data,enabled:false});f.change(data);f.flush();assert.equal(f.stats().clicked,1);});

test('the same DOM button can be used for a later ad after the previous ad ends',async()=>{const f=await fixture({enabled:true,cosmetic:false,youtube:true,exceptions:[],antiSites:[]});f.setAd(false);f.mutation();f.flush();f.setAd(true);f.mutation();f.flush();assert.equal(f.stats().clicked,2);});

test('YouTube gets no cosmetic hiding and old page hooks are disabled even when assistant is on',async()=>{const f=await fixture({enabled:true,cosmetic:true,youtube:true,exceptions:[],antiSites:[]});assert.equal(f.stats().styles.length,0);assert.ok(f.stats().events.includes('kelvani:disable-youtube'));});
