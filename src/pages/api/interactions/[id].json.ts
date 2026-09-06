import type {APIRoute,GetStaticPaths} from 'astro'; import {data} from '../../../data/provider';
export const prerender=true;
export const getStaticPaths:GetStaticPaths=()=>data.all().map(i=>({params:{id:i.id.replace(':','-')}}));
export const GET:APIRoute=({params})=>{
  const i=data.byId(params.id??'');
  if(!i)return new Response(JSON.stringify({error:'interaction not found'}),{status:404,headers:{'Content-Type':'application/json'}});
  return new Response(JSON.stringify({...i,references:data.refsFor(i.id),systems:data.systems().filter(s=>s.members.includes(i.id)).map(s=>s.public_id)},null,1),{headers:{'Content-Type':'application/json'}});
};
