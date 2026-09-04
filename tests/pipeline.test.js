import test from 'node:test'; import assert from 'node:assert/strict';
import {interactions} from '../src/data/demo.ts';
import {data,detectDuplicates} from '../src/data/provider.ts';
import {csv} from '../src/lib/csv.ts';
import vocab from '../data/controlled-vocabularies.json' with {type:'json'};

test('same mimic+model pair is allowed when contexts differ (no global uniqueness)',()=>{
  const dup={...interactions[0],id:'MIMICRY:000099',receiver:'different receiver class',type:'masquerade'};
  const flagged=detectDuplicates([...interactions,dup]);
  assert.equal(flagged.length,1);
  assert.deepEqual(flagged[0].ids,[interactions[0].id,'MIMICRY:000099']);
  assert.equal(detectDuplicates(interactions).length,0);
});

test('CSV writer escapes quotes and keeps column counts',()=>{
  const out=csv(['a','b'],[['plain','with "quotes" and, comma'],['x',undefined]]);
  const lines=out.split('\n');
  assert.equal(lines.length,3);
  assert.equal(lines[1],'"plain","with ""quotes"" and, comma"');
  assert.equal(lines[2],'"x",""');
});

test('demo modalities stay inside the controlled vocabulary',()=>{
  const terms=new Set(vocab.signal_modality.flatMap(t=>[t.term,t.label.toLowerCase()]));
  for(const i of interactions)for(const m of i.modalities??[])
    assert.ok(terms.has(m),`${i.id}: modality "${m}" outside vocabulary`);
});

test('vocabularies are non-empty and uniquely termed',()=>{
  for(const [name,terms] of Object.entries(vocab)){
    assert.ok(Array.isArray(terms)&&terms.length>0,`${name} empty`);
    const keys=terms.map(t=>typeof t==='string'?t:t.term);
    assert.equal(new Set(keys).size,keys.length,`${name} has duplicate terms`);
  }
});

test('candidates carry full extraction provenance and stay demo-labeled',()=>{
  for(const c of data.candidates()){
    for(const f of ['proposed_mimic','proposed_model','extraction_model','extraction_prompt_version','reference','evidence_text'])
      assert.ok(c[f]?.trim(),`${c.id}: empty ${f}`);
    assert.match(c.note,/not from any real publication/,`${c.id}: synthetic candidates must disclose their status`);
    assert.match(c.evidence_text,/placeholder/);
    assert.ok(c.extraction_confidence>=0&&c.extraction_confidence<=1);
  }
});

test('seed.sql stays in sync with the dataset and never seeds published rows',async()=>{
  const {readFileSync}=await import('node:fs');
  const seed=readFileSync(new URL('../supabase/seed.sql',import.meta.url),'utf8');
  for(const i of interactions)assert.ok(seed.includes(i.id),`seed.sql missing ${i.id}`);
  assert.ok(!/\bpublished\b/.test(seed.replace(/never seeds published|RLS/g,'')),'seed.sql must not set published status');
  assert.match(seed,/interaction_status='candidate'/);
});

test('evidence export invariants: grades align between interaction and vocabularies',()=>{
  const grades=new Set(vocab.evidence_grade);
  for(const i of interactions)assert.ok(grades.has(i.evidence),`${i.id}: grade not in vocabulary`);
  assert.ok(data.all().length===interactions.length);
});
