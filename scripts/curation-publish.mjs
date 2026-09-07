#!/usr/bin/env node
// v0.6.1 groundwork: validate accepted interaction candidates (SOP Phase 17-18) and
// emit data/curation/publish-ready.json + append to the audit trail. Deliberately
// does NOT write Supabase: publishing to the live DB needs the curator-auth service
// (service key not provisioned). The ready set + audit trail are the handoff artifact.
import {readFileSync,writeFileSync,existsSync,appendFileSync} from 'node:fs';
import {buildPublishSet} from '../src/lib/publish.ts';
const wbPath=new URL('../data/curation/interaction-candidates.json',import.meta.url);
if(!existsSync(wbPath)){console.log('publish: no workbench layer found');process.exit(1);}
const doc=JSON.parse(readFileSync(wbPath,'utf8'));
const startId=Number(process.argv[2]??100001);
const {ready,report,nextId}=buildPublishSet(doc.candidates,startId);
writeFileSync(new URL('../data/curation/publish-ready.json',import.meta.url),
  JSON.stringify({generated:new Date().toISOString(),note:'validated by SOP Phase 18 battery; handoff artifact — the live-DB write needs curator auth (v0.6.1 service)',ready},null,2)+'\n');
const auditPath=new URL('../data/curation/audit-log.jsonl',import.meta.url);
const at=new Date().toISOString();
appendFileSync(auditPath,report.map(r=>JSON.stringify({at,target_type:'interaction_candidate',target_id:r.candidate_id,
  action:r.ready?`publish-ready:${r.public_id}`:'not-ready',
  detail:r.checks.filter(c=>!c.ok).map(c=>`${c.field}: ${c.detail}`).join(' | ')||'all checks passed'})).join('\n')+'\n');
for(const r of report)console.log(`  ${r.candidate_id}: ${r.ready?'READY '+r.public_id:'blocked — '+r.checks.filter(c=>!c.ok).map(c=>c.field).join(', ')}`);
console.log(`publish: ${ready.length} publish-ready, ${report.length-ready.length} blocked; next stable ID MIMICRY:${String(nextId).padStart(6,'0')}`);
