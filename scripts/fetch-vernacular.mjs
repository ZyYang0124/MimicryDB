#!/usr/bin/env node
// Chinese common names — resolved from Wikidata labels via the GBIF usage key (P846).
// Display only; the verbatim dataset name is never rewritten (docs/TAXONOMY_POLICY.md).
// When several Wikidata items share a key, the majority label wins; simplified readings
// are preferred over traditional. Network failure exits 0 so CI stays green (retry later).
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const outPath=new URL('../data/reconciliation/vernacular.json',import.meta.url);
const refresh=process.argv.includes('--refresh');
const gbif=JSON.parse(readFileSync(new URL('../data/reconciliation/gbif.json',import.meta.url),'utf8'));
const out=existsSync(outPath)&&!refresh
  ?JSON.parse(readFileSync(outPath,'utf8'))
  :{generated:new Date().toISOString(),source:'Wikidata labels linked via GBIF usage key (P846)',policy:'Chinese common names for display only — scientific names remain canonical (docs/TAXONOMY_POLICY.md).',names:{}};
out.generated=new Date().toISOString();
const wanted=gbif.results.filter(r=>{
  if(!r.gbif_usageKey||out.names[slugOf(r.input)])return false;
  // Only attach a zh name when the GBIF match really is this taxon: FUZZY matches
  // (e.g. "Myia fugax" → the crab "Myra fugax") and HIGHERRANK matches ("Micrurus"
  // → Animalia) belong to a different taxon and must stay null. Annotated inputs
  // ("Acrocephalus scirpaceus (eggs)") may keep the species' zh name.
  const canon=(r.gbif_canonical??'').trim().toLowerCase();
  const bare=r.input.replace(/\s*\([^)]*\)\s*$/,'').trim().toLowerCase();
  return !canon||canon===r.input.trim().toLowerCase()||canon===bare;
});
if(!wanted.length){console.log('vernacular: nothing to fetch');process.exit(0);}
const q='SELECT ?gbif ?label WHERE { VALUES ?gbif { '+wanted.map(r=>'"'+r.gbif_usageKey+'"').join(' ')
 +' } ?t wdt:P846 ?gbif ; rdfs:label ?label . FILTER(LANG(?label) IN ("zh","zh-cn","zh-hans","zh-sg","zh-tw","zh-hk")) }';
const res=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q),
  {headers:{'User-Agent':'MimicryDB-prototype/0.4 (https://github.com/ZyYang0124/MimicryDB)','Accept':'application/sparql-results+json'}});
if(!res.ok){console.log(`vernacular: Wikidata HTTP ${res.status} — kept ${Object.keys(out.names).length} existing entries, retry later`);writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');process.exit(0);}
const j=await res.json();
// tally per key: label -> score; simplified readings weigh more than traditional
const tally=new Map();
for(const b of j.results?.bindings??[]){
  const key=b.gbif.value,lang=(b.label['xml:lang']??'').toLowerCase(),val=b.label.value;
  const simp=['zh','zh-cn','zh-hans','zh-sg'].includes(lang);
  const t=tally.get(key)??new Map();
  t.set(val,(t.get(val)??0)+(simp?2.5:1));
  tally.set(key,t);
}
for(const r of wanted){
  const slug=slugOf(r.input); const t=tally.get(String(r.gbif_usageKey));
  let best=null,bestN=0;
  if(t)for(const val of [...t.keys()].sort())if(t.get(val)>bestN){best=val;bestN=t.get(val);}
  out.names[slug]={input:r.input,zh:best};
}
writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');
const named=Object.values(out.names).filter(v=>v.zh).length;
console.log(`vernacular: ${named}/${Object.keys(out.names).length} entries carry a zh name (fetched ${wanted.length} this run)`);
function slugOf(name){return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
