#!/usr/bin/env node
// Build-time live-data fetch (v0.4.0): if .env carries Supabase credentials, pull
// the PUBLIC interaction view (RLS: interaction_status='published') via PostgREST
// and write data/live/live.json, which provider.ts overlays onto the demo dataset.
// No credentials, unreachable project, or zero published rows -> no file -> the
// site builds on the labeled demo dataset. Never crashes a build, never fakes.
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
const loadEnv=()=>{
  const p=new URL('../.env',import.meta.url);
  if(!existsSync(p))return null;
  const env={};
  for(const line of readFileSync(p,'utf8').split('\n')){
    const m=line.match(/^([A-Z_]+)=(.*)$/);
    if(m)env[m[1]]=m[2].trim();
  }
  return env.SUPABASE_URL&&env.SUPABASE_PUBLISHABLE_KEY?{url:env.SUPABASE_URL.replace(/\/$/,''),key:env.SUPABASE_PUBLISHABLE_KEY}:null;
};
const outPath=new URL('../data/live/live.json',import.meta.url);
const env=loadEnv();
if(!env){console.log('live-data: no Supabase credentials in .env — building on the demo dataset');process.exit(0);}
const headers={apikey:env.key,Authorization:`Bearer ${env.key}`};
try{
  const select='public_id,receiver_description,knowledge_status,evidence_grade,mimicry_summary,model_kind,observed_on,recorded_by,interaction_status,mimic_taxon:mimic_taxon_id(scientific_name,kingdom),model_taxon:model_taxon_id(scientific_name,kingdom),interaction_reference(claim_roles,locator,reference(id,doi,title,authors,year,journal)),interaction_mimicry_type(vocabulary_term(term,label))';
  const res=await fetch(`${env.url}/rest/v1/mimicry_interaction?select=${encodeURIComponent(select)}`,{headers});
  if(!res.ok)throw new Error(`HTTP ${res.status} on mimicry_interaction`);
  const rows=await res.json();
  const interactions=rows.map(r=>{
    const mk=r.model_kind??'organism';
    const modelSide=mk==='organism'?(r.model_taxon?.kingdom??'unknown'):mk;
    return {
      id:r.public_id,mimic:r.mimic_taxon?.scientific_name??'unresolved',model:r.model_taxon?.scientific_name??'unresolved',
      receiver:r.receiver_description??'not recorded',type:(r.interaction_mimicry_type??[]).map(x=>x.vocabulary_term?.label??x.vocabulary_term?.term).filter(Boolean).join(' / ')||'unclassified',
      evidence:r.evidence_grade??'E0',kingdoms:`${r.mimic_taxon?.kingdom??'unknown'} → ${modelSide}`,
      summary:r.mimicry_summary??'',reference:'live record',
      modalities:[],knowledge:r.knowledge_status??'reported',modelKind:mk,
      observedOn:r.observed_on??undefined,recordedBy:r.recorded_by??undefined,
      refs:(r.interaction_reference??[]).map(ir=>({id:ir.reference?.id,doi:ir.reference?.doi??undefined,
        title:ir.reference?.title??'(untitled reference)',authors:ir.reference?.authors??undefined,
        year:ir.reference?.year??undefined,journal:ir.reference?.journal??undefined,
        claims:ir.claim_roles??[],locator:ir.locator??undefined})).filter(x=>x.id),
      dataStatus:r.interaction_status};
  }).filter(i=>i.id);
  const sysRes=await fetch(`${env.url}/rest/v1/mimicry_system?select=public_id,name,description,system_type,notes,system_interaction(mimicry_interaction(public_id))`,{headers});
  const systems=sysRes.ok?(await sysRes.json()).map(s=>({public_id:s.public_id,name:s.name,description:s.description??'',system_type:s.system_type??'other',notes:s.notes??'',members:(s.system_interaction??[]).map(si=>si.mimicry_interaction?.public_id).filter(Boolean)})):[];
  mkdirSync(new URL('../data/live/',import.meta.url),{recursive:true});
  if(interactions.length===0){
    if(existsSync(outPath))writeFileSync(outPath,JSON.stringify({fetched_at:new Date().toISOString(),published:0,note:'no published interactions yet — site falls back to demo',interactions:[],systems:[]},null,2)+'\n');
    console.log(`live-data: connected, but 0 published interactions — site serves the labeled demo dataset (${systems.length} system(s) visible)`);
    process.exit(0);
  }
  writeFileSync(outPath,JSON.stringify({fetched_at:new Date().toISOString(),published:interactions.length,interactions,systems},null,2)+'\n');
  console.log(`live-data: fetched ${interactions.length} published interactions, ${systems.length} systems from Supabase`);
}catch(e){
  console.log(`live-data: Supabase unavailable (${e.message}) — building on the demo dataset`);
  process.exit(0);
}
