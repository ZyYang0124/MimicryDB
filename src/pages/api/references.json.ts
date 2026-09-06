import type {APIRoute} from 'astro'; import {data} from '../../data/provider';
export const prerender=true;
export const GET:APIRoute=()=>new Response(JSON.stringify({generated:new Date().toISOString(),references:data.references().map(r=>({...r.ref,supports:r.supports}))},null,1),{headers:{'Content-Type':'application/json'}});
