#!/usr/bin/env node
// Literature Harvester MVP (SOP Phase 6-8, version 0.4.1). API-first: Crossref now,
// OpenAlex/Europe PMC later. Candidates form the literature_candidate corpus — they
// never touch the scientific database. Every run leaves provenance; the dedupe
// ladder runs before anything expensive; one bad record never crashes the run.
// Usage: npm run harvest -- PROFILE:MIMICRY_GENERAL [--source crossref]
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {buildIndexes,applyItems,normalizeDoi} from '../src/lib/harvest.ts';
const UA={'User-Agent':'MimicryDB-prototype/0.4 (https://github.com/ZyYang0124/MimicryDB)'};
const dir=new URL('../data/harvest/',import.meta.url);
mkdirSync(dir,{recursive:true});
const profiles=JSON.parse(readFileSync(new URL('search-profiles.json',dir),'utf8')).profiles;
const candidatesPath=new URL('candidates.json',dir);
const runsPath=new URL('runs.json',dir);
const candidates=existsSync(candidatesPath)?JSON.parse(readFileSync(candidatesPath,'utf8')):{generated:new Date().toISOString(),policy:'literature_candidate corpus — discovery layer only; screening_status new → screened; irrelevant records are EXCLUDED with a reason, never deleted (SOP Phase 10).',candidates:{}};
candidates.generated=new Date().toISOString();
const runs=existsSync(runsPath)?JSON.parse(readFileSync(runsPath,'utf8')):{runs:[]};
const argv=process.argv.slice(2);
const profileId=argv.find(a=>a.startsWith('PROFILE:'))??'PROFILE:MIMICRY_GENERAL';
const source=argv.includes('--source')?argv[argv.indexOf('--source')+1]:'crossref';
const profile=profiles.find(p=>p.id===profileId&&p.active);
if(!profile){console.log(`harvest: no active profile ${profileId} — have: ${profiles.filter(p=>p.active).map(p=>p.id).join(', ')}`);process.exit(0);}
const runId=`RUN:${new Date().toISOString().replace(/[-:T]/g,'').slice(0,12)}:${profile.id.split(':')[1]}`;
const run={run_id:runId,source,search_profile:profile.id,profile_version:profile.version,
  started_at:new Date().toISOString(),finished_at:'',records_seen:0,records_new:0,
  records_duplicate:0,records_error:0,status:'failed',error_log:[]};
try{
  if(source!=='crossref')throw new Error(`source "${source}" not implemented yet (Crossref is the 0.4.1 MVP; OpenAlex is 0.4.2)`);
  const {endpoint,params,rows,pages}=profile.query;
  const {byNormDoi,byNormTitle}=buildIndexes(candidates.candidates);
  let beforeNew=run.records_new;
  for(let page=1;page<=(pages??1);page++){
    const url=new URL(endpoint);
    for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);
    url.searchParams.set('rows',String(rows??20));
    url.searchParams.set('offset',String((page-1)*(rows??20)));
    url.searchParams.set('select','DOI,title,abstract,author,container-title,issued,volume,issue,page,ISSN,publisher,type,URL');
    const res=await fetch(url,{headers:UA});
    if(!res.ok)throw new Error(`crossref HTTP ${res.status} on page ${page}`);
    const items=(await res.json()).message?.items??[];
    const mapped=items.map(m=>({doi:m.DOI??null,title:Array.isArray(m.title)?m.title.join(' '):m.title??null,
      abstract:m.abstract?m.abstract.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim():null,
      authors:(m.author??[]).map(a=>[a.given,a.family].filter(Boolean).join(' ')).filter(Boolean).join('; ')||null,
      journal:Array.isArray(m['container-title'])?m['container-title'].join(' '):null,
      year:m.issued?.['date-parts']?.[0]?.[0]??null,ids:{crossref:m.DOI??null}}));
    applyItems(mapped,candidates.candidates,run,byNormDoi,byNormTitle);
    if(items.length<(rows??20))break; // last page
  }
  beforeNew=run.records_new;
  run.status=run.records_error>0?'partial':'success';
}catch(e){
  run.error_log.push(`run failed: ${e.message}`);
  run.status='failed';
}
run.finished_at=new Date().toISOString();
runs.runs.push(run);
runs.last_successful_sync=run.status!=='failed'?run.finished_at:(runs.last_successful_sync??null);
writeFileSync(candidatesPath,JSON.stringify(candidates,null,2)+'\n');
writeFileSync(runsPath,JSON.stringify(runs,null,2)+'\n');
console.log(`harvest: ${run.run_id} ${run.status} — seen ${run.records_seen}, new ${run.records_new}, duplicate ${run.records_duplicate}, error ${run.records_error}${run.error_log.length?' ('+run.error_log[0]+')':''}`);
console.log(`harvest: corpus now ${Object.keys(candidates.candidates).length} candidates; last_successful_sync=${runs.last_successful_sync??'never'}`);
