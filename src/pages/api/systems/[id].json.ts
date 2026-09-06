import type {APIRoute,GetStaticPaths} from 'astro'; import {data} from '../../../data/provider';
export const prerender=true;
export const getStaticPaths:GetStaticPaths=()=>data.systems().map(s=>({params:{id:s.public_id.replace(':','-')}}));
export const GET:APIRoute=({params})=>{
  const sys=data.systems().find(s=>s.public_id.replace(':','-')===params.id);
  if(!sys)return new Response(JSON.stringify({error:'system not found'}),{status:404,headers:{'Content-Type':'application/json'}});
  return new Response(JSON.stringify({...sys,interactions:data.interactionsForSystem(sys.public_id)},null,1),{headers:{'Content-Type':'application/json'}});
};
