#!/usr/bin/env node
// Applies a curator decisions export (npm run curation:apply -- <decisions.json>)
// to the three workbench layers: interaction candidates, literature corpus, and the
// Crossref reference inbox. Appends every applied action to data/curation/audit-log
// .jsonl. Published scientific records are never touched (docs/CURATION_GUIDE.md).
import {readFileSync,writeFileSync,existsSync,appendFileSync} from 'node:fs';
import {validateDecisions,applyInteractionDecisions,applyLiteratureDecisions,applyReferenceDecisions} from '../src/lib/curation.ts';
const decisionsPath=process.argv[2];
if(!decisionsPath||!existsSync(decisionsPath)){console.log('curation: pass a decisions file — npm run curation:apply -- <path>');process.exit(1);}
const parsed=validateDecisions(JSON.parse(readFileSync(decisionsPath,'utf8')));
if(!parsed.ok){console.error(`curation: INVALID — ${parsed.error}`);process.exit(1);}
const decisions=parsed.value;
const at=new Date().toISOString();
const read=(p,fallback)=>existsSync(p)?JSON.parse(readFileSync(p,'utf8')):fallback;
let applied=0;
// interactions
const intPath=new URL('../data/curation/interaction-candidates.json',import.meta.url);
const intDoc=read(intPath,{candidates:[]});
const intAudit=applyInteractionDecisions(intDoc.candidates,decisions.interactions,decisions.curator,at);
applied+=intAudit.filter(a=>a.action!=='skipped').length;
writeFileSync(intPath,JSON.stringify(intDoc,null,2)+'\n');
// literature
const litPath=new URL('../data/harvest/candidates.json',import.meta.url);
const litDoc=read(litPath,{candidates:{}});
const litAudit=applyLiteratureDecisions(litDoc.candidates,decisions.literature,decisions.curator,at);
applied+=litAudit.filter(a=>a.action!=='skipped').length;
writeFileSync(litPath,JSON.stringify(litDoc,null,2)+'\n');
// references
const refPath=new URL('../data/reconciliation/crossref.json',import.meta.url);
const refDoc=read(refPath,{records:{}});
const refAudit=applyReferenceDecisions(refDoc.records,decisions.references,decisions.curator,at);
applied+=refAudit.filter(a=>a.action!=='skipped').length;
writeFileSync(refPath,JSON.stringify(refDoc,null,2)+'\n');
// audit trail
const auditPath=new URL('../data/curation/audit-log.jsonl',import.meta.url);
appendFileSync(auditPath,[...intAudit,...litAudit,...refAudit].map(a=>JSON.stringify(a)).join('\n')+(intAudit.length+litAudit.length+refAudit.length?'\n':''));
console.log(`curation: applied ${applied} decision(s) as ${decisions.curator} at ${at}; audit trail appended (${intAudit.length+litAudit.length+refAudit.length} lines, skips included)`);
