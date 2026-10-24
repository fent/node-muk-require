import assert from 'assert';
import type Module from 'module';
import muk from '..';

const testMockDependency = (dir: string, filename: string) => {
  const mock = { existsSync: () => true };
  const deps: Record<string, any> = { [filename]: mock };
  let original: Module;

  it('Original loads without mock', (done) => {
    require(dir)(filename, (err: Error | null, result: Module) => {
      assert.ifError(err);
      original = result;
      done();
    });
  });

  it('Correctly mocks dependency', (done) => {
    muk(dir, deps)(filename, (err: Error | null, result: Module) => {
      assert.ifError(err);
      assert.equal(result, mock, 'returned module is mocked object');
      done();
    });
  });

  it('Correctly requires non-mocked dependency', (done) => {
    muk(dir, deps)('assert', (err: Error | null, result: Module) => {
      assert.ifError(err);
      assert.equal(
        assert,
        result,
        'returned module is the same one used in these tests',
      );
      done();
    });
  });

  it('Original module is restored when require() is called', (done) => {
    delete require.cache[require.resolve(dir)];

    require(dir)(filename, (err: Error | null, result: Module) => {
      assert.ifError(err);
      assert.equal(
        result,
        original,
        'requiring module again returns orignal module',
      );
      done();
    });
  });
};

describe('Mock required user land dependency', () => {
  testMockDependency('./custom', 'nyc');
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

describe('Mock modules required by children too', () => {
  it('Mocks dependency in both parent and children', () => {
    const mymock = {};
    muk('./custom/parent.js', { fs: mymock })((fs: Module, child: Module) => {
      assert.equal(fs, mymock);
      assert.equal(child, mymock);
    });
  });
});
