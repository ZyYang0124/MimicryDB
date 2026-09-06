#!/usr/bin/env node
// Fetch openly-licensed species photographs from Wikimedia Commons for every taxon in
// the dataset. Attribution is mandatory and travels with the image (data/images.json);
// pages must render the credit line. Public-domain / CC0 / CC-BY candidates are
// preferred over CC BY-SA. No license field = image is not used.
import {data} from '../src/data/provider.ts';
import {writeFileSync, mkdirSync, readFileSync, existsSync} from 'node:fs';
import {slugify} from '../src/data/provider.ts';

const API='https://commons.wikimedia.org/w/api.php';
const get=async(url,tries=3)=>{
  for(let a=1;a<=tries;a++){
    try{const r=await fetch(url,{headers:{'User-Agent':'MimicryDB-prototype/0.3 (scientific demo; contact via repo)'}});
      if(r.ok)return await r.json(); throw new Error(`HTTP ${r.status}`);}
    catch(e){if(a===tries)throw e; await new Promise(r=>setTimeout(r,1500));}
  }
};
const strip=(html)=>String(html??'').replace(/<[^>]*>/g,'').trim();
const licenseRank=(l)=>/public domain/i.test(l)?0:/cc0/i.test(l)?1:/^cc by(-sa)? [1-3]/i.test(l)?2:/^cc by\(/i.test(l)?3:/^cc by-sa/i.test(l)?4:9;
// Title must contain every significant query word (genus + species, or the full
// descriptive phrase). Guards against Commons full-text false matches.
const titleValid=(title,query)=>{
  const t=title.toLowerCase();
  const words=query.toLowerCase().replace(/\([^)]*\)/g,' ').split(/\s+/).filter(w=>w.length>2&&!['and','the'].includes(w));
  return words.length>0&&words.every(w=>t.includes(w));
};

const outPath=new URL('../data/images.json',import.meta.url);
const out=existsSync(outPath)?JSON.parse(readFileSync(outPath,'utf8')):{generated:'',source:'Wikimedia Commons',policy:'Openly licensed photographs; attribution is rendered on every page alongside the image.',images:{}};
out.generated=new Date().toISOString();
const taxa=data.taxa(); let found=0,misses=[];
mkdirSync(new URL('../public/images/',import.meta.url),{recursive:true});
const query=async(name)=>get(`${API}?action=query&generator=search&gsrsearch=${encodeURIComponent(name+' filetype:bitmap')}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1400&format=json`);
for(const t of taxa){
  const slug=slugify(t.name);
  // Curator blocklist: Myia is a nomen dubium with no verifiable imagery (Commons
  // word-matches an unrelated epitaph). Typeographic fallback is the honest choice.
  if(slug==='myia-fugax'){misses.push(`${t.name} (curator blocklist — no verifiable image)`);continue;}
  if(out.images[slug]){found++;continue;} // incremental: keep already-fetched images
  // Fetch photographs only for scientific-name taxa. Descriptive/functional model
  // classes ("female bee", "bird droppings", annotated signal models) get the
  // typographic fallback instead of risking false matches.
  const clean=t.name.replace(/\([^)]*\)/g,' ').trim();
  const scientific=/^[A-Z][a-z]+/.test(clean)&&clean.split(/\s+/).length<=3&&!t.name.includes('(');
  if(!scientific){misses.push(`${t.name} (descriptive model class — no photo attempt)`);continue;}
  const tryFetch=async()=>{
    let cands=[];
    for(const q of [t.name, /^[A-Z][a-z]+/.test(t.name)&&t.name.split(' ').length>1?t.name.split(' ')[0]:null]){
      if(!q)continue;
      const j=await query(q);
      for(const p of Object.values(j.query?.pages??{})){
        const ii=p.imageinfo?.[0]; if(!ii)continue;
        if(!/^image\/(jpeg|png)$/.test(ii.mime??''))continue;
        if((ii.width??0)<500)continue;
        if(/map|distribution|range|diagram|logo|icon|graph|skull|skeleton/i.test(p.title))continue;
        if(!titleValid(p.title,q))continue;
        const em=ii.extmetadata??{};
        const license=strip(em.LicenseShortName?.value)||'unknown';
        const artist=strip(em.Artist?.value)||'Wikimedia Commons contributor';
        cands.push({title:p.title,thumb:ii.thumburl||ii.url,page:ii.descriptionurl,license,licenseUrl:em.LicenseUrl?.value??'',artist,rank:licenseRank(license)});
      }
      if(cands.length)break;
    }
    return cands.sort((a,b)=>a.rank-b.rank).find(c=>c.rank<=4);
  };
  try{
    const pick=await tryFetch();
    if(pick){
      const ext=pick.thumb.toLowerCase().includes('.png')?'png':'jpg';
      const img=await fetch(pick.thumb,{headers:{'User-Agent':'MimicryDB-prototype/0.3'}});
      if(!img.ok)throw new Error(`image HTTP ${img.status}`);
      const buf=Buffer.from(await img.arrayBuffer());
      writeFileSync(new URL(`../public/images/${slug}.${ext}`,import.meta.url),buf);
      out.images[slug]={taxon:t.name,file:`/MimicryDB/images/${slug}.${ext}`,title:pick.title,page:pick.page,license:pick.license,licenseUrl:pick.licenseUrl,artist:pick.artist};
      found++;
    } else misses.push(`${t.name} (no licensed candidate)`);
  }catch(e){misses.push(`${t.name} (${e.message})`);}
  await new Promise(r=>setTimeout(r,120));
}
writeFileSync(outPath,JSON.stringify(out,null,2));
console.log(`images: ${found}/${taxa.length} taxa illustrated${misses.length?` — missing: ${misses.join('; ')}`:''}`);

