import {interactions,type Interaction,type DemoReference} from './demo.ts';
export type {Interaction,DemoReference};
export type TaxonSummary={name:string;slug:string;asMimic:number;asModel:number;lineages:string};
export type ReferenceSummary={ref:DemoReference;supports:number};
export interface DataProvider{
  all():Interaction[];
  byId(publicId:string):Interaction|undefined;
  taxa():TaxonSummary[];
  references():ReferenceSummary[];
  refsFor(publicId:string):DemoReference[];
  interactionsForRef(refId:string):Interaction[];
}
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
    return [...acc.values()].map(t=>({...t,lineages:[...t.lineages].sort().join(' · ')}));},
  references:()=>{const acc=new Map<string,ReferenceSummary>();
    for(const i of interactions)for(const r of i.refs??[]){
      if(!acc.has(r.id))acc.set(r.id,{ref:r,supports:0}); acc.get(r.id)!.supports++;}
    return [...acc.values()];},
  refsFor:(publicId)=>{const i=interactions.find(x=>x.id===publicId||x.id.replace(':','-')===publicId);return i?.refs??[];},
  interactionsForRef:(refId)=>interactions.filter(i=>(i.refs??[]).some(r=>r.id===refId))
};
/** Single swap point for a future live adapter (e.g. Supabase); pages import only `data`. */
export const data:DataProvider=demoProvider;
