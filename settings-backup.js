import {validate} from './core.js';
export function exportSettings(settings,date=new Date().toISOString()){
 return {product:'KelvaniAdBlocker',version:1,createdAt:date,settings:validate(settings)};
}
export function importSettings(text,current){
 if(typeof text!=='string'||text.length>1000000)throw new Error('Die Sicherung ist zu groß.');
 let value;try{value=JSON.parse(text);}catch{throw new Error('Die Datei enthält keine gültige JSON Sicherung.');}
 if(value?.product!=='KelvaniAdBlocker'||value.version!==1)throw new Error('Keine unterstützte KelvaniAdBlocker Sicherung.');
 const incoming=validate(value.settings),latest=validate(current);
 return {...incoming,revision:latest.revision};
}
