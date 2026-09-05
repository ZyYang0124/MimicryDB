import {data,gbifAll} from '../data/provider';

export type TreeNode={name:string;rank:string;children:TreeNode[];leaf:string|null;mimic:number;model:number;taxa:number};


/** Builds a taxonomic tree (GBIF classification) with mimic/model counts aggregated up. */
export function buildTree():TreeNode{
  const interactions=data.all();
  const counts=new Map<string,{mimic:number;model:number}>();
  for(const i of interactions){
    if(!counts.has(i.mimic))counts.set(i.mimic,{mimic:0,model:0});
    counts.get(i.mimic)!.mimic++;
    if(!counts.has(i.model))counts.set(i.model,{mimic:0,model:0});
    counts.get(i.model)!.model++;
  }
  const root:TreeNode={name:'Life',rank:'root',children:[],leaf:null,mimic:0,model:0,taxa:0};
  for(const g of gbifAll()){
    if(!g.gbif_classification?.length)continue;
    let cur=root;
    for(const {rank,name} of g.gbif_classification){
      let next=cur.children.find(c=>c.name===name&&c.rank===rank);
      if(!next){next={name,rank,children:[],leaf:null,mimic:0,model:0,taxa:0};cur.children.push(next);}
      cur=next;
    }
    const c=counts.get(g.input)??{mimic:0,model:0};
    cur.children.push({name:g.input,rank:'taxon',children:[],leaf:g.input,mimic:c.mimic,model:c.model,taxa:1});
  }
  const agg=(n:TreeNode):void=>{
    if(n.leaf){n.taxa=1;n.mimic=(counts.get(n.leaf)?.mimic??0);n.model=(counts.get(n.leaf)?.model??0);return;}
    for(const c of n.children)agg(c);
    n.taxa=n.children.reduce((s,c)=>s+c.taxa,0);
    n.mimic=n.children.reduce((s,c)=>Math.max(s,c.mimic),0);
    n.model=n.children.reduce((s,c)=>Math.max(s,c.model),0);
    // collapse single-child chains to keep the tree compact (root/kingdom kept)
    if(n.rank!=='root'&&n.rank!=='kingdom'&&n.children.length===1){const only=n.children[0];n.children=only.children;n.rank=only.rank;n.name=`${n.name} · ${only.name}`;n.leaf=only.leaf;}
  };
  agg(root);
  return root;
}

export type LaidNode={node:TreeNode;x:number;y:number};
export type TreeLayout={nodes:LaidNode[];links:{x1:number;y1:number;x2:number;y2:number}[];width:number;height:number};

/** Horizontal dendrogram: leaves stacked on the right, elbow connectors. */
export function layoutTree(root:TreeNode,{leafGap=26,xStep=120,labelSpace=230}:{leafGap?:number;xStep?:number;labelSpace?:number}={}):TreeLayout{
  const nodes:LaidNode[]=[];const links:TreeLayout['links']=[];
  let leafY=0;let maxDepth=0;
  const walk=(n:TreeNode,depth:number):number=>{
    maxDepth=Math.max(maxDepth,depth);
    if(n.children.length===0){const y=leafY;leafY+=leafGap;nodes.push({node:n,x:depth,y});return y;}
    const ys=n.children.map(c=>walk(c,depth+1));
    const y=(Math.min(...ys)+Math.max(...ys))/2;
    nodes.push({node:n,x:depth,y});
    for(let idx=0;idx<n.children.length;idx++)
      links.push({x1:depth,y1:y,x2:depth+1,y2:ys[idx]});
    return y;
  };
  walk(root,0);
  const width=(maxDepth+1)*xStep+labelSpace;
  const height=Math.max(leafY+40,420);
  return {nodes,links,width,height};
}

export const treeRoles=(n:TreeNode)=>n.mimic>0&&n.model>0?'both':n.mimic>0?'mimic':n.model>0?'model':'none';
export const treeStats=(root:TreeNode)=>{let m=0,d=0;const walk=(n:TreeNode)=>{if(n.leaf){m+=n.mimic>0?1:0;d+=n.model>0?1:0;}n.children.forEach(walk);};walk(root);return{mimicTaxa:m,modelTaxa:d};};
