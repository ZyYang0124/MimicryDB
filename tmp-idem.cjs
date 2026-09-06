const fs=require('fs');
// 1) setup generator: make policies idempotent (drop-if-exists before create)
let sp=fs.readFileSync('scripts/supabase-setup.mjs','utf8');
if(!sp.includes('drop policy if exists')){
  const inject=`
// Idempotency: a previous partial run may have created policies already — make the
// paste safe to re-run by dropping before creating.
parts.push(parts.map(part=>part.replace(/create policy ("(?:[^"]+)") on (\\w+) for select/g,'drop policy if exists $1 on $2;\\ncreate policy $1 on $2 for select')));
`;
  const anchor="writeFileSync(new URL('../docs/supabase-setup.sql',import.meta.url),";
  if(!sp.includes(anchor))throw new Error('setup anchor missing');
  sp=sp.replace(anchor,inject+anchor);
  fs.writeFileSync('scripts/supabase-setup.mjs',sp);
}
// 2) seed generator: interaction_reference insert must be conflict-safe on re-run
let gs=fs.readFileSync('scripts/generate-seed.mjs','utf8');
const irOld="insert into interaction_reference (interaction_id, reference_id, claim_roles) select mi.id, rf.id, ${q('{'+(r.claims??[]).join(',')+'}')}::text[] from mimicry_interaction mi, reference rf where mi.public_id=${q(i.id)} and rf.title=${q(r.title)};`;
if(!gs.includes(irOld))throw new Error('interaction_reference insert not found');
gs=gs.replace(irOld,irOld.slice(0,-1)+" on conflict do nothing;");
fs.writeFileSync('scripts/generate-seed.mjs',gs);
console.log('idempotency patches applied');
