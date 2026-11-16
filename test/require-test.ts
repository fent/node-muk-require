import assert from 'node:assert';
import type Module from 'node:module';
import path from 'node:path';
import muk from '../src';

type MockCallback = (err: Error | null, result: Module) => void;
type MockFunction = (name: string, cb: MockCallback) => void;

const testMockDependency = (dir: string, filename: string) => {
  const mock = { existsSync: () => true };
  const deps: Record<string, unknown> = { [filename]: mock };
  let original: Module;

  it('Original loads without mock', (done) => {
    (require(dir) as MockFunction)(
      filename,
      (err: Error | null, result: Module) => {
        assert.ifError(err);
        original = result;
        done();
      },
    );
  });

  it('Correctly mocks dependency', (done) => {
    muk<MockFunction>(dir, deps)(
      filename,
      (err: Error | null, result: Module) => {
        assert.ifError(err);
        assert.equal(result, mock, 'returned module is mocked object');
        done();
      },
    );
  });

  it('Correctly requires non-mocked dependency', (done) => {
    muk<MockFunction>(dir, deps)(
      'assert',
      (err: Error | null, result: Module) => {
        assert.ifError(err);
        assert.equal(
          assert,
          result,
          'returned module is the same one used in these tests',
        );
        done();
      },
    );
  });

  it('Original module is restored when require() is called', (done) => {
    delete require.cache[require.resolve(dir)];

    (require(dir) as MockFunction)(
      filename,
      (err: Error | null, result: Module) => {
        assert.ifError(err);
        assert.equal(
          result,
          original,
          'requiring module again returns orignal module',
        );
        done();
      },
    );
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
    muk<(cb: (fs: unknown, child: unknown) => void) => void>(
      './custom/parent.js',
      { fs: mymock },
    )((fs: unknown, child: unknown) => {
      assert.equal(fs, mymock);
      assert.equal(child, mymock);
    });
  });
});

describe('Failed module load', () => {
  it('Clears mocks from require.cache', () => {
    const target = path.join(__dirname, 'custom', 'throws.js');
    const dependency = path.join(__dirname, 'custom', 'foo.js');
    delete require.cache[target];
    delete require.cache[dependency];

    assert.throws(() => muk(target, { [dependency]: 'mocked' }), /boom/);
    assert.equal(require.cache[target], undefined);
    assert.equal(require(dependency), 'grimer');
  });

  it('Clears mocks when a dependency cannot be resolved', () => {
    const target = path.join(__dirname, 'custom', 'throws.js');
    const dependency = path.join(__dirname, 'custom', 'foo.js');
    delete require.cache[target];
    delete require.cache[dependency];

    assert.throws(() =>
      muk(target, {
        [dependency]: 'mocked',
        'no-such-module-for-muk-require': 'x',
      }),
    );
    assert.equal(require.cache[target], undefined);
    assert.equal(require(dependency), 'grimer');
  });
});
