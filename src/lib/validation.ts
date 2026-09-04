import vocab from '../../data/controlled-vocabularies.json' with {type:'json'};
export type Row=Record<string,string>;
export type Report={errors:string[];warnings:string[];duplicates:string[]};
const KINGDOMS=new Set(['Animalia','Plantae','Fungi','Protista','Monera','Bacteria','Archaea']);
export const HEADER=['public_id','mimic','model','receiver','mimicry_type','signal_modalities','knowledge_status','evidence_grade','mimicry_summary','kingdom_flow','data_status'] as const;
const GRADES=new Set(vocab.evidence_grade);
const MODS=new Set(vocab.signal_modality.flatMap(t=>[t.term,t.label.toLowerCase()]));
/** Row-level validation for curator CSV import (prompt.md §45). Pure function — no I/O, no DB. */
export const validateRow=(row:Row,seenIds:Set<string>,existing:Row[]=[],index=0)=>{const r:Report={errors:[],warnings:[],duplicates:[]};
  const id=row.public_id??''; const at=`row ${index+2} (${id||'missing id'})`;
  if(!/^MIMICRY:\d{6}$/.test(id))r.errors.push(`${at}: public_id must match MIMICRY:NNNNNN`);
  if(seenIds.has(id))r.errors.push(`${at}: duplicate public_id in file`); seenIds.add(id);
  for(const f of ['mimic','model','receiver','mimicry_summary','kingdom_flow'])
    if(!row[f]?.trim())r.errors.push(`${at}: empty ${f}`);
  if(!/sample|demo/i.test(row.data_status??''))r.errors.push(`${at}: data_status must disclose DEMO/sample provenance`);
  if(!GRADES.has(row.evidence_grade??''))r.errors.push(`${at}: evidence_grade outside E0–E4 vocabulary`);
  if(row.knowledge_status&&row.knowledge_status!=='reported'&&row.knowledge_status!=='supported'&&row.knowledge_status!=='inferred')
    r.errors.push(`${at}: knowledge_status must be reported|supported|inferred`);
  const [mk,dk]=String(row.kingdom_flow??'').split(' → ').map(x=>x.trim());
  if(!mk||!dk||!KINGDOMS.has(mk)||!KINGDOMS.has(dk))r.errors.push(`${at}: kingdom_flow must be "X → Y" with known kingdoms`);
  for(const m of (row.signal_modalities??'').split(';').map(x=>x.trim()).filter(Boolean))
    if(!MODS.has(m))r.warnings.push(`${at}: modality "${m}" outside controlled vocabulary`);
  const pair=`${row.mimic} → ${row.model}`;
  for(const ex of existing)if(`${ex.mimic} → ${ex.model}`===pair&&ex.public_id!==id)
    r.duplicates.push(`${at}: potential existing interaction ${ex.public_id} shares pair "${pair}" — link, merge, or keep separate (curator decision)`);
  return r;};
export const mergeReports=(a:Report,b:Report):Report=>({errors:[...a.errors,...b.errors],warnings:[...a.warnings,...b.warnings],duplicates:[...a.duplicates,...b.duplicates]});