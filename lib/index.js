'use strict';

var Module = require('module');
var path = require('path');


/**
 * Mocks a call to `require()`
 *
 * @param {string} filename
 * @param {Object} deps
 */
module.exports = function mockRequire(filename, deps) {
  filename = Module._resolveFilename(filename, module.parent);
  var m = require.cache[filename] = new Module(filename, module.parent);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(path.dirname(filename));

  // Load children.
  var children = {};
  Object.keys(deps).forEach(function(key) {
    var childpath = Module._resolveFilename(key, m);
    var child = children[childpath] = new Module(childpath, m);
    child.paths = Module._nodeModulePaths(path.dirname(childpath));
    child.loaded = true;
    child.exports = deps[key];
  });

  m.require = function(path) {
    var childpath = Module._resolveFilename(path, m);
    var child = children[childpath];
    if (child) {
      return child.exports;
    } else {
      return Module._load(path, m);
    }
  };

  // Load module.
  m.load(filename);

  // Delete module from cache so it can be required normally.
  delete require.cache[filename];

  return m.exports;
};

// Delete this module from the cache so that the next time it gets
// require()'d it will be aware of the new parent
// in case it gets require()'d from a different directory
delete require.cache[require.resolve(__filename)];
