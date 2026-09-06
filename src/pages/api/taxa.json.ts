import type {APIRoute} from 'astro'; import {data} from '../../data/provider';
export const prerender=true;
export const GET:APIRoute=()=>new Response(JSON.stringify({generated:new Date().toISOString(),count:data.taxa().length,taxa:data.taxa()},null,1),{headers:{'Content-Type':'application/json'}});
