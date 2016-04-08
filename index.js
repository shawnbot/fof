var accessor = require('./lib/accessor');
var arrow = require('./lib/arrow');
var mapper = require('./lib/mapper');
var functor = require('./lib/functor');
var dotmap = require('dotmap');

var fof = function(x) {
  switch (typeof x) {

    case 'function':
      return x;

    case 'number':
      return accessor(x);

    case 'object':
      // because `typeof null === 'object'`, obviously
      if (x === null) {
        return functor(x);
      } else {
        return mapper(x, fof.bind(this));
      }

    case 'boolean':
    case 'undefined':
      return functor(x);
  }

  var fat = arrow(x);
  if (fat) {
    return fat;
  }

  // dotmap handles booleans with a functor
  return dotmap(x);
};

module.exports = fof;