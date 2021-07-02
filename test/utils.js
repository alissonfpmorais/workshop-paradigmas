const assert = require('assert');

async function execute(tests, beforeEach = () => null, afterEach = () => null) {
  for (const test of tests) {
    const params = await beforeEach();
    await test(params);
    await afterEach(params);
  }
}

module.exports = {
  assert,
  eq: assert.strictEqual,
  deepEq: assert.deepStrictEqual,
  throws: assert.throws,
  rejects: assert.rejects,
  doesNotReject: assert.doesNotReject,
  execute,
}