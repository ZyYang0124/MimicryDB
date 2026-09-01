import test from 'node:test'; import assert from 'node:assert/strict';
test('stable public IDs and directed records', async()=>{const {interactions}=await import('../src/data/demo.ts'); assert.equal(interactions.length,3); assert.ok(interactions.every(x=>/^MIMICRY:\d{6}$/.test(x.id))); assert.notEqual(interactions[0].mimic,interactions[0].model)});
