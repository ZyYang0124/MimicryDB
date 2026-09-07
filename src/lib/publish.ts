/** Publish pipeline (SOP Phase 17-18, v0.6.1 groundwork): validate accepted
 *  interaction candidates and promote them to publish-ready records with stable IDs.
 *  Pure logic; the CLI applies it to the workbench layer and writes an audited
 *  output. It NEVER writes the database or the demo dataset directly — publishing
 *  to the live DB requires the curator-auth service (not yet provisioned). */

export type WorkbenchCandidate={id:string;review_status:string;reviewed_by?:string;
  proposed_mimic:string;proposed_model:string;proposed_receiver:string;
  proposed_mimicry_type:string;proposed_evidence_grade:string;
  evidence_text?:string;reference?:string;extraction_confidence?:number;
  extraction_model?:string;extraction_prompt_version?:string;note?:string;
  [k:string]:unknown};
export type PublishCheck={field:string;ok:boolean;detail:string};
export type PublishResult={candidate_id:string;public_id?:string;ready:boolean;checks:PublishCheck[]};
const ONTOLOGY_TERMS=new Set(['batesian','mullerian','mertensian','aggressive','reproductive','sexual_deception','brood','egg','social','parasitic','floral','food_deception','protective','automimicry','masquerade','uncertain','other']);
const GRADES=new Set(['E0','E1','E2','E3','E4']);

/** SOP Phase 18 validation battery for one accepted candidate. */
export const validateForPublish=(c:WorkbenchCandidate,nextId:number):PublishResult=>{
  const checks:PublishCheck[]=[];
  const chk=(field:string,ok:boolean,detail:string)=>checks.push({field,ok,detail});
  chk('review_status',c.review_status==='reviewed',`accept required, found "${c.review_status}"`);
  chk('reviewer',!!c.reviewed_by?.trim(),'accepted candidates must carry the accepting curator');
  chk('mimic',!!c.proposed_mimic?.trim(),'mimic required');
  chk('model',!!c.proposed_model?.trim(),'model required');
  chk('mimic_ne_model',c.proposed_mimic?.trim()!==c.proposed_model?.trim(),'mimic must differ from model');
  chk('receiver',!!c.proposed_receiver?.trim(),'receiver required ("unknown" is allowed in the schema, but it must be explicit)');
  chk('mimicry_type',ONTOLOGY_TERMS.has(c.proposed_mimicry_type),`"${c.proposed_mimicry_type}" must be an ontology term (docs/ONTOLOGY.md)`);
  chk('evidence_grade',GRADES.has(c.proposed_evidence_grade),'grade must be E0-E4');
  chk('evidence_text',!!c.evidence_text?.trim()||c.proposed_evidence_grade==='E0','passage-level evidence required above E0');
  chk('reference',!!c.reference?.trim(),'supporting reference required');
  chk('provenance',!!c.extraction_model?.trim()&&!!c.extraction_prompt_version?.trim(),'extraction model + prompt version required (SOP Phase 13)');
  const ready=checks.every(k=>k.ok);
  return {candidate_id:c.id,public_id:ready?`MIMICRY:${String(nextId).padStart(6,'0')}`:undefined,ready,checks};
};

/** Promote every accepted candidate in order; rejected/needs_expert ones are reported
 *  but never promoted. Returns the publish-ready rows plus a per-candidate report. */
export const buildPublishSet=(candidates:WorkbenchCandidate[],startId:number)=>{
  const ready:Record<string,unknown>[]=[];
  const report:PublishResult[]=[];
  let next=startId;
  for(const c of candidates){
    if(c.review_status==='rejected'||c.review_status==='needs_review'){
      report.push({candidate_id:c.id,ready:false,checks:[{field:'review_status',ok:false,detail:`skipped: "${c.review_status}" is not publishable`}]});continue;}
    const res=validateForPublish(c,next);
    report.push(res);
    if(res.ready){ready.push({public_id:res.public_id,mimic:c.proposed_mimic,model:c.proposed_model,receiver:c.proposed_receiver,mimicry_type:c.proposed_mimicry_type,evidence_grade:c.proposed_evidence_grade,evidence_text:c.evidence_text,reference:c.reference,curator:c.reviewed_by,published_from:c.id,data_status:'published'});next++;}
  }
  return {ready,report,nextId:next};
};
