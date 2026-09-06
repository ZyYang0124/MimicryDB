import test from 'node:test'; import assert from 'node:assert/strict';
import {interactions} from '../src/data/demo.ts';
import {data,detectDuplicates,slugify} from '../src/data/provider.ts';
import {csv,parseCsv} from '../src/lib/csv.ts';
import {validateRow,HEADER} from '../src/lib/validation.ts';
import vocab from '../data/controlled-vocabularies.json' with {type:'json'};

test('same mimic+model pair is allowed when contexts differ (no global uniqueness)',()=>{
  const dup={...interactions[0],id:'MIMICRY:000099',receiver:'different receiver class',type:'masquerade'};
  const flagged=detectDuplicates([...interactions,dup]);
  assert.equal(flagged.length,1);
  assert.deepEqual(flagged[0].ids,[interactions[0].id,'MIMICRY:000099']);
  assert.equal(detectDuplicates(interactions).length,0,'the mutual Müllerian pair is NOT a duplicate — detection is direction-aware');
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

test('references carry claim-level citations inside the controlled vocabulary',()=>{
  const roles=new Set(vocab.claim_role.map(t=>t.term));
  for(const i of interactions){
    assert.ok(i.refs?.length,`${i.id}: at least one reference row`);
    for(const r of i.refs??[]){
      assert.ok(r.claims&&r.claims.length>0,`${i.id}/${r.id}: claims[] required (AntWeb/AntCat lesson)`);
      for(const c of r.claims)assert.ok(roles.has(c),`${i.id}/${r.id}: claim "${c}" outside vocabulary`);
      assert.equal(new Set(r.claims).size,r.claims.length,`${i.id}/${r.id}: duplicate claims`);
    }
  }
});

test('demo records fabricate no observation metadata',()=>{
  for(const i of interactions){
    assert.equal(i.observedOn,undefined,`${i.id}: demo records must not invent observation dates`);
    assert.equal(i.recordedBy,undefined,`${i.id}: demo records must not invent recorders`);
  }
});

test('image manifest asset ids are unique and stable-format',async()=>{
  const {readFileSync,existsSync}=await import('node:fs');
  const p=new URL('../data/images.json',import.meta.url); if(!existsSync(p))return;
  const m=JSON.parse(readFileSync(p,'utf8'));
  const ids=Object.values(m.images).map(x=>x.id).filter(Boolean);
  assert.equal(new Set(ids).size,ids.length,'asset ids must be unique');
  for(const id of ids)assert.match(id,/^IMG-\d{4}$/);
});

test('vernacular report is display-only and guarded against fuzzy GBIF matches',async()=>{
  const {readFileSync,existsSync}=await import('node:fs');
  const {gbifFor}=await import('../src/data/provider.ts');
  const p=new URL('../data/reconciliation/vernacular.json',import.meta.url);
  if(!existsSync(p))return;
  const v=JSON.parse(readFileSync(p,'utf8'));
  assert.match(v.policy,/display only/i,'vernacular report must state the display-only policy');
  for(const e of Object.values(v.names)){
    if(!e.zh)continue;
    const g=gbifFor(e.input);
    const canon=(g?.gbif_canonical??'').toLowerCase();
    const bare=e.input.replace(/\s*\([^)]*\)\s*$/,'').toLowerCase();
    assert.ok(!canon||canon===e.input.toLowerCase()||canon===bare,
      `${e.input}: zh name attached despite non-exact GBIF match (${canon})`);
  }
});

test('twinPath mirrors every EN page to /zh/ and back (language toggle + hreflang)',async()=>{
  const {twinPath}=await import('../src/i18n.ts');
  const pairs=[
    ['/MimicryDB/','/MimicryDB/zh/'],
    ['/MimicryDB/interactions/','/MimicryDB/zh/interactions/'],
    ['/MimicryDB/interactions/MIMICRY-000004/','/MimicryDB/zh/interactions/MIMICRY-000004/'],
    ['/MimicryDB/taxa/cuculus-canorus/','/MimicryDB/zh/taxa/cuculus-canorus/'],
  ];
  for(const [en,zh] of pairs){
    assert.equal(twinPath(en,'zh'),zh,`EN→ZH failed for ${en}`);
    assert.equal(twinPath(zh,'en'),en,`ZH→EN failed for ${zh}`);
  }
  assert.equal(twinPath('/MimicryDB/zh/interactions/','zh'),'/MimicryDB/zh/interactions/','zh→zh stays put');
});

test('directed network covers every interaction once and lays out deterministically',async()=>{
  const {buildNetwork,layoutNetwork}=await import('../src/lib/network.ts');
  const net=buildNetwork();
  assert.equal(net.edges.length,data.all().length,'one edge per interaction record');
  assert.equal(new Set(net.edges.map(e=>e.interaction)).size,net.edges.length,'no duplicated edges');
  const names=new Set(net.nodes.map(n=>n.name));
  for(const i of data.all()){
    assert.ok(names.has(i.mimic),`network missing mimic node ${i.mimic}`);
    assert.ok(names.has(i.model),`network missing model node ${i.model}`);
  }
  // cross-kingdom edge count must track the data (provider query uses the same rule)
  assert.equal(net.edges.filter(e=>e.crossKingdom).length,data.query({crossKingdomOnly:true,pageSize:1}).total,'cross-kingdom edges stay in sync with the dataset');
  const l1=layoutNetwork(net.nodes,net.edges);
  const l2=layoutNetwork(net.nodes,net.edges);
  assert.deepEqual(l1,l2,'force layout must be deterministic (no RNG)');
  for(const n of net.nodes){
    const m=data.all().filter(i=>i.mimic===n.name).length,mo=data.all().filter(i=>i.model===n.name).length;
    assert.equal(n.mimic,m);assert.equal(n.model,mo);
  }
  for(const p of l1.pos){
    assert.ok(p.x>=0&&p.x<=l1.width&&p.y>=0&&p.y<=l1.height,'node inside viewBox');
  }
});

test('layout clusters species that share a mimicry pattern',async()=>{
  const {buildNetwork,layoutNetwork}=await import('../src/lib/network.ts');
  const net=buildNetwork();
  const l=layoutNetwork(net.nodes,net.edges);
  const typeSets=new Map();
  for(const e of net.edges)for(const k of [e.from,e.to]){
    if(!typeSets.has(k))typeSets.set(k,new Set());
    typeSets.get(k).add(e.type);
  }
  let wS=0,wN=0,xS=0,xN=0;
  for(let a=0;a<net.nodes.length;a++)for(let b=a+1;b<net.nodes.length;b++){
    const d=Math.hypot(l.pos[a].x-l.pos[b].x,l.pos[a].y-l.pos[b].y);
    const A=typeSets.get(net.nodes[a].name),B=typeSets.get(net.nodes[b].name);
    const share=A&&B?[...A].some(tp=>B.has(tp)):false;
    if(share){wS+=d;wN++;}else{xS+=d;xN++;}
  }
  assert.ok(wN>0&&xN>0,'both groups must exist');
  assert.ok(wS/wN<xS/xN,'species sharing a mimicry pattern must sit closer on average ('+(wS/wN).toFixed(0)+' vs '+(xS/xN).toFixed(0)+')');
});
test('v0.3 schema stabilization: migration 005 defines the full object layer',async()=>{
  const {readFileSync}=await import('node:fs');
  const sql=readFileSync(new URL('../supabase/migrations/005_schema_stabilization.sql',import.meta.url),'utf8');
  for(const obj of ['create table if not exists entity','create table if not exists taxon_external_identifier',
    'create table if not exists mimicry_system','create table if not exists system_interaction',
    'create table if not exists evidence_support','create table if not exists contributor',
    'create table if not exists contribution']){
    assert.ok(sql.includes(obj),`migration 005 missing ${obj}`);
  }
  for(const col of ['public_id','parent_term','synonyms','inclusion_criteria','exclusion_criteria','status','version']){
    assert.ok(sql.includes(col),`vocabulary_term versioning missing ${col}`);
  }
  for(const dim of ['resemblance','model_identity','receiver_perception','receiver_response','fitness_consequence','geographic_overlap','temporal_overlap','mechanism','signal_characterization']){
    assert.ok(sql.includes(`'${dim}'`),`evidence dimension ${dim} missing from check constraint`);
  }
  assert.ok(sql.includes("'contradicts'"),'support_direction must allow contradictions');
});

test('v0.3 vocabularies: five new sets, evidence dimensions complete',()=>{
  for(const v of ['entity_type','evidence_dimension','support_direction','system_type','model_resolution']){
    assert.ok(Array.isArray(vocab[v])&&vocab[v].length>=4,`${v} missing or empty`);
    const terms=vocab[v].map(t=>t.term);
    assert.equal(new Set(terms).size,terms.length,`${v} has duplicate terms`);
  }
  const dims=vocab.evidence_dimension.map(t=>t.term);
  for(const required of ['resemblance','model_identity','receiver_perception','receiver_response','fitness_consequence','mechanism'])
    assert.ok(dims.includes(required),`evidence_dimension lacks ${required}`);
  assert.ok(vocab.support_direction.map(t=>t.term).includes('contradicts'),'contradictory evidence must be representable');
});

test('seed carries stable term IDs, GBIF external identifiers and the demo system',async()=>{
  const {readFileSync}=await import('node:fs');
  const seed=readFileSync(new URL('../supabase/seed.sql',import.meta.url),'utf8');
  assert.ok(seed.includes("TERM:MIMICRY_TYPE:BATESIAN"),'vocabulary terms must get stable public IDs');
  assert.ok(seed.includes("insert into taxon_external_identifier"),'seed must backfill external identifiers');
  assert.ok(seed.includes("authority, external_id"),'identifier rows use authority+external_id');
  assert.ok(!seed.includes("'Myia fugax'")||!seed.includes("insert into taxon_external_identifier (taxon_id, authority, external_id, external_url, matched_name, match_type, verified_at) select id, 'GBIF', '2221771'"),'fuzzy-matched names must not receive identifiers');
  assert.ok(seed.includes('SYSTEM:000001'),'demo mimicry_system must be seeded');
  assert.ok(seed.includes('MIMICRY:000007'),'ring membership links the Müllerian pair');
});

test('mimicry systems: grouping layer above atomic interactions',()=>{
  const systems=data.systems();
  assert.ok(systems.length>=1,'at least one demo system');
  for(const sys of systems){
    assert.match(sys.public_id,/^SYSTEM:\d{6}$/);
    const members=data.interactionsForSystem(sys.public_id);
    assert.equal(members.length,sys.members.length,'all members resolve');
    for(const m of members)assert.ok(data.byId(m.id),`member ${m.id} must exist`);
  }
  const ring=systems.find(s=>s.system_type==='ring');
  assert.ok(ring,'demo dataset includes a Müllerian ring');
  const ringInteractions=data.interactionsForSystem(ring.public_id);
  const taxa=[...new Set(ringInteractions.flatMap(i=>[i.mimic,i.model]))];
  assert.ok(ringInteractions.length>=2,'ring has reciprocal edges');
  assert.equal(taxa.length,ringInteractions.length,'ring taxa are mutual co-mimics (each is both)');
});

test('crossref import report is reviewable and verbatim',async()=>{
  const {readFileSync,existsSync}=await import('node:fs');
  const p=new URL('../data/reconciliation/crossref.json',import.meta.url);
  if(!existsSync(p))return;
  const j=JSON.parse(readFileSync(p,'utf8'));
  assert.match(j.policy,/never modifies the dataset directly/,'importer output must be curator-reviewable, never a direct write');
  assert.ok(Object.keys(j.records).length>0,'report has records');
  for(const [doi,r] of Object.entries(j.records)){
    assert.ok(r.doi&&r.title&&r.url,`${doi}: doi/title/url required`);
    assert.ok(!/<\/?(i|em|italic)>/i.test(r.title),`${doi}: JATS tags must be stripped from titles`);
    assert.ok(r.crossref_metadata&&r.crossref_verified_at,`${doi}: raw Crossref provenance required`);
  }
});

test('harvest MVP: dedupe ladder and run accounting (offline fixtures)',async()=>{
  const {normalizeDoi,normalizeTitle,dedupeCheck,applyItems,buildIndexes}=await import('../src/lib/harvest.ts');
  assert.equal(normalizeDoi('https://doi.org/10.1126/SCIENCE.176.4037.936'),'10.1126/science.176.4037.936');
  assert.equal(normalizeTitle('<i>Heliconius</i> Mimicry:   Reviews!'),'heliconius mimicry reviews');
  const candidates={};
  const run={run_id:'RUN:TEST',source:'crossref',search_profile:'PROFILE:TEST',profile_version:'1.0.0',
    started_at:'',finished_at:'',records_seen:0,records_new:0,records_duplicate:0,records_error:0,status:'failed',error_log:[]};
  const {byNormDoi,byNormTitle}=buildIndexes(candidates);
  applyItems([
    {doi:'10.1/a',title:'Ant mimicry in spiders'},
    {doi:null,title:null}, // error: no doi and no title
    {doi:'10.1/c',title:'Egg mimicry in cuckoos'},
  ],candidates,run,byNormDoi,byNormTitle);
  assert.equal(run.records_new,2);
  assert.equal(run.records_error,1,'a bad record is logged, not fatal');
  // exact-DOI duplicate + normalized-title duplicate (different DOI, same title)
  applyItems([
    {doi:'10.1/a',title:'Ant mimicry in spiders'},
    {doi:'10.9/z',title:'Ant  Mimicry   in Spiders!'},
  ],candidates,run,byNormDoi,byNormTitle);
  assert.equal(run.records_duplicate,2,'DOI exact and normalized-title duplicates both caught');
  assert.equal(run.records_new,2,'no duplicate candidates created');
  const dup=candidates['10.9/z'];
  assert.equal(dup,undefined,'title-collision item never creates a new candidate');
  assert.ok(candidates['10.1/a'].dedupe.some(d=>d.method==='doi_exact'));
  assert.ok(candidates['10.1/a'].dedupe.some(d=>d.method==='normalized_title'&&d.matched_doi==='10.9/z'),'collision recorded, never silently merged');
});

test('SOP Phase 3: mimicry_type ontology is hierarchical and defined',()=>{
  const terms=new Set(vocab.mimicry_type.map(t=>t.term));
  for(const t of vocab.mimicry_type){
    assert.ok(t.definition,`${t.term}: definition required`);
    if(t.parent)assert.ok(terms.has(t.parent),`${t.term}: parent ${t.parent} must exist`);
  }
  const parents=vocab.mimicry_type.filter(t=>t.parent).map(t=>t.parent);
  assert.ok(parents.includes('protective'),'Batesian/Müllerian/Mertensian hang under protective');
  assert.ok(terms.has('mertensian'),'Mertensian term added (ontology v1.1)');
  assert.ok(terms.has('uncertain')&&terms.has('other'),'curators are never forced into a classification');
});

test('SOP Phase 2/4: migration 006 completes stable IDs and evidence v1',async()=>{
  const {readFileSync}=await import('node:fs');
  const sql=readFileSync(new URL('../supabase/migrations/006_evidence_v1.sql',import.meta.url),'utf8');
  for(const frag of ['taxon add column if not exists public_id','receiver_entity_id',
    'evidence add column if not exists public_id','locator_table','evidence_support_strength_check',
    "'strong'","'moderate'","'weak'","'unknown'"]){
    assert.ok(sql.includes(frag),`migration 006 missing ${frag}`);
  }
  const seed=readFileSync(new URL('../supabase/seed.sql',import.meta.url),'utf8');
  assert.ok(seed.includes('TAXON:000001'),'taxa get stable public IDs');
  assert.ok(seed.includes("'mimicry_type', 'batesian"), "ontology parents/definitions seeded");
});

test('seed and setup SQL never contain semicolons inside string literals',async()=>{
  const {readFileSync}=await import('node:fs');
  for(const f of ['../supabase/seed.sql','../docs/supabase-setup.sql']){
    const lines=readFileSync(new URL(f,import.meta.url),'utf8').split('\n');
    const bad=lines.map((l,ix)=>{
      let inQ=false;
      for(let i=0;i<l.length;i++){const c=l[i];if(c==="'"){inQ=!inQ;continue;}if(c===';'&&inQ)return ix+1;}
      return 0;}).filter(Boolean);
    assert.equal(bad.length,0,`${f}: semicolon inside string literal at line(s) ${bad.join(',')} — the Supabase SQL Editor splits on it`);
  }
});

test('harvest 0.4.2: OpenAlex mapping, abstract reconstruction, fuzzy tier',async()=>{
  const {reconstructAbstract,mapOpenAlexWork,fuzzyTitleSimilarity,applyItems}=await import('../src/lib/harvest.ts');
  // inverted-index abstract reconstruction (OpenAlex format)
  const text=reconstructAbstract({'Butterflies':[0],'in':[1],'the':[2],'genus':[3],'Heliconius':[4],'exhibit':[5],'mimicry':[6]});
  assert.equal(text,'Butterflies in the genus Heliconius exhibit mimicry');
  assert.equal(reconstructAbstract(null),null);
  // OpenAlex work mapping: doi prefix normalized downstream, ids preserved
  const item=mapOpenAlexWork({id:'https://openalex.org/W123',doi:'https://doi.org/10.1/xx',
    display_name:'A study of mimicry',publication_year:2024,
    authorships:[{author:{display_name:'A. Curator'}},{author:{display_name:'B. Reviewer'}}],
    primary_location:{source:{display_name:'Journal of Mimicry'}},
    abstract_inverted_index:{'A':[0],'study':[1]}});
  assert.equal(item.title,'A study of mimicry');
  assert.equal(item.ids.openalex,'https://openalex.org/W123');
  assert.equal(item.abstract,'A study');
  assert.equal(item.authors,'A. Curator; B. Reviewer');
  assert.equal(item.journal,'Journal of Mimicry');
  // fuzzy tier flags near-duplicates (>=0.85) without blocking creation
  const sim=fuzzyTitleSimilarity('Ant Mimicry in Spiders!','ant  mimicry  in spiders');
  assert.ok(sim>=0.85,'near-identical titles score high');
  assert.ok(fuzzyTitleSimilarity('Ant mimicry','Mullerian mimicry in butterflies')<0.5,'distinct titles score low');
  const candidates={};
  const run={run_id:'R',source:'openalex',search_profile:'P',profile_version:'1',started_at:'',finished_at:'',records_seen:0,records_new:0,records_duplicate:0,records_error:0,status:'failed',error_log:[]};
  const {buildIndexes}=await import('../src/lib/harvest.ts');
  const {byNormDoi,byNormTitle}=buildIndexes(candidates);
  applyItems([
    {doi:'10.5/a',title:'Ant mimicry in jumping spiders',ids:{openalex:'W1'}},
    {doi:'10.5/b',title:'Ant Mimicry in the Jumping Spiders',ids:{openalex:'W2'}},
  ],candidates,run,byNormDoi,byNormTitle);
  const first=candidates['10.5/a'],second=candidates['10.5/b'];
  assert.ok(second,'fuzzy near-duplicate still creates its own candidate (review, not merge)');
  assert.ok(first.dedupe.concat(second.dedupe).some(d=>d.method==='fuzzy_title'),'fuzzy collision flagged for review on at least one side');
});
