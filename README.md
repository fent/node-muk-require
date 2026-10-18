# muk-require

[![npm](https://img.shields.io/npm/v/muk-require)](https://www.npmjs.com/package/muk-require)
[![Node.js CI](https://github.com/fent/node-muk-require/actions/workflows/nodejs.yml/badge.svg)](https://github.com/fent/node-muk-require/actions/workflows/nodejs.yml)
[![codecov](https://codecov.io/gh/fent/node-muk-require/branch/master/graph/badge.svg)](https://codecov.io/gh/fent/node-muk-require)

![muk](muk.gif)

# Usage

Mock dependencies.

**foo.js**
```js
const request = require('request');

module.exports = (url) => {
  // Do something with request.
};
```

**test.js**
```js
const request = require('request')

const mockedRequest = (url, options, callback) => {
  // Log all requests.
  console.log('Request made:', url);
  request(url, options, callback)
};

const foo = muk('./foo', {
  // Will overwrite all requires of "request" with our own version.
  request: mockedRequest
});
```

You can also mock modules required with a relative path.

**some/where/else/foo.js**
```js
const bar = require('./bar');

module.exports = () => {
  // Do something with bar.
};
```

**some/where/else/bar.js**
```js
exports.attack = 'sludge attack!';
```

**test.js**
```js
const muk = require('muk-require');
const foo = muk('./some/where/else/foo', { './bar': 'hey!!' });
```


# Install

    npm install muk-require


# Tests
Tests are written with [mocha](https://mochajs.org)

```bash
npm test
```
