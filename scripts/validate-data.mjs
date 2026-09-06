#!/usr/bin/env node
// Standalone dataset validator (prompt.md §56, §68) — same integrity rules as the
// node:test suite, usable in CI and before any import. Exits non-zero on violation.
import {interactions} from '../src/data/demo.ts';
import vocab from '../data/controlled-vocabularies.json' with {type:'json'};

const problems=[];
const err=(id,msg)=>problems.push(`${id}: ${msg}`);
const ids=new Set();
const kingdoms=new Set(['Animalia','Plantae','Fungi','Protista','Monera','Bacteria','Archaea']);
const modelSideKinds=new Set([...kingdoms,'environment','object']); // models may be an environment or an inanimate object rather than a taxon
const modelKinds=new Set(vocab.model_kind.map(t=>t.term));
const claimRoles=new Set(vocab.claim_role.map(t=>t.term));
for(const i of interactions){
  if(!/^MIMICRY:\d{6}$/.test(i.id)) err(i.id,'malformed public_id');
  if(ids.has(i.id)) err(i.id,'duplicate public_id'); ids.add(i.id);
  for(const f of ['mimic','model','receiver','type','kingdoms','summary','reference'])
    if(!i[f]?.trim()) err(i.id,`empty ${f}`);
  if(!/sample data/i.test(i.reference??'')) err(i.id,'demo records must disclose their sample status');
  if(!vocab.evidence_grade.includes(i.evidence)) err(i.id,`unknown evidence grade ${i.evidence}`);
  if(i.mimic===i.model) err(i.id,'mimic equals model');
  const [mk,dk]=i.kingdoms.split(' → ').map(x=>x.trim());
  if(!mk||!dk||!kingdoms.has(mk)||!modelSideKinds.has(dk)) err(i.id,`malformed kingdom flow "${i.kingdoms}"`);
  if(i.modelKind&&!modelKinds.has(i.modelKind)) err(i.id,`model_kind "${i.modelKind}" outside controlled vocabulary`);
  if(dk==='environment'&&i.modelKind&&i.modelKind!=='environment') err(i.id,'model side "environment" requires model_kind=environment');
  if(dk==='object'&&i.modelKind&&i.modelKind!=='object') err(i.id,'model side "object" requires model_kind=object');
  for(const m of i.modalities??[])
    if(!vocab.signal_modality.some(t=>t.term===m||t.label.toLowerCase()===m.toLowerCase())) err(i.id,`modality "${m}" outside controlled vocabulary`);
  for(const r of i.refs??[]){
    if(!r.id||!r.title) err(i.id,'reference rows need id and title');
    if(!r.claims?.length) err(i.id,`reference ${r.id}: claim-level citation required (claims[])`);
    for(const c of r.claims??[]) if(!claimRoles.has(c)) err(i.id,`claim "${c}" outside controlled vocabulary`);
    if(r.claims&&new Set(r.claims).size!==r.claims.length) err(i.id,`reference ${r.id}: duplicate claims`);
  }
  if(i.observedOn!==undefined&&!/^\d{4}-\d{2}-\d{2}$/.test(i.observedOn)) err(i.id,'observedOn must be an ISO date (YYYY-MM-DD)');
  if(i.recordedBy!==undefined&&!i.recordedBy?.trim()) err(i.id,'recordedBy empty when present');
}
if(problems.length){console.error(`VALIDATION FAILED (${problems.length})`);for(const p of problems)console.error(' -',p);process.exit(1);}
console.log(`validation OK — ${interactions.length} interactions, ${ids.size} unique public IDs`);
