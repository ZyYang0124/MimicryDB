#!/usr/bin/env node
// Export the MimicryDB dataset as a versioned CSV release set (prompt.md §53–54).
// Until a live database exists this exports the labeled demo dataset; metadata.json
// always states the data status so a demo export can never pass as curated data.
import {interactions} from '../src/data/demo.ts';
import {data} from '../src/data/provider.ts';
import {csv} from '../src/lib/csv.ts';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const version=process.argv[2]??`v${pkg.version}`;
const schemaVersion='002';
const outDir=join(process.cwd(),'export',version);
mkdirSync(outDir,{recursive:true});

const write=(name,content)=>{writeFileSync(join(outDir,name),content+'\n');return name;};

const files=[];
files.push(write('interactions.csv',csv(
 ['public_id','mimic','model','model_kind','receiver','mimicry_type','signal_modalities','knowledge_status','evidence_grade','kingdom_flow','mimicry_summary','data_status'],
 interactions.map(i=>[i.id,i.mimic,i.model,i.modelKind??'organism',i.receiver,i.type,(i.modalities??[]).join(';'),i.knowledge??'reported',i.evidence,i.kingdoms,i.summary,'DEMO']))));
files.push(write('taxa.csv',csv(
 ['name','slug','acts_as_mimic_in','acts_as_model_in','lineages','data_status'],
 data.taxa().map(t=>[t.name,t.slug,t.asMimic,t.asModel,t.lineages,'DEMO']))));
files.push(write('references.csv',csv(
 ['id','doi','title','authors','year','journal','data_status'],
 data.references().map(r=>[r.ref.id,r.ref.doi??'',r.ref.title,r.ref.authors??'',r.ref.year??'',r.ref.journal??'','DEMO']))));
files.push(write('evidence.csv',csv(
 ['interaction_public_id','reference_id','evidence_text','page','section','figure','evidence_grade','source_method','data_status'],[]))); // no curated evidence passages exist in the demo dataset; header-only by design
files.push(write('interaction_references.csv',csv(
 ['interaction_public_id','reference_id','data_status'],
 interactions.flatMap(i=>(i.refs??[]).map(r=>[i.id,r.id,'DEMO'])))));
files.push(write('controlled_vocabularies.csv',csv(
 ['vocabulary','term','label'],
 Object.entries(JSON.parse(readFileSync(new URL('../data/controlled-vocabularies.json',import.meta.url),'utf8')))
  .flatMap(([v,terms])=>terms.map(t=>[v,t.term,t.label??''])))));

const metadata={
 dataset:'MimicryDB',release:version,schema_version:schemaVersion,
 export_date:new Date().toISOString(),
 data_status:'DEMO — labeled sample data, not a curated scientific release',
 counts:{interactions:interactions.length,taxa:data.taxa().length,references:data.references().length,evidence:0},
 citation:`MimicryDB contributors, MimicryDB: a database of mimic-model interactions across the Tree of Life, release ${version}, https://github.com/ZyYang0124/MimicryDB`,
 license:{software:'MIT',data:'undecided — see docs/RELEASE_POLICY.md'}};
files.push(write('metadata.json',JSON.stringify(metadata,null,2)));

const sums=files.map(f=>`${createHash('sha256').update(readFileSync(join(outDir,f))).digest('hex')}  ${f}`);
files.push(write('SHA256SUMS.txt',sums.join('\n')));
console.log(`exported ${files.length-1} files + checksums → export/${version}/ (DEMO data)`);
