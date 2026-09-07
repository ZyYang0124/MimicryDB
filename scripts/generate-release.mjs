#!/usr/bin/env node
// Frozen release generator (SOP Phase 34): emits data/releases/<version>/ with CSV
// exports of every core object + checksums + README/CHANGELOG. Frozen releases are
// the citable artifacts; the live DB and the site keep evolving independently.
// Immutable: an existing version directory is never overwritten.
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {interactions} from '../src/data/demo.ts';
import {data} from '../src/data/provider.ts';
import vocab from '../data/controlled-vocabularies.json' with {type:'json'};
const version=process.argv[2];
if(!version||!/^v\d+\.\d+\.\d+$/.test(version)){console.log('release: pass a semver tag — npm run release:generate -- v0.4.0');process.exit(1);}
const dir=new URL(`../data/releases/${version}/`,import.meta.url);
if(existsSync(dir)){console.log(`release: ${version} already exists — frozen releases are immutable`);process.exit(1);}
mkdirSync(dir,{recursive:true});
const NL='\n';
const csvEsc=(v)=>{const s=v==null?'':String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
const writeCSV=(name,header,rows)=>{writeFileSync(new URL(name,dir),[header.join(','),...rows.map(r=>r.map(csvEsc).join(','))].join(NL)+NL);};
const taxa=data.taxa();
writeCSV('interactions.csv',['public_id','mimic','model','receiver','mimicry_type','signal_modalities','evidence_grade','kingdom_flow','model_kind','knowledge_status','mimicry_summary','data_status'],
  interactions.map(i=>[i.id,i.mimic,i.model,i.receiver,i.type,(i.modalities??[]).join(';'),i.evidence,i.kingdoms,i.modelKind??'organism',i.knowledge??'reported',i.summary,'DEMO']));
writeCSV('taxa.csv',['scientific_name','as_mimic','as_model','lineages'],taxa.map(t=>[t.name,t.asMimic,t.asModel,t.lineages]));
writeCSV('references.csv',['id','doi','title','authors','year','journal','supports'],data.references().map(r=>[r.ref.id,r.ref.doi??'',r.ref.title,r.ref.authors??'',r.ref.year??'',r.ref.journal??'',r.supports]));
writeCSV('systems.csv',['public_id','name','system_type','description','members'],data.systems().map(s=>[s.public_id,s.name,s.system_type,s.description,s.members.join(';')]));
writeCSV('entities.csv',['entity_type','label','note'],[['(none)','(none)','entity rows arrive with real curation; this file defines the release schema']]);
const termId=(v,t)=>`TERM:${v.toUpperCase().replace(/[^A-Z0-9]+/g,'_')}:${String(t).toUpperCase().replace(/[^A-Z0-9]+/g,'_')}`;
writeCSV('ontology.csv',['vocabulary','term_id','term','label','parent','definition','ontology_version'],
  Object.entries(vocab).flatMap(([v,terms])=>terms.map(t=>[v,termId(v,t.term),t.term,t.label,t.parent??'',t.definition??'','1.1'])));
writeFileSync(new URL('README.md',dir),[
`# MimicryDB ${version}`,'',
'Frozen release (SOP Phase 34). The live database and the website evolve; this directory is immutable once published.','',
'## Contents',
'- interactions.csv - the atomic directed edges (mimic -> model | receiver)',
'- taxa.csv - taxon directory with per-role counts',
'- references.csv - bibliography with support counts',
'- systems.csv - mimicry systems (grouping layer above the edges)',
'- entities.csv - participant abstraction (schema defined; rows arrive with real curation)',
'- ontology.csv - controlled vocabularies, stable TERM IDs, hierarchy, definitions (v1.1)',
'- checksums.txt - SHA-256 of every file in this release','',
'## Licence',
'CC BY 4.0 - cite as: MimicryDB '+version+', github.com/ZyYang0124/MimicryDB',''].join(NL));
const files=['interactions.csv','taxa.csv','references.csv','systems.csv','entities.csv','ontology.csv','README.md'];
const checksums=files.map(f=>{const buf=readFileSync(new URL(f,dir));return createHash('sha256').update(buf).digest('hex')+'  '+f;}).join(NL);
writeFileSync(new URL('checksums.txt',dir),checksums+NL);
writeFileSync(new URL('CHANGELOG.md',dir),[`# ${version} changelog`,'',
`- demo dataset with ${interactions.length} labeled interactions, ${taxa.length} taxa`,
'- ontology v1.1 (hierarchical, defined, stable IDs)',
`- generated ${new Date().toISOString()}`,''].join(NL));
console.log(`release: ${version} written — ${files.length+2} files, checksums recorded`);
