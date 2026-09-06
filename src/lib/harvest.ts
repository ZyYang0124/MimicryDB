/** Literature harvester core (SOP Phase 6–8, MVP 0.4.1): pure, offline-testable logic.
 *  API-first; candidates NEVER enter the scientific database — they form the
 *  literature_candidate corpus that screening/extraction/curation consume.
 *  The dedupe ladder runs BEFORE anything expensive happens downstream. */

export type HarvestCandidate={
  doi:string|null;normalized_doi:string|null;title:string|null;normalized_title:string|null;
  abstract:string|null;authors:string|null;journal:string|null;year:number|null;
  ids:{crossref?:string;openalex?:string|null;pmid?:string|null;pmcid?:string|null};
  source:string;search_profile:string;profile_version:string;
  discovered_at:string;first_run:string;
  screening_status:'new';relevance_score:null;exclusion_reason:null;
  dedupe:{method:string;confidence:number;matched_doi?:string}[];
};

export const normalizeDoi=(doi:string|null|undefined):string|null=>{
  if(!doi)return null;
  return doi.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//,'')||null;
};
export const normalizeTitle=(title:string|null|undefined):string|null=>{
  if(!title)return null;
  return title.toLowerCase().replace(/<[^>]+>/g,' ').replace(/[^a-z0-9]+/g,' ').trim()||null;
};
export type FetchItem={doi:string|null;title:string|null;abstract?:string|null;
  authors?:string|null;journal?:string|null;year?:number|null;ids?:{crossref?:string;openalex?:string}};
export type RunRecord={run_id:string;source:string;search_profile:string;profile_version:string;
  started_at:string;finished_at:string;records_seen:number;records_new:number;
  records_duplicate:number;records_error:number;status:'success'|'partial'|'failed';error_log:string[]};

/** Dedupe ladder (SOP Phase 8): DOI exact → normalized title. Returns the method that
 *  matched (or 'new'), plus which existing DOI it collided with. Never silently merges. */
export const dedupeCheck=(item:FetchItem,candidates:Record<string,unknown>,byNormDoi:Map<string,string>,byNormTitle:Map<string,string>):{method:string;confidence:number;matched_doi?:string}=>{
  const ndoi=normalizeDoi(item.doi);
  if(ndoi&&byNormDoi.has(ndoi))return {method:'doi_exact',confidence:1,matched_doi:ndoi};
  const ntitle=normalizeTitle(item.title);
  if(ntitle&&byNormTitle.has(ntitle))return {method:'normalized_title',confidence:0.9,matched_doi:byNormTitle.get(ntitle)};
  void candidates; void byNormDoi;
  return {method:'new',confidence:1};
};

/** Apply one fetched page: mutate candidates + run accounting. Per-item isolation —
 *  one bad record logs an error and never crashes the run (Harvester DoD). New items
 *  also get a fuzzy-title scan (SOP Phase 8 tier 5): flagged for review, never merged. */
export const applyItems=(items:FetchItem[],candidates:Record<string,HarvestCandidate>,run:RunRecord,byNormDoi:Map<string,string>,byNormTitle:Map<string,string>):void=>{
  for(const item of items){
    run.records_seen++;
    try{
      if(!item.doi&&!item.title){run.records_error++;run.error_log.push('item without doi and title skipped');continue;}
      const verdict=dedupeCheck(item,candidates,byNormDoi,byNormTitle);
      const ndoi=normalizeDoi(item.doi);
      if(verdict.method!=='new'){
        run.records_duplicate++;
        const existing=verdict.matched_doi?candidates[verdict.matched_doi]:undefined;
        if(existing&&!existing.dedupe.some(d=>d.matched_doi===ndoi))
          existing.dedupe.push({method:verdict.method,confidence:verdict.confidence,matched_doi:ndoi??undefined});
        continue;
      }
      const key=ndoi??('no-doi:'+normalizeTitle(item.title));
      const c:HarvestCandidate={
        doi:ndoi,normalized_doi:ndoi,normalized_title:normalizeTitle(item.title),
        title:item.title,abstract:item.abstract??null,authors:item.authors??null,
        journal:item.journal??null,year:item.year??null,
        ids:{crossref:item.ids?.crossref??ndoi??undefined,openalex:item.ids?.openalex??null,pmid:null,pmcid:null},
        source:run.source,search_profile:run.search_profile,profile_version:run.profile_version,
        discovered_at:new Date().toISOString(),first_run:run.run_id,
        screening_status:'new',relevance_score:null,exclusion_reason:null,
        dedupe:[{method:'new',confidence:1}]};
      if(c.normalized_title){
        for(const [ek,ec] of Object.entries(candidates)){
          if(ek===key)continue;
          const sim=fuzzyTitleSimilarity(c.normalized_title,ec.normalized_title);
          if(sim>=0.85)c.dedupe.push({method:'fuzzy_title',confidence:+sim.toFixed(2),matched_doi:ec.normalized_doi??undefined});
        }
      }
      candidates[key]=c;
      if(ndoi)byNormDoi.set(ndoi,key);
      if(c.normalized_title)byNormTitle.set(c.normalized_title,key);
      run.records_new++;
    }catch(e){
      run.records_error++;
      run.error_log.push(`item error: ${(e as Error).message}`);
    }
  }
};
/** Rebuild the dedupe indexes from a candidates corpus (incremental runs). */
export const buildIndexes=(candidates:Record<string,HarvestCandidate>):{byNormDoi:Map<string,string>;byNormTitle:Map<string,string>}=>{
  const byNormDoi=new Map<string,string>(),byNormTitle=new Map<string,string>();
  for(const [key,c] of Object.entries(candidates)){
    if(c.normalized_doi)byNormDoi.set(c.normalized_doi,key);
    if(c.normalized_title)byNormTitle.set(c.normalized_title,key);
  }
  return {byNormDoi,byNormTitle};
};

/** OpenAlex returns abstracts as an inverted index {word: [positions]}. Rebuild the
 *  plain-text abstract (SOP Phase 6.1: metadata/abstract fallback). */
export const reconstructAbstract=(inverted:Record<string,number[]>|null|undefined):string|null=>{
  if(!inverted||typeof inverted!=='object')return null;
  const words:string[]=[];
  let max=-1;
  for(const [word,positions] of Object.entries(inverted))
    for(const p of positions??[]){words[p]=word;if(p>max)max=p;}
  if(max<0)return null;
  return words.slice(0,max+1).map((w,i)=>w??'').join(' ').replace(/\s+/g,' ').trim()||null;
};
/** Map an OpenAlex work record to the harvester's FetchItem shape. */
export const mapOpenAlexWork=(w:Record<string,unknown>):FetchItem=>{
  const rec=w as {doi?:string;display_name?:string;abstract_inverted_index?:Record<string,number[]>;
    authorships?:{author?:{display_name?:string}}[];primary_location?:{source?:{display_name?:string|null}|null};
    publication_year?:number;id?:string};
  const authors=(rec.authorships??[]).map(a=>a.author?.display_name??'').filter(Boolean).join('; ');
  return {
    doi:rec.doi??null,title:rec.display_name??null,
    abstract:reconstructAbstract(rec.abstract_inverted_index),
    authors:authors||null,journal:rec.primary_location?.source?.display_name??null,
    year:rec.publication_year??null,ids:{openalex:rec.id??undefined}};
};
/** Fuzzy title tier (SOP Phase 8, level 5): max of token-set Jaccard and containment
 *  (containment only counts when the shorter title has >=3 tokens, so two-word titles
 *  cannot free-ride on one shared word). Flags a possible duplicate for review —
 *  never blocks creation, never merges. */
export const fuzzyTitleSimilarity=(a:string|null,b:string|null):number=>{
  const na=normalizeTitle(a),nb=normalizeTitle(b);
  if(!na||!nb)return 0;
  const ta=new Set(na.split(' ')),tb=new Set(nb.split(' '));
  let inter=0;for(const t of ta)if(tb.has(t))inter++;
  const union=ta.size+tb.size-inter;
  const jaccard=union?inter/union:0;
  const containment=ta.size>=3&&tb.size>=3?inter/Math.min(ta.size,tb.size):0;
  return Math.max(jaccard,containment);
};
