#!/usr/bin/env node
// Reconcile dataset taxon names against the GBIF backbone (prompt.md §73).
// Reviewable by design: results go to data/reconciliation/gbif.json — names in the
// dataset are NEVER rewritten; curators decide on any correction (TAXONOMY_POLICY).
import {interactions} from '../src/data/demo.ts';
import {data} from '../src/data/provider.ts';
import {writeFileSync, mkdirSync} from 'node:fs';

const cleanForQuery=(name)=>{
  const base=name.replace(/\s*\([^)]*\)\s*/g,' ').trim(); // drop life-stage/annotation suffixes like "(eggs)"
  const words=base.split(/\s+/);
  const looksScientific=/^[A-Z][a-z]+/.test(base)&&words.length<=3&&!/^(female|male|neighbouring|foliage|bird|flowering)/i.test(base);
  return {base,looksScientific};
};

const names=data.taxa().map(t=>t.name);
const expectedKingdom=new Map();
for(const i of interactions){const [mk,dk]=i.kingdoms.split(' → ').map(x=>x.trim());
  expectedKingdom.set(i.mimic,mk); if(dk)expectedKingdom.set(i.model,dk);}

const report=[]; let fails=0;
for(const name of names){
  const {base,looksScientific}=cleanForQuery(name);
  if(!looksScientific){
    report.push({input:name,queriedAs:null,matchType:'NOT_A_SCIENTIFIC_NAME',note:'descriptive/functional model class — curation required, no GBIF lookup attempted'});
    continue;
  }
  let ok=false;
  for(let attempt=1;attempt<=3&&!ok;attempt++){
    try{
      const res=await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(base)}&strict=false`,{headers:{'User-Agent':'MimicryDB-prototype (research)'}});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const j=await res.json();
      report.push({input:name,queriedAs:base,matchType:j.matchType,confidence:j.confidence??null,
        gbif_usageKey:j.usageKey??null,gbif_canonical:j.canonicalName??null,gbif_scientificName:j.scientificName??null,
        gbif_rank:j.rank??null,gbif_kingdom:j.kingdom??null,gbif_status:j.synonym? 'synonym':'accepted/taxon',
        warning:(j.kingdom&&expectedKingdom.get(name)&&j.kingdom!==expectedKingdom.get(name))?`kingdom differs from dataset flow (${expectedKingdom.get(name)})`:null});
      ok=true;
    }catch(e){
      if(attempt===3){fails++;report.push({input:name,queriedAs:base,matchType:'LOOKUP_FAILED',note:`network/API failure after 3 attempts: ${e.message}`});}
      else await new Promise(r=>setTimeout(r,1500));
    }
  }
  await new Promise(r=>setTimeout(r,150)); // polite rate
}
mkdirSync(new URL('../data/reconciliation/',import.meta.url),{recursive:true});
writeFileSync(new URL('../data/reconciliation/gbif.json',import.meta.url),JSON.stringify({source:'GBIF species match API (https://api.gbif.org/v1/species/match)',generated:new Date().toISOString(),policy:'reviewable reconciliation only — dataset names are never rewritten',results:report},null,2));
const matched=report.filter(r=>['EXACT','FUZZY','HIGHRANK'].includes(r.matchType)).length;
console.log(`reconciliation report written: ${report.length} taxa, ${matched} GBIF matches, ${report.filter(r=>r.matchType==='LOOKUP_FAILED').length} lookup failures`);
