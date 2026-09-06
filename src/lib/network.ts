import {data,type TaxonSummary} from '../data/provider.ts';
/** Directed mimicry network: nodes are taxa, edges run mimic → model (the direction
 *  of deception). Layout is a deterministic build-time force simulation — no runtime
 *  dependencies, same result on every build. */
export type NetNode={name:string;slug:string;mimic:number;model:number;role:'mimic'|'model'|'both';lineages:string};
export type NetEdge={from:string;to:string;interaction:string;type:string;crossKingdom:boolean};
export const buildNetwork=():{nodes:NetNode[];edges:NetEdge[]}=>{
  const taxa:TaxonSummary[]=data.taxa();
  const nodes:NetNode[]=taxa.map(t=>({name:t.name,slug:t.slug,mimic:t.asMimic,model:t.asModel,
    role:t.asMimic>0&&t.asModel>0?'both':(t.asMimic>0?'mimic':'model'),lineages:t.lineages}));
  const edges:NetEdge[]=data.all().map(i=>{const [mk,dk]=i.kingdoms.split(' → ').map(x=>x.trim());
    return {from:i.mimic,to:i.model,interaction:i.id,type:i.type,
      crossKingdom:mk!==dk&&(i.modelKind??'organism')==='organism'};});
  return {nodes,edges};
};
export const layoutNetwork=(nodes:NetNode[],edges:NetEdge[]):{width:number;height:number;pos:{x:number;y:number}[]}=>{
  const n=nodes.length; const W=1040,H=620;
  const idx=new Map<string,number>(nodes.map((nd,i)=>[nd.name,i]));
  // similarity = Jaccard overlap of the mimicry-type sets each taxon participates in
  // (as mimic OR model); species sharing a pattern get a weak clustering spring.
  const typeSets=new Map<string,Set<string>>();
  for(const e of edges){
    if(!typeSets.has(e.from))typeSets.set(e.from,new Set());
    if(!typeSets.has(e.to))typeSets.set(e.to,new Set());
    typeSets.get(e.from)!.add(e.type); typeSets.get(e.to)!.add(e.type);
  }
  const S:number[][]=Array.from({length:n},()=>new Array(n).fill(0));
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
    const A=typeSets.get(nodes[a].name),B=typeSets.get(nodes[b].name);
    if(!A||!B)continue;
    let inter=0; for(const t of A)if(B.has(t))inter++;
    const union=A.size+B.size-inter;
    S[a][b]=S[b][a]=union?inter/union:0;
  }
  // deterministic initial ring by dataset order — no RNG anywhere
  const pos=nodes.map((_,i)=>({x:W/2+Math.cos(2*Math.PI*i/Math.max(n,1))*W*0.36,y:H/2+Math.sin(2*Math.PI*i/Math.max(n,1))*H*0.36}));
  const deg=(i:number)=>nodes[i].mimic+nodes[i].model;
  for(let iter=0;iter<420;iter++){
    const cool=1-iter/560; // early iterations move further
    const fx=new Array(n).fill(0),fy=new Array(n).fill(0);
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
      const dx=pos[a].x-pos[b].x,dy=pos[a].y-pos[b].y;
      const d2=Math.max(dx*dx+dy*dy,120);const d=Math.sqrt(d2);
      const rep=(2400+9*deg(a)*deg(b))/d2;
      const ux=dx/d,uy=dy/d;
      fx[a]+=ux*rep;fy[a]+=uy*rep;fx[b]-=ux*rep;fy[b]-=uy*rep;
    }
    for(const e of edges){
      const a=idx.get(e.from),b=idx.get(e.to); if(a===undefined||b===undefined)continue;
      const dx=pos[b].x-pos[a].x,dy=pos[b].y-pos[a].y;
      const d=Math.max(Math.sqrt(dx*dx+dy*dy),1);
      const att=(d-235)*0.014*cool;
      const ux=dx/d,uy=dy/d;
      fx[a]+=ux*att;fy[a]+=uy*att;fx[b]-=ux*att;fy[b]-=uy*att;
    }
    // pattern clustering: similar species drift toward each other
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
      const s=S[a][b]; if(!s)continue;
      const dx=pos[b].x-pos[a].x,dy=pos[b].y-pos[a].y;
      const d=Math.max(Math.sqrt(dx*dx+dy*dy),1);
      const att=s*(d-190)*0.011;
      const ux=dx/d,uy=dy/d;
      fx[a]+=ux*att;fy[a]+=uy*att;fx[b]-=ux*att;fy[b]-=uy*att;
    }
    for(let a=0;a<n;a++){
      fx[a]+=(W/2-pos[a].x)*0.005; fy[a]+=(H/2-pos[a].y)*0.006;
      const step=16*cool;
      pos[a].x=Math.min(W-70,Math.max(70,pos[a].x+Math.max(-step,Math.min(step,fx[a]))));
      pos[a].y=Math.min(H-56,Math.max(56,pos[a].y+Math.max(-step,Math.min(step,fy[a]))));
    }
  }
  return {width:W,height:H,pos};
};
/** Trim a straight segment so it starts/ends outside the node circles. */
export const trimEdge=(x1:number,y1:number,x2:number,y2:number,r1:number,r2:number)=>{
  const dx=x2-x1,dy=y2-y1;const d=Math.max(Math.sqrt(dx*dx+dy*dy),1);
  const ux=dx/d,uy=dy/d;
  return {x1:x1+ux*(r1+3),y1:y1+uy*(r1+3),x2:x2-ux*(r2+9),y2:y2-uy*(r2+9)};
};
