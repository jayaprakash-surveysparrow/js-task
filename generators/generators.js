/*
  Generators
  A generator is a function that can pause and resume.
  It uses `yield` to produce a sequence of values one at a time.
*/

function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numbers();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

/*
  Using generators with for...of
*/
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

console.log("Range using for...of:");
for (const num of range(1, 5)) {
  console.log(num);
}

/*
  Generator delegation with yield*
*/
function* firstHalf() {
  yield "A";
  yield "B";
}

function* secondHalf() {
  yield "C";
  yield "D";
}

function* fullSequence() {
  yield* firstHalf();
  yield* secondHalf();
}

console.log("Delegated generator:");
console.log([...fullSequence()]);

/*
  Generators can also be used to build iterables.
*/
const iterableObject = {
  start: 1,
  end: 4,
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
};

console.log("Iterable object:");
for (const value of iterableObject) {
  console.log(value);
}

/*
  Generator return value
*/
function* countdown() {
  yield 3;
  yield 2;
  return 1;
}

const c = countdown();
console.log(c.next());
console.log(c.next());
console.log(c.next());

/*
  Generator with passed input
*/
function* multiplyBy(step, limit) {
  for (let i = 1; i <= limit; i++) {
    yield i * step;
  }
}

console.log("Multiply by 10:");
for (const value of multiplyBy(10, 4)) {
  console.log(value);
}
