# muk-require

[![Build Status](https://secure.travis-ci.org/fent/node-muk-require.svg)](http://travis-ci.org/fent/node-muk-require)
[![Dependency Status](https://david-dm.org/fent/node-muk-require.svg)](https://david-dm.org/fent/node-muk-require)
[![codecov](https://codecov.io/gh/fent/node-muk-require/branch/master/graph/badge.svg)](https://codecov.io/gh/fent/node-muk-require)

![muk](muk.gif)

# Usage

Mock dependencies.

**foo.js**
```js
var request = require('request');

module.exports = function foo(url) {
  // do something with request
};
```

**test.js**
```js
var mockedRequest = function(url, options, callback) {
  // mock a request here
};

var foo = muk('./foo', {
  request: mockedRequest
});
```

You can also mock modules required with a relative path.

**some/where/else/foo.js**
```js
var bar = require('./bar');

module.exports = function() {
  // do something with bar
};
```

**some/where/else/bar.js**
```js
exports.attack = 'sludge attack!';
```

**test.js**
```js
var muk = require('muk-require');
var foo = muk('./some/where/else/foo', { './bar': 'hey!!' });
```


# Install

    npm install muk-require


# Tests
Tests are written with [mocha](https://mochajs.org)

```bash
npm test
```

# License
MIT
