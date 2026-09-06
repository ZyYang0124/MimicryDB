#!/usr/bin/env node
// Crossref reference importer (v0.5 groundwork, design §10): paste DOIs, get verbatim
// metadata from the public Crossref REST API — curators confirm, never hand-type.
// Output is a REVIEWABLE report (data/reconciliation/crossref.json), not a dataset
// change: reference rows enter the database only through curator review (v0.5).
// Usage:
//   node scripts/resolve-crossref.mjs 10.1111/j.0014-3820.2001.tb01326.x
//   node scripts/resolve-crossref.mjs --find "Müllerian mimicry Heliconius"
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const outPath=new URL('../data/reconciliation/crossref.json',import.meta.url);
const UA={'User-Agent':'MimicryDB-prototype/0.4 (https://github.com/ZyYang0124/MimicryDB)'};
const argv=process.argv.slice(2);
const findIdx=argv.indexOf('--find');
const query=findIdx>=0?argv[findIdx+1]:null;
const skip=new Set(findIdx>=0?[findIdx,findIdx+1]:[]);
const dois=argv.filter((a,i)=>!skip.has(i)&&!a.startsWith('--'));
const out=existsSync(outPath)&&dois.length?JSON.parse(readFileSync(outPath,'utf8'))
  :{generated:new Date().toISOString(),source:'Crossref REST API (api.crossref.org)',policy:'Metadata fetched verbatim from Crossref for curator review — this report never modifies the dataset directly. Records enter reference tables only through curator confirmation (docs/CURATION_GUIDE.md).',records:{}};
out.generated=new Date().toISOString();
const norm=(doi)=>doi.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//,'');
const mapRecord=(m)=>{
  const authors=(m.author??[]).map(a=>[a.given,a.family].filter(Boolean).join(' ')).filter(Boolean).join('; ');
  const year=m.issued?.['date-parts']?.[0]?.[0]??null;
  return {
    doi:m.DOI,title:(Array.isArray(m.title)?m.title.join(' '):m.title??null)?.replace(/<[^>]+>/g,' ').replace(/s+/g,' ').trim()??null,
    authors:authors||null,year,journal:Array.isArray(m['container-title'])?m['container-title'].join(' '):m['container-title']??null,
    volume:m.volume??null,issue:m.issue??null,page:m.page??null,
    issn:Array.isArray(m.ISSN)?m.ISSN[0]??null:m.ISSN??null,
    publisher:m.publisher??null,type:m.type??null,url:m.URL??(`https://doi.org/${m.DOI}`),
    license:m.license?.[0]?.URL??null,abstract:m.abstract?m.abstract.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim():null,
    crossref_metadata:m,crossref_verified_at:new Date().toISOString()};
};
const fail=(msg)=>{console.log(msg);writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');process.exit(0);};
if(query){
  const res=await fetch(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=3`,{headers:UA});
  if(!res.ok)fail(`crossref: search HTTP ${res.status} — kept ${Object.keys(out.records).length} existing records, retry later`);
  const items=(await res.json()).message?.items??[];
  for(const m of items)out.records[norm(m.DOI)]=mapRecord(m);
  console.log(`crossref: search "${query}" → ${items.length} candidate record(s) stored for review:`);
  for(const m of items)console.log(`  ${m.DOI} — ${(Array.isArray(m.title)?m.title[0]:m.title)??'(no title)'}`);
}else if(dois.length){
  let ok=0,miss=0;
  for(const doi of dois.map(norm)){
    const res=await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`,{headers:UA});
    if(!res.ok){miss++;console.log(`  ${doi}: HTTP ${res.status}`);continue;}
    const m=(await res.json()).message;
    out.records[norm(m.DOI)]=mapRecord(m); ok++;
    console.log(`  ${m.DOI} — ${(Array.isArray(m.title)?m.title[0]:m.title)??'(no title)'}`);
  }
  console.log(`crossref: ${ok} fetched, ${miss} missed`);
}else{
  fail('crossref: nothing to do — pass DOIs or --find "query"');
}
writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');
console.log(`crossref: ${Object.keys(out.records).length} record(s) in ${outPath.pathname.split('/').slice(-2).join('/')}`);
