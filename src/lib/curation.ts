/** Curation decision application (SOP Phase 14/15/31): pure logic for turning a
 *  curator decisions export into layer updates. Decisions are an audit artifact;
 *  application never touches published scientific records. */

export type DecisionSet={
  format:1;
  exported_at:string;
  curator:string;
  interactions:Record<string,{decision:'accept'|'reject'|'needs_expert';edits?:Record<string,string>;reason?:string;decided_at?:string}>;
  literature:Record<string,{screening:'likely_relevant'|'maybe_relevant'|'irrelevant';exclusion_reason?:string;decided_at?:string}>;
  references:Record<string,{decision:'confirmed'|'rejected';decided_at?:string}>;
};
export type AuditLine={at:string;curator:string;target_type:'interaction_candidate'|'literature_candidate'|'reference';target_id:string;action:string;detail?:string};

export const validateDecisions=(d:unknown):{ok:true;value:DecisionSet}|{ok:false;error:string}=>{
  const v=d as DecisionSet;
  if(!v||typeof v!=='object')return {ok:false,error:'not an object'};
  if(v.format!==1)return {ok:false,error:'unsupported format (expected 1)'};
  if(!v.curator?.trim())return {ok:false,error:'curator name required'};
  for(const section of ['interactions','literature','references'] as const){
    if(typeof v[section]!=='object'||v[section]===null)return {ok:false,error:`missing section: ${section}`};
  }
  for(const [id,dec] of Object.entries(v.interactions??{})){
    if(!['accept','reject','needs_expert'].includes(dec.decision))return {ok:false,error:`interaction ${id}: unknown decision ${dec.decision}`};
  }
  for(const [id,dec] of Object.entries(v.literature??{})){
    if(!['likely_relevant','maybe_relevant','irrelevant'].includes(dec.screening))return {ok:false,error:`literature ${id}: unknown screening ${dec.screening}`};
    if(dec.screening==='irrelevant'&&!dec.exclusion_reason?.trim())return {ok:false,error:`literature ${id}: irrelevant requires an exclusion_reason (SOP Phase 10)`};
  }
  for(const [id,dec] of Object.entries(v.references??{})){
    if(!['confirmed','rejected'].includes(dec.decision))return {ok:false,error:`reference ${id}: unknown decision ${dec.decision}`};
  }
  return {ok:true,value:v};
};

/** Apply interaction decisions to the workbench layer. accept → 'reviewed' (publish-
 *  ready; the v0.6.1 publish pipeline takes it from there), reject → 'rejected' with
 *  the reason preserved, needs_expert → 'needs_review' flagged. Field edits overwrite
 *  the proposal (originals stay in audit history). */
export const applyInteractionDecisions=(candidates:{id:string;review_status:string;review_notes?:string;[k:string]:unknown}[],decisions:DecisionSet['interactions'],curator:string,at:string):AuditLine[]=>{
  const audit:AuditLine[]=[];
  for(const [id,dec] of Object.entries(decisions)){
    const c=candidates.find(x=>x.id===id);
    if(!c){audit.push({at,curator,target_type:'interaction_candidate',target_id:id,action:'skipped',detail:'not found'});continue;}
    for(const [field,value] of Object.entries(dec.edits??{}))c[field]=value;
    c.review_status=dec.decision==='accept'?'reviewed':dec.decision==='reject'?'rejected':'needs_review';
    c.review_notes=dec.reason??c.review_notes;
    c.reviewed_by=curator;
    audit.push({at,curator,target_type:'interaction_candidate',target_id:id,action:dec.decision,detail:dec.reason});
  }
  return audit;
};

/** Apply literature screening: status changes are state transitions, never deletes —
 *  irrelevant records keep their exclusion_reason so ontology changes can re-screen
 *  (SOP Phase 10). */
export const applyLiteratureDecisions=(candidates:Record<string,{screening_status:string;exclusion_reason?:string|null;[k:string]:unknown}>,decisions:DecisionSet['literature'],curator:string,at:string):AuditLine[]=>{
  const audit:AuditLine[]=[];
  for(const [id,dec] of Object.entries(decisions)){
    const c=candidates[id];
    if(!c){audit.push({at,curator,target_type:'literature_candidate',target_id:id,action:'skipped',detail:'not found'});continue;}
    c.screening_status=dec.screening;
    if(dec.screening==='irrelevant'){c.exclusion_reason=dec.exclusion_reason;}
    audit.push({at,curator,target_type:'literature_candidate',target_id:id,action:dec.screening,detail:dec.exclusion_reason});
  }
  return audit;
};

/** Apply reference confirmations to the Crossref inbox. */
export const applyReferenceDecisions=(records:Record<string,{curator_status?:string;curator?:string;decided_at?:string;[k:string]:unknown}>,decisions:DecisionSet['references'],curator:string,at:string):AuditLine[]=>{
  const audit:AuditLine[]=[];
  for(const [doi,dec] of Object.entries(decisions)){
    const r=records[doi];
    if(!r){audit.push({at,curator,target_type:'reference',target_id:doi,action:'skipped',detail:'not found'});continue;}
    r.curator_status=dec.decision;
    r.curator=curator;
    r.decided_at=dec.decided_at??at;
    audit.push({at,curator,target_type:'reference',target_id:doi,action:dec.decision});
  }
  return audit;
};
