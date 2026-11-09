import assert from 'node:assert';
import mukRequire, { mukRequire as namedMukRequire } from '..';

describe('Exports', () => {
  it('Exposes function as default and named export', () => {
    assert.strictEqual(mukRequire, namedMukRequire);
    assert.strictEqual(mukRequire.mukRequire, mukRequire);
    assert.strictEqual(mukRequire.default, mukRequire);
  });
});
