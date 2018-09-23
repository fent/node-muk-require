const muk    = require('../..');
const assert = require('assert');


module.exports = (dir, filename) => {
  let original;

  it('Original loads without mock', () => {
    original = require(dir)(filename);
  });

  it('Correctly mocks dependency', () => {
    const deps = {};
    const mock = deps[filename] = { existsSync: () => true };
    const result = muk(dir, deps)(filename);
    assert.equal(result, mock, 'returned module is mocked object');
  });

  it('Original module is restored when require() is called', () => {
    delete require.cache[require.resolve(dir)];
    const result = require(dir)(filename);
    assert.equal(result, original,
      'requiring module again returns orignal module');
  });
};
