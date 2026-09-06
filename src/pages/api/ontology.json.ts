import type {APIRoute} from 'astro'; import vocab from '../../../data/controlled-vocabularies.json';
export const prerender=true;
const termId=(v:string,t:string)=>`TERM:${v.toUpperCase().replace(/[^A-Z0-9]+/g,'_')}:${String(t).toUpperCase().replace(/[^A-Z0-9]+/g,'_')}`;
const vocabularies=Object.fromEntries(Object.entries(vocab).map(([v,terms])=>[v,(terms as {term:string;label:string;parent?:string;definition?:string}[]).map(t=>({
  id:termId(v,t.term),term:t.term,label:t.label,definition:t.definition??null,parent:t.parent??null}))]));
export const GET:APIRoute=()=>new Response(JSON.stringify({ontology_version:'1.1',generated:new Date().toISOString(),
  licence:'CC BY 4.0',source:'data/controlled-vocabularies.json',vocabularies},null,1),{headers:{'Content-Type':'application/json'}});
