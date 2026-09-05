import test from 'node:test'; import assert from 'node:assert/strict';
import {interactions} from '../src/data/demo.ts';
import {data,detectDuplicates} from '../src/data/provider.ts';
import {csv,parseCsv} from '../src/lib/csv.ts';
import {validateRow,HEADER} from '../src/lib/validation.ts';
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

test('import validator accepts the template-shaped row and flags bad grades',()=>{
  const row=Object.fromEntries(HEADER.map(h=>[h,'']));
  Object.assign(row,{public_id:'MIMICRY:000099',mimic:'Example mimicus',model:'Example modelus',receiver:'predator',mimicry_summary:'Test summary',kingdom_flow:'Animalia → Animalia',evidence_grade:'E1',data_status:'DEMO'});
  const ok=validateRow(row,new Set(),[],0);
  assert.equal(ok.errors.length,0,ok.errors.join('; '));
  const bad={...row,evidence_grade:'E9',kingdom_flow:'Cloud → Animalia'};
  const badReport=validateRow(bad,new Set(),[],0);
  assert.ok(badReport.errors.some(e=>e.includes('E0–E4')));
  assert.ok(badReport.errors.some(e=>e.includes('kingdom_flow')));
});

test('CSV parser round-trips quoted fields with embedded commas and newlines',()=>{
  const text=csv(['a','b'],[['line1, with comma','say "hi"'],['plain','multi\nline']]);
  const parsed=parseCsv(text);
  assert.deepEqual(parsed[1],['line1, with comma','say "hi"']);
  assert.deepEqual(parsed[2],['plain','multi\nline']);
});

test('query API supports the documented patterns (model=, kingdom=, min evidence, paging)',()=>{
  const formicidae=data.query({model:'Formicidae'});
  assert.equal(formicidae.total,1);
  assert.equal(formicidae.items[0].id,'MIMICRY:000001');
  const cross=data.query({crossKingdomOnly:true,pageSize:2});
  assert.equal(cross.total,2,'demo dataset has 2 cross-kingdom records');
  assert.equal(cross.items.length,2,'pageSize respected');
  const strong=data.query({minEvidence:'E3'});
  assert.equal(strong.total,5,'E3+ filter');
  const plantMimics=data.query({mimicKingdom:'Plantae'});
  assert.equal(plantMimics.total,2);
});

test('GBIF reconciliation report covers every taxon name and is reviewable',async()=>{
  const {gbifFor}=await import('../src/data/provider.ts');
  const {readFileSync}=await import('node:fs');
  const report=JSON.parse(readFileSync(new URL('../data/reconciliation/gbif.json',import.meta.url),'utf8'));
  assert.equal(report.policy.includes('never rewritten'),true,'report must state the no-rewrite policy');
  for(const t of data.taxa()){
    const m=gbifFor(t.name);
    assert.ok(m,`no reconciliation entry for ${t.name}`);
    if(['EXACT','FUZZY'].includes(m.matchType))assert.ok(m.gbif_usageKey,`${t.name}: ${m.matchType} match requires usageKey`);
    if(m.matchType==='NOT_A_SCIENTIFIC_NAME')assert.ok(m.note.includes('curation'),`${t.name}: descriptive entries must request curation`);
  }
});

test('image manifest entries carry attribution and their files exist',async()=>{
  const {readFileSync,existsSync}=await import('node:fs');
  const manifestPath=new URL('../data/images.json',import.meta.url);
  if(!existsSync(manifestPath))return; // image pipeline not run yet
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  assert.match(manifest.policy,/attribution/i,'manifest must require attribution');
  for(const [slug,img] of Object.entries(manifest.images)){
    assert.ok(img.license&&img.license!=='unknown',`${slug}: license missing`);
    assert.ok(img.artist,`${slug}: artist attribution missing`);
    assert.ok(img.page,`${slug}: source page missing`);
    const local=new URL('../public'+img.file.replace('/MimicryDB',''),import.meta.url);
    assert.ok(existsSync(local),`${slug}: image file ${img.file} not found in public/`);
  }
});

test('evidence export invariants: grades align between interaction and vocabularies',()=>{
  const grades=new Set(vocab.evidence_grade);
  for(const i of interactions)assert.ok(grades.has(i.evidence),`${i.id}: grade not in vocabulary`);
  assert.ok(data.all().length===interactions.length);
});
