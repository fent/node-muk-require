module.exports = (path, callback) => {
  // tests that the `require()` calls work asynchronously
  // without having to edit `require.cache`
  process.nextTick(() => {
    callback(null, require(path));
  });
};
