var accessor = require('./lib/accessor');
var arrow = require('./lib/arrow');
var mapper = require('./lib/mapper');
var functor = require('./lib/functor');
var dotmap = require('dotmap');
var through2 = require('through2');

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

fof.stream = function(x, options) {
  if (!options || typeof options !== 'object') {
    options = {};
  }

  var filter = options.filter || false;
  var multiple = options.multiple || false;

  var transform = x ? fof(x) : null;
  if (filter && filter !== true) {
    filter = fof(filter);
  }

  var write = function(data, next) {
    if (multiple && Array.isArray(data)) {
      data.forEach(function(d) {
        this.push(d);
      }, this);
      next();
    } else {
      next(null, data);
    }
  };

  var thru = (typeof filter === 'function')
    ? function(d, enc, next) {
        var filtered = filter(d);
        return filtered
          ? write.call(this, transform ? transform(d) : d, next)
          : next();
      }
    : function(d, enc, next) {
        var out = transform(d);
        return out === false
          ? next()
          : write.call(this, filter ? d : out, next);
      };
  return through2.obj(thru);
};

module.exports = fof;
