// biome-ignore lint/style/useNodejsImportProtocol: test fixture mocks fs
const fs = require('fs');
const child = require('./child');

module.exports = (callback) => {
  process.nextTick(() => {
    callback(fs, child);
  });
};
