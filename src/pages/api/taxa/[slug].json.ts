import type {APIRoute,GetStaticPaths} from 'astro'; import {data} from '../../../data/provider';
export const prerender=true;
export const getStaticPaths:GetStaticPaths=()=>data.taxa().map(t=>({params:{slug:t.slug}}));
export const GET:APIRoute=({params})=>{
  const t=data.taxa().find(x=>x.slug===params.slug);
  if(!t)return new Response(JSON.stringify({error:'taxon not found'}),{status:404,headers:{'Content-Type':'application/json'}});
  const related=data.all().filter(i=>i.mimic===t.name||i.model===t.name);
  const eProfile:Record<string,number>={};
  for(const i of related)eProfile[i.evidence]=(eProfile[i.evidence]??0)+1;
  return new Response(JSON.stringify({
    name:t.name,slug:t.slug,asMimic:t.asMimic,asModel:t.asModel,lineages:t.lineages,
    models:[...new Set(related.filter(i=>i.mimic===t.name).map(i=>i.model))],
    mimics:[...new Set(related.filter(i=>i.model===t.name).map(i=>i.mimic))],
    signal_modalities:[...new Set(related.flatMap(i=>i.modalities??[]))],
    mimicry_types:[...new Set(related.map(i=>i.type))],
    evidence_profile:eProfile,interactions:related,
    systems:data.systems().filter(s=>s.members.some(m=>related.some(i=>i.id===m))).map(s=>s.public_id)},null,1),{headers:{'Content-Type':'application/json'}});
};
