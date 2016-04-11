var fof = require('../');
var assert = require('assert');
var streamify = require('stream-array');

describe('fof(String)', function() {

  it('returns an accessor function without dots', function() {
    assert.equal(fof('x')({x: 3}), 3);
  });

  it('returns an (index) accessor function without dots', function() {
    assert.equal(fof('1')([1, 2]), 2);
  });

  it('returns a deep accessor with dots', function() {
    assert.equal(fof('a.b')({a: {b: 5}}), 5);
  });

});

describe('fof(ArrowFunction)', function() {

  it('recognizes a single argument', function() {
    assert.equal(fof('d => d.x')({x: 3}), 3);
  });

  it('recognizes mutliple arguments', function() {
    assert.equal(fof('(d, i) => i')({x: 3}, 100), 100);
  });

  it('recognizes zero arguments', function() {
    assert.equal(fof('() => 3')(), 3);
  });

  it('ignores outer braces', function() {
    assert.equal(fof('d => { d.x }')({x: 3}), 3);
  });

  it('allows object literals with double curlies', function() {
    assert.deepEqual(fof('d => {{y: d.x}}')({x: 3}), {y: 3});
  });

});

describe('fof(Number)', function() {

  it('returns a numeric index accessor', function() {
    assert.equal(fof(1)([false, 3]), 3);
  });

});

describe('fof(Boolean)', function() {

  it('returns a literal', function() {
    assert.equal(fof(false)({}), false);
    assert.equal(fof(true)({}), true);
  });

});

describe('fof(Object)', function() {

  it('maps objects one level deep', function() {
    assert.deepEqual(fof({y: 'x'})({x: 100}), {y: 100});
    assert.deepEqual(fof({x: 0, y: 1})([50, 100]), {x: 50, y: 100});
  });

  it('maps objects with arrow expression', function() {
    assert.deepEqual(fof({y: 'd => d.x'})({x: 100}), {y: 100});
    assert.deepEqual(fof({x: 'd=> d[0]', y: 'd=> d[1]'})([50, 100]), {x: 50, y: 100});
  });

  it('maps objects with nested maps', function() {
    assert.deepEqual(fof({y: {z: 'x'}})({x: 100}), {y: {z: 100}});
  });

});

describe('fof(Array)', function() {

  it('maps arrays one level deep', function() {
    assert.deepEqual(fof(['x', 'y'])({x: 100, y: 200}), [100, 200]);
  });

  it('maps arrays two levels deep', function() {
    assert.deepEqual(fof([false, ['x', 'y']])({x: 100, y: 200}), [false, [100, 200]]);
  });

});

var testStream = function(input, x, options, output, reason) {
  var out = [];
  streamify(input)
    .pipe(fof.stream(x, options))
    .on('data', function(d) {
      out.push(d);
    })
    .on('end', function() {
      assert.deepEqual(out, output, reason);
    });
};

describe('fof.stream(x)', function() {

  it('works', function() {
    testStream(
      [{x: 1, y: 2}, {x: 2, y: 1}],
      'd => [d.x, d.y]',
      null,
      [[1, 2], [2, 1]]
    );
  });

});

describe('fof.stream(x, {filter: true})', function() {

  it('works', function() {
    testStream(
      [{x: 1, y: 2}, {x: 2, y: 1}],
      'd => d.x > 1',
      {filter: true},
      [{x: 2, y: 1}]
    );
  });

});


describe('fof.stream(x, {filter: expression})', function() {

  it('works', function() {
    testStream(
      [{x: 1, y: 2}, {x: 2, y: 1}],
      'd => [d.x, d.y]',
      {filter: 'd => d.x > 1'},
      [[2, 1]]
    );
  });

});
