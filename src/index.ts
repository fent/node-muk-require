import Module from 'module';
import path from 'path';


// This module uses a few privately defined methods inside of the Module module.
// The types for the module don't contain these non-public methods, so we define them here
// and use `@ts-ignore`.
//
// Note that this API could go away one day :(
function resolveFilename(filename: string, parent?: Module | null): string {
  // @ts-ignore
  return Module._resolveFilename(filename, parent);
}


function nodeModulePaths(pathname: string): string[] {
  // @ts-ignore
  return Module._nodeModulePaths(pathname);
}

/**
 * Mocks a call to `require()`
 *
 * @param {string} filename
 * @param {Object} deps
 */
export default function mukRequire(filename: string, deps: Record<string, any>): any {
  filename = resolveFilename(filename, module.parent);
  // @ts-ignore
  const m = require.cache[filename] = new Module(filename, module.parent);
  m.filename = filename;
  m.paths = nodeModulePaths(path.dirname(filename));

  // Load children.
  const children: Record<string, Module> = {};
  for (let key in deps) {
    const childpath = resolveFilename(key, m);
    const child = children[childpath] = new Module(childpath, m);
    require.cache[childpath] = child;
    child.paths = nodeModulePaths(path.dirname(childpath));
    child.loaded = true;
    child.exports = deps[key];
  }

  // @ts-ignore
  m.require = (path) => {
    const childpath = resolveFilename(path, m);
    const child = children[childpath];
    if (child) {
      return child.exports;
    } else {
      // @ts-ignore
      return Module._load(path, m);
    }
  };

  // Load module.
  // @ts-ignore
  m.load(filename);

  // Clear so mocked modules can be required normally.
  delete require.cache[filename];
  for (let key in deps) {
    let childpath = resolveFilename(key, m);
    delete require.cache[childpath];
  }

  return m.exports;
};

module.exports = mukRequire;

// Delete this module from the cache so that the next time it gets
// require()'d it will be aware of the new parent
// in case it gets require()'d from a different directory
delete require.cache[require.resolve(__filename)];
