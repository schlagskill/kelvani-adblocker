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
test('enabled YouTube filter is not disabled by initial content script',async()=>{const f=await fixture({enabled:true,cosmetic:true,youtube:true,exceptions:[],antiSites:[]});assert.equal(f.stats().clicked,0);assert.ok(!f.stats().events.includes('kelvani:disable-youtube'));});
test('pausing and website exceptions disable player filtering without clicking',async()=>{const data={enabled:true,cosmetic:true,youtube:true,exceptions:[],antiSites:[]};const f=await fixture(data);f.change({...data,exceptions:['youtube.com']});assert.equal(f.stats().clicked,0);assert.ok(f.stats().events.includes('kelvani:disable-youtube'));});

test('global compatibility stays active and website exceptions still disable it',async()=>{const state={enabled:true,cosmetic:false,youtube:false,compatibilityAll:true,exceptions:[],antiSites:[]};const f=await fixture(state,'news.example.com');assert.ok(!f.stats().events.includes('kelvani:disable-compatibility'));f.change({...state,exceptions:['example.com']});assert.ok(f.stats().events.includes('kelvani:disable-compatibility'));});
