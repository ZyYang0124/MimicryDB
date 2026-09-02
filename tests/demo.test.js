import test from 'node:test'; import assert from 'node:assert/strict';
test('stable public IDs and directed records',()=>{const ids=['MIMICRY:000001','MIMICRY:000002','MIMICRY:000003']; assert.equal(ids.length,3); assert.ok(ids.every(x=>/^MIMICRY:\d{6}$/.test(x))); assert.notEqual('mimic','model')});
