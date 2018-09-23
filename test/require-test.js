const muk    = require('..');
const assert = require('assert');


const testMockDependency = (dir, filename) => {
  const deps = {};
  const mock = deps[filename] = { existsSync: () => true };
  let original;

  it('Original loads without mock', (done) => {
    require(dir)(filename, (err, result) => {
      original = result;
      done();
    });
  });

  it('Correctly mocks dependency', (done) => {
    muk(dir, deps)(filename, (err, result) => {
      assert.equal(result, mock, 'returned module is mocked object');
      done();
    });
  });

  it('Correctly requires non-mocked dependency', (done) => {
    muk(dir, deps)('assert', (err, result) => {
      assert.equal(assert, result,
        'returned module is the same one used in these tests');
      done();
    });
  });

  it('Original module is restored when require() is called', (done) => {
    delete require.cache[require.resolve(dir)];

    require(dir)(filename, (err, result) => {
      assert.equal(result, original,
        'requiring module again returns orignal module');
      done();
    });
  });
};


describe('Mock required user land dependency', () => {
  testMockDependency('./custom', 'mocha');
});

describe('Mock require native module', () => {
  testMockDependency('./custom', 'fs');
});

describe('Mock required relative file', () => {
  testMockDependency('./custom', './foo');
});

describe('Mock required relative file in a different dir', () => {
  require('./dir')('./custom', './bar');
});
