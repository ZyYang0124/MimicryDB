import test from 'node:test'; import assert from 'node:assert/strict';
import {interactions} from '../src/data/demo.ts';
import {data,slugify} from '../src/data/provider.ts';

test('public IDs are unique and well-formed',()=>{
  const ids=interactions.map(i=>i.id);
  assert.ok(ids.length>0);
  assert.ok(ids.every(x=>/^MIMICRY:\d{6}$/.test(x)));
  assert.equal(new Set(ids).size,ids.length);
});

test('every record has complete required fields',()=>{
  for(const i of interactions){
    for(const field of ['mimic','model','receiver','type','kingdoms','summary','reference'])
      assert.ok(i[field]?.trim(),`${i.id}: empty ${field}`);
    assert.match(i.reference,/sample data/i,`${i.id}: demo records must disclose their status`);
  }
});

test('evidence grades stay within the E0–E4 framework',()=>{
  assert.ok(interactions.every(i=>/^E[0-4]$/.test(i.evidence)));
});

test('records are directional: mimic differs from model',()=>{
  for(const i of interactions) assert.notEqual(i.mimic,i.model,`${i.id}: mimic must differ from model`);
});

test('kingdom flow notation is well-formed',()=>{
  const kingdoms=new Set(['Animalia','Plantae','Fungi','Protista','Monera','Bacteria','Archaea']);
  for(const i of interactions){
    const parts=i.kingdoms.split(' → ').map(x=>x.trim());
    assert.equal(parts.length,2,`${i.id}: kingdoms must be "X → Y"`);
    assert.ok(parts.every(p=>kingdoms.has(p)),`${i.id}: unknown kingdom in "${i.kingdoms}"`);
  }
});

test('provider round-trips public IDs',()=>{
  for(const i of data.all()){
    assert.equal(data.byId(i.id)?.id,i.id);
    assert.equal(data.byId(i.id.replace(':','-'))?.id,i.id);
  }
  assert.equal(data.byId('MIMICRY:999999'),undefined);
});

test('taxa summaries stay consistent with the interaction list',()=>{
  const taxa=data.taxa();
  assert.ok(taxa.every(t=>t.asMimic+t.asModel>0));
  assert.equal(taxa.reduce((n,t)=>n+t.asMimic,0),interactions.length);
  assert.equal(taxa.reduce((n,t)=>n+t.asModel,0),interactions.length);
  for(const t of taxa) assert.equal(t.slug,slugify(t.name));
});
