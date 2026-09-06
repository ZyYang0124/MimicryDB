#!/usr/bin/env node
// Literature Harvester (SOP Phase 6-8, 0.4.1 Crossref + 0.4.2 OpenAlex). API-first;
// candidates form the literature_candidate corpus — never the scientific database.
// Every run leaves provenance; the dedupe ladder (DOI exact -> normalized title ->
// fuzzy flag) runs before anything expensive; one bad record never crashes the run.
// Usage: npm run harvest -- PROFILE:MIMICRY_GENERAL [--source crossref|openalex]
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {buildIndexes,applyItems,mapOpenAlexWork} from '../src/lib/harvest.ts';
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
const source=argv.includes('--source')?argv[argv.indexOf('--source')+1]:null;
const profile=profiles.find(p=>p.id===profileId&&p.active);
if(!profile){console.log(`harvest: no active profile ${profileId} — have: ${profiles.filter(p=>p.active).map(p=>p.id).join(', ')}`);process.exit(0);}
const src=source??profile.source??'crossref';
if(!['crossref','openalex'].includes(src)){console.log(`harvest: unknown source "${src}" (supported: crossref, openalex)`);process.exit(0);}
const runId=`RUN:${new Date().toISOString().replace(/[-:T]/g,'').slice(0,12)}:${profile.id.split(':')[1]}:${src.slice(0,2)}`;
const run={run_id:runId,source:src,search_profile:profile.id,profile_version:profile.version,
  started_at:new Date().toISOString(),finished_at:'',records_seen:0,records_new:0,
  records_duplicate:0,records_error:0,status:'failed',error_log:[]};
const withRetry=async(url,opts,tries=3)=>{let last;for(let i=0;i<tries;i++){try{const r=await fetch(url,opts);if(r.ok)return r;last=new Error(`HTTP ${r.status}`);if(r.status<500&&r.status!==429)return r;}catch(e){last=e;}await new Promise(res=>setTimeout(res,800*(i+1)));}throw last;};
try{
  const {params,rows,pages}=profile.query;
  const {byNormDoi,byNormTitle}=buildIndexes(candidates.candidates);
  for(let page=1;page<=(pages??1);page++){
    let items=[];
    if(src==='crossref'){
      const url=new URL(profile.query.endpoint);
      for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);
      url.searchParams.set('rows',String(rows??20));
      url.searchParams.set('offset',String((page-1)*(rows??20)));
      url.searchParams.set('select','DOI,title,abstract,author,container-title,issued,volume,issue,page,ISSN,publisher,type,URL');
      const res=await withRetry(url,{headers:UA});
      if(!res.ok)throw new Error(`crossref HTTP ${res.status} on page ${page}`);
      const raw=(await res.json()).message?.items??[];
      items=raw.map(m=>({doi:m.DOI??null,title:Array.isArray(m.title)?m.title.join(' '):m.title??null,
        abstract:m.abstract?m.abstract.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim():null,
        authors:(m.author??[]).map(a=>[a.given,a.family].filter(Boolean).join(' ')).filter(Boolean).join('; ')||null,
        journal:Array.isArray(m['container-title'])?m['container-title'].join(' '):null,
        year:m.issued?.['date-parts']?.[0]?.[0]??null,ids:{crossref:m.DOI??null}}));
    }else{
      const url=new URL(profile.query.endpoint??'https://api.openalex.org/works');
      for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);
      url.searchParams.set('per-page',String(rows??20));
      url.searchParams.set('page',String(page));
      url.searchParams.set('mailto','mimicrydb@users.noreply.github.com');
      const res=await withRetry(url,{headers:UA});
      if(!res.ok)throw new Error(`openalex HTTP ${res.status} on page ${page}`);
      items=((await res.json()).results??[]).map(mapOpenAlexWork);
    }
    applyItems(items,candidates.candidates,run,byNormDoi,byNormTitle);
    if(items.length<(rows??20))break; // last page
  }
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
