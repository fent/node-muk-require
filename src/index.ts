import Module from 'module';
import path from 'path';

// This module uses a few privately defined methods inside of the Module module.
// The types for the module don't contain these non-public methods, so we define them here
// and use `@ts-expect-error`.
//
// Note that this API could go away one day :(
function resolveFilename(filename: string, parent?: Module | null): string {
  // @ts-expect-error
  return Module._resolveFilename(filename, parent);
}

function nodeModulePaths(pathname: string): string[] {
  // @ts-expect-error
  return Module._nodeModulePaths(pathname);
}

/**
 * Mocks a call to `require()`
 *
 * @param {string} filename
 * @param {Object} deps
 */
export default function mukRequire(
  filename: string,
  deps: Record<string, any>,
): any {
  filename = resolveFilename(filename, module.parent);
  // @ts-expect-error
  const m = new Module(filename, module.parent);
  require.cache[filename] = m;
  m.filename = filename;
  m.paths = nodeModulePaths(path.dirname(filename));

  // Load children.
  const previousCache: Record<string, Module | undefined> = {};
  const children: Record<string, Module> = {};
  for (const key in deps) {
    const childpath = resolveFilename(key, m);
    previousCache[childpath] = require.cache[childpath];
    const child = new Module(childpath, m);
    children[childpath] = child;
    require.cache[childpath] = child;
    child.paths = nodeModulePaths(path.dirname(childpath));
    child.loaded = true;
    child.exports = deps[key];
  }

  m.require = (path) => {
    const childpath = resolveFilename(path, m);
    const child = children[childpath];
    if (child) {
      return child.exports;
    } else {
      // @ts-expect-error
      return Module._load(path, m);
    }
  };

  // Load module.
  // @ts-expect-error
  m.load(filename);

  // Clear so mocked modules can be required normally.
  delete require.cache[filename];
  for (const key in deps) {
    const childpath = resolveFilename(key, m);
    if (previousCache[childpath]) {
      require.cache[childpath] = previousCache[childpath];
    } else {
      delete require.cache[childpath];
    }
  }

  return m.exports;
}

module.exports = mukRequire;

// Delete this module from the cache so that the next time it gets
// require()'d it will be aware of the new parent
// in case it gets require()'d from a different directory
delete require.cache[require.resolve(__filename)];
