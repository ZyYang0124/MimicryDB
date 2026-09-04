#!/usr/bin/env node
// Standalone dataset validator (prompt.md §56, §68) — same integrity rules as the
// node:test suite, usable in CI and before any import. Exits non-zero on violation.
import {interactions} from '../src/data/demo.ts';
import vocab from '../data/controlled-vocabularies.json' with {type:'json'};

const problems=[];
const err=(id,msg)=>problems.push(`${id}: ${msg}`);
const ids=new Set();
const kingdoms=new Set(['Animalia','Plantae','Fungi','Protista','Monera','Bacteria','Archaea']);
for(const i of interactions){
  if(!/^MIMICRY:\d{6}$/.test(i.id)) err(i.id,'malformed public_id');
  if(ids.has(i.id)) err(i.id,'duplicate public_id'); ids.add(i.id);
  for(const f of ['mimic','model','receiver','type','kingdoms','summary','reference'])
    if(!i[f]?.trim()) err(i.id,`empty ${f}`);
  if(!/sample data/i.test(i.reference??'')) err(i.id,'demo records must disclose their sample status');
  if(!vocab.evidence_grade.includes(i.evidence)) err(i.id,`unknown evidence grade ${i.evidence}`);
  if(i.mimic===i.model) err(i.id,'mimic equals model');
  const [mk,dk]=i.kingdoms.split(' → ').map(x=>x.trim());
  if(!mk||!dk||!kingdoms.has(mk)||!kingdoms.has(dk)) err(i.id,`malformed kingdom flow "${i.kingdoms}"`);
  for(const m of i.modalities??[])
    if(!vocab.signal_modality.some(t=>t.term===m||t.label.toLowerCase()===m.toLowerCase())) err(i.id,`modality "${m}" outside controlled vocabulary`);
  for(const r of i.refs??[])
    if(!r.id||!r.title) err(i.id,'reference rows need id and title');
}
if(problems.length){console.error(`VALIDATION FAILED (${problems.length})`);for(const p of problems)console.error(' -',p);process.exit(1);}
console.log(`validation OK — ${interactions.length} interactions, ${ids.size} unique public IDs`);
