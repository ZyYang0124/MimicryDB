import {interactions,type Interaction} from './demo.ts';
export type {Interaction};
export type TaxonSummary={name:string;slug:string;asMimic:number;asModel:number;lineages:string};
export interface DataProvider{all():Interaction[];byId(publicId:string):Interaction|undefined;taxa():TaxonSummary[];}
export const slugify=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const splitKingdoms=(i:Interaction)=>{const [a,b]=i.kingdoms.split(' → ');return [a?.trim()??'',b?.trim()??''];};
export const demoProvider:DataProvider={
  all:()=>interactions,
  byId:(publicId)=>interactions.find(i=>i.id===publicId||i.id.replace(':','-')===publicId),
  taxa:()=>{const acc=new Map<string,{name:string;slug:string;asMimic:number;asModel:number;lineages:Set<string>}>();
    const touch=(name:string,side:'asMimic'|'asModel',lineage:string)=>{let t=acc.get(name);
      if(!t){t={name,slug:slugify(name),asMimic:0,asModel:0,lineages:new Set()};acc.set(name,t);}
      t[side]++; if(lineage)t.lineages.add(lineage);};
    for(const i of interactions){const [mk,dk]=splitKingdoms(i);
      touch(i.mimic,'asMimic',mk); touch(i.model,'asModel',dk);}
    return [...acc.values()].map(t=>({...t,lineages:[...t.lineages].sort().join(' · ')}));}
};
/** Single swap point for a future live adapter (e.g. Supabase); pages import only `data`. */
export const data:DataProvider=demoProvider;
