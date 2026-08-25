// ============================================================
// CURRYING IN JAVASCRIPT
// ============================================================
// Currying transforms a function that takes multiple arguments
// into a sequence of functions that each take a single argument.
// f(a, b, c)  =>  f(a)(b)(c)

// ------------------------------------------------------------
// 1. Basic example: manual currying
// ------------------------------------------------------------
function add(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

console.log(add(1)(2)(3)); // 6

// Same thing with arrow functions
const addArrow = (a) => (b) => (c) => a + b + c;
console.log(addArrow(1)(2)(3)); // 6

// ------------------------------------------------------------
// 2. Why curry? Partial application / reusable functions
// ------------------------------------------------------------
const multiply = (a) => (b) => a * b;

const double = multiply(2); // "a" is fixed to 2
const triple = multiply(3); // "a" is fixed to 3

console.log(double(5)); // 10
console.log(triple(5)); // 15

// ------------------------------------------------------------
// 3. Generic curry() helper
// ------------------------------------------------------------
// Converts any normal function into a curried version that can
// be called either one argument at a time, or with several
// arguments at once.
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried.apply(this, [...args, ...moreArgs]);
  };
}

function sum3(a, b, c) {
  return a + b + c;
}

const curriedSum3 = curry(sum3);

console.log(curriedSum3(1, 2, 3)); // 6
console.log(curriedSum3(1)(2, 3)); // 6
console.log(curriedSum3(1)(2)(3)); // 6
console.log(curriedSum3(1, 2)(3)); // 6

// ------------------------------------------------------------
// 4. Practical use case: building specialized functions
// ------------------------------------------------------------
const curriedDiscount = curry((rate, price) => price - price * rate);

const tenPercentOff = curriedDiscount(0.1);
const twentyPercentOff = curriedDiscount(0.2);

console.log(tenPercentOff(200)); // 180
console.log(twentyPercentOff(200)); // 160

module.exports = { add, addArrow, multiply, curry, curriedSum3 };
