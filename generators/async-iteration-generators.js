/*
  Async iteration and generators
  `async function*` lets a generator yield values asynchronously.
  `for await...of` consumes them in sequence.
*/

function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

async function* generateNumbers() {
  for (let i = 1; i <= 3; i++) {
    await delay(500, i);
    yield i;
  }
}

(async () => {
  console.log("Async generator with for await...of:");

  for await (const value of generateNumbers()) {
    console.log(value);
  }
})();

/*
  Async iterable object using Symbol.asyncIterator
*/
const asyncIterable = {
  start: 1,
  end: 3,
  async *[Symbol.asyncIterator]() {
    for (let i = this.start; i <= this.end; i++) {
      await delay(300, i);
      yield i;
    }
  }
};

(async () => {
  console.log("Async iterable object:");

  for await (const value of asyncIterable) {
    console.log(value);
  }
})();

/*
  Async generator with multiple values from a network-like source.
*/
async function* fetchStatuses() {
  const statuses = ["queued", "processing", "done"];

  for (const status of statuses) {
    await delay(400, status);
    yield status;
  }
}

(async () => {
  console.log("Async generator for tasks:");

  for await (const status of fetchStatuses()) {
    console.log(`Status: ${status}`);
  }
})();

/*
  Using async iterator manually with next()
*/
(async () => {
  const iterator = generateNumbers();

  console.log("Manual async iteration:");
  console.log(await iterator.next());
  console.log(await iterator.next());
  console.log(await iterator.next());
  console.log(await iterator.next());
})();
