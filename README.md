# fof
Functional JavaScript transforms, and a handy [fat arrow] syntax translator for ES5! Some examples:

```js
var fof = require('fof');

// simple property accessor
fof('x')({x: 100}) === 100
fof('foo bar')({'foo bar': 'baz'}) === 'baz'

// deep property accessor, courtesy of dotmap
fof('x.y')){x: {y: 'z'}}) === 'z'
// you can use spaces here; '.' is the separator
fof('foo bar.baz')({'foo bar': {baz: 'qux'}}) === 'qux'

// numeric index accessor
fof(1)([true, false]) === false

// fat arrow syntax
fof('d => d.x')({x: 42}) === 42
// if, for some reason, your data has funky keys...
fof("d => d['gobbledy\\'gook']")({"gobbledy'gook": 1}) === 1
// note the double curly braces for return an object!
['a', 'b', 'c'].map(fof('(d, i) => {{data: d, index: i}}'))
// produces: [
//   {data: 'a', index: 0}, 
//   {data: 'b', index: 1}, 
//   {data: 'c', index: 2}
// ]

// object maps
fof({x: 0, y: 1})([-122, 35]) // produces {x: -122, y: 35}
// values in object maps can be any value recognized by fof()
fof({x: {y: 'd => d.z'}})({z: 100}) // produces: {x: {y: 100}}

// array maps
fof(['y', 'd => d.x'])({x: -100, y: 50}) // produces: [50, -100]
```

## API
The Node module `fof` exports a single function that returns a different type of accessor function for different types of inputs, given `fof(x)`:

* If `x` is a string and roughly matches the syntax of an [ES6 fat arrow function][fat arrow], then you'll get the equivalent ES5 function (minus the lexical scope). In other words:
  * `fof('d => d.x')` returns an accessor for the `x` property of an object.
  * `fof('d => [+d.x, +d.y]')` returns a function that turns an object with `x` and `y` keys into a two-element array of coerced numbers.
* If `x` is a string (and _not_ a fat arrow expression), you get a deep object accessor from [dotmap].
* If `x` is a number, you get a numeric index accessor.
* If `x` is an object (and _not_ an Array), you get a _mapping_ function that returns a new Object the same set of keys and a corresponding value determined by `fof(x[key])`. This allows you to do things like:
  * `fof({x: 0, y: 1})` returns a function that converts a 2-element Array into an Object with `x` and `y` keys corresponding to the first and second elements.
* If `x` is an Array, you get a mapping function that returns a new Array with values corresponding to each index, for which `fof(x[i])` is the value. This allows you to do the inverse of object mapping:
  * `fof(['x', 'y'])` returns a function that converts the `x` and `y` keys of an object into a 2-element array.

Check out [the tests](test/spec.js) for more examples.

[dotmap]: https://github.com/jden/dotmap
[fat arrow]: https://codeplanet.io/es6-fat-arrow-functions/
