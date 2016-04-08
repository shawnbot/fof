(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./lib/accessor":2,"./lib/arrow":3,"./lib/functor":4,"./lib/mapper":5,"dotmap":6}],2:[function(require,module,exports){
module.exports = function accessor(index) {
  return function(d) {
    return d[index];
  };
};

},{}],3:[function(require,module,exports){
var FAT_ARROW = /^\s*\(?((\w+)(\s*,\s*\w+)*)?\)?\s*=>\s*(.+)\s*$/;

module.exports = function fatArrow(str) {
  if (typeof str === 'string') {
    var match = str.match(FAT_ARROW);
    if (match) {
      var body = match[4];
      if (body.charAt(0) === '{') {
        if (body.substr(-1) !== '}') {
          throw new Error('invalid fat arrow body: "' + body + '"');
        }
        // strip the outer curly braces
        body = body.substr(1, body.length - 2);
      }
      return new Function(match[1], 'return (' + body + ');');
    }
  }
};

},{}],4:[function(require,module,exports){
module.exports = function(x) {
  return function() {
    return x;
  };
};

},{}],5:[function(require,module,exports){
module.exports = function mapper(source, fof) {
  var ctor = Array.isArray(source) ? Array : Object;
  var key;
  for (key in source) {
    source[key] = (typeof source[key] === 'object')
      ? mapper(source[key], fof)
      : fof(source[key]);
  }
  return function(d) {
    var out = new ctor();
    for (key in source) {
      out[key] = source[key].call(this, d);
    }
    return out;
  };
};

},{}],6:[function(require,module,exports){
var I = function (x) { return x }

// loop unrolled, see: http://jsperf.com/descendents
function dotMap(path) {
  if (typeof path !== 'string' || path.length === 0) {
    return I
  }
  var segments = path.split('.')
  var len = segments.length

  switch (len) {
    case 0: return I
    case 1: return function (x) {
        return x[segments[0]]
      }
    case 2: return function (x) {
        return x[segments[0]][segments[1]]
      }
    case 3: return function (x) {
        return x[segments[0]][segments[1]][segments[2]]
      }
    case 4: return function (x) {
      return x[segments[0]][segments[1]][segments[2]][segments[3]]
    }
  }
  return function (x) {
    var i
    while(i = segments.shift(), x = x[i], segments.length);
    return x;
  }
}

function safe(path) {
  var map = dotMap(path)
  return function (x) {
    try {
      return map(x)
    } catch (e) {}
  }
}

function get(obj, path) {
  return safe(path)(obj)
}

module.exports = dotMap
module.exports.safe = safe
module.exports.get = get
},{}]},{},[1]);
