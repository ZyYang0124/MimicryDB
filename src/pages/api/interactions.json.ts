import type {APIRoute} from 'astro'; import {data} from '../../data/provider';
export const prerender=true;
export const GET:APIRoute=()=>new Response(JSON.stringify({generated:new Date().toISOString(),count:data.all().length,
    licence:'CC BY 4.0',note:'All records are evidence-aware demo/prototype data until curation publishes real ones (DEMO-labeled).',
    interactions:data.all()},null,1),{headers:{'Content-Type':'application/json'}});
