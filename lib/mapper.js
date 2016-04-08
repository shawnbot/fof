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
