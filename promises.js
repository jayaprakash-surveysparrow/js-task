/*
1. Introduction: promises
    A Promise is an object representing the eventual result of an
    async operation. The executor function passed to `new Promise`
    runs immediately and receives two functions: resolve(value) on
    success, reject(error) on failure. A promise is always in one of
    three states:
      - pending: initial state, not fulfilled or rejected yet
      - fulfilled: the operation completed successfully
      - rejected: the operation failed
    Once settled (fulfilled/rejected), a promise's state and value
    never change again.
*/

function delay(value, ms) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

let promise = new Promise((resolve, reject) => {
    let success = true;

    setTimeout(() => {
        if (success) {
            resolve("Done!");
        } else {
            reject(new Error("Whoops!"));
        }
    }, 500);
});

/*
2. Consuming a promise: .then, .catch, .finally
    .then(onFulfilled, onRejected) registers handlers for both
    outcomes. .catch(f) is shorthand for .then(null, f). .finally(f)
    runs regardless of outcome, without receiving the value/error,
    and is useful for cleanup (e.g. hiding a loading spinner).
*/

promise
    .then(result => console.log(`Fulfilled: ${result}`))
    .catch(error => console.error(`Rejected: ${error.message}`))
    .finally(() => console.log("Settled (fulfilled or rejected)"));

/*
3. Chaining
    .then() always returns a new promise, so calls can be chained.
    The value returned from one .then() becomes the input of the
    next, letting a sequence of async steps read top-to-bottom
    instead of nesting ("callback hell").
*/

delay(1, 300)
    .then(result => {
        console.log(result); // 1
        return result * 2;
    })
    .then(result => {
        console.log(result); // 2
        return result * 2;
    })
    .then(result => {
        console.log(result); // 4
    });

// returning a promise (not just a value) from .then() is also supported,
// and the chain waits for it to settle before continuing
delay(1, 200)
    .then(result => delay(result + 1, 200))
    .then(result => delay(result + 1, 200))
    .then(result => console.log(`Chained result: ${result}`)); // 3

/*
4. Error handling
    An error thrown, or a rejected promise, anywhere in the chain
    "falls through" all the intermediate .then() steps to the
    nearest .catch(), skipping their success handlers entirely.
*/

new Promise((resolve, reject) => {
    reject(new Error("Something failed"));
})
    .then(result => console.log("This is skipped"))
    .then(result => console.log("This too is skipped"))
    .catch(error => console.error(`Caught: ${error.message}`));

// throwing inside a .then() also routes to the nearest .catch()
Promise.resolve(1)
    .then(result => {
        throw new Error("Thrown in .then()");
    })
    .catch(error => console.error(`Caught: ${error.message}`));

// a .catch() recovers the chain: whatever it returns fulfills the next .then()
Promise.reject(new Error("recoverable"))
    .catch(error => {
        console.error(`Recovering from: ${error.message}`);
        return "fallback value";
    })
    .then(result => console.log(`Continued with: ${result}`));

// an unhandled rejection can be caught globally as a last resort
// (in a browser: window.addEventListener("unhandledrejection", ...))
// (in Node: process.on("unhandledRejection", ...))

/*
5. Promise API
    Promise has 6 static helper methods for working with groups
    of promises (or immediate values).
*/

let p1 = delay("one", 300);
let p2 = delay("two", 100);
let p3 = new Promise((resolve, reject) => setTimeout(() => reject(new Error("p3 failed")), 200));

// Promise.all: waits for all to fulfill, or rejects as soon as one rejects
Promise.all([p1, p2]).then(results => console.log("all:", results)); // ["one", "two"]

// Promise.allSettled: waits for all, never short-circuits; reports each outcome
Promise.allSettled([p1, p2, p3]).then(results => console.log("allSettled:", results));

// Promise.race: settles as soon as the first promise settles (fulfilled or rejected)
Promise.race([p1, p2, p3]).then(
    result => console.log("race fulfilled:", result),
    error => console.error("race rejected:", error.message)
);

// Promise.any: fulfills as soon as the first one fulfills, ignoring rejections
Promise.any([p3, p1, p2]).then(result => console.log("any:", result)); // "two"

// Promise.resolve / Promise.reject: create an already-settled promise
Promise.resolve("cached value").then(result => console.log(result));
Promise.reject(new Error("immediate failure")).catch(error => console.error(error.message));

/*
6. Promisification
    "Promisification" means converting a function that takes an
    error-first callback into one that returns a promise instead,
    so it fits promise-based (or async/await) code.
*/

function loadScriptSafely(src, callback) {
    setTimeout(() => {
        if (src === "missing.js") {
            callback(new Error(`Script not found: ${src}`));
        } else {
            callback(null, `${src} loaded successfully`);
        }
    }, 500);
}

function promisify(f) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            function callback(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
            args.push(callback);
            f.call(this, ...args);
        });
    };
}

let loadScriptPromise = promisify(loadScriptSafely);

loadScriptPromise("promisified.js")
    .then(result => console.log(result))
    .catch(error => console.error(error.message));

/*
7. Microtasks
    Promise callbacks (.then/.catch/.finally handlers) run as
    "microtasks": they execute only after the current synchronous
    code finishes, but before the event loop handles new
    macrotasks like setTimeout - even a setTimeout(fn, 0).
*/

console.log("1: script start");

setTimeout(() => console.log("2: setTimeout (macrotask)"), 0);

Promise.resolve().then(() => console.log("3: promise (microtask)"));

console.log("4: script end");

// logged order: "1: script start", "4: script end", "3: promise (microtask)", "2: setTimeout (macrotask)"
