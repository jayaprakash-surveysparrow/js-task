/*
1. Introduction: callbacks
    Many functions in JS are asynchronous: they start an action (like
    loading a script or a timer) and let it finish "in the background",
    running the rest of the code without waiting. A callback is a
    function passed as an argument, to be called once the action completes.
*/

function loadScript(src, callback) {
    // simulates an async operation, e.g. loading a script over the network
    setTimeout(() => {
        console.log(`Script loaded: ${src}`);
        callback();
    }, 500);
}

loadScript("script.js", () => {
    console.log("Callback: script is ready, now we can use it");
});

/*
1b. Callback in callback / "callback hell"
    To run several async actions one after another, callbacks get
    nested inside callbacks. A few steps are fine, but many steps
    produce a "pyramid of doom" that's hard to read and maintain.
*/

loadScript("1.js", () => {
    loadScript("2.js", () => {
        loadScript("3.js", () => {
            console.log("All three scripts loaded, in order");
            // ...and so on, growing to the right with each new step
        });
    });
});

/*
1c. Handling errors in callbacks
    The common convention ("error-first callback") is: the first
    argument of the callback is reserved for an error (or null if
    none), and any success results come after it.
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

loadScriptSafely("app.js", (err, result) => {
    if (err) {
        console.error("Error:", err.message);
    } else {
        console.log(result);
    }
});

/*
2. Promise
    A Promise is an object representing the eventual result of an
    async operation. It's either:
      - pending: initial state, not fulfilled or rejected yet
      - fulfilled: the operation completed successfully (resolve(value))
      - rejected: the operation failed (reject(error))
    Once settled (fulfilled/rejected), a promise's state and value never change.
*/

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

promise.then(
    result => console.log(`Fulfilled: ${result}`),
    error => console.error(`Rejected: ${error.message}`)
);

/*
3. Promises chaining
    .then() always returns a new promise, so calls can be chained.
    The value returned from one .then() becomes the input of the next,
    letting a sequence of async steps read top-to-bottom instead of nesting.
*/

new Promise((resolve) => {
    setTimeout(() => resolve(1), 500);
})
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
function delay(value, ms) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

delay(1, 300)
    .then(result => delay(result + 1, 300))
    .then(result => delay(result + 1, 300))
    .then(result => console.log(`Chained result: ${result}`)); // 3

/*
4. Error handling with promises
    .catch(f) is shorthand for .then(null, f). An error thrown or a
    rejected promise anywhere in the chain "falls through" all the
    .then() steps to the nearest .catch(), skipping their success handlers.
*/

new Promise((resolve, reject) => {
    reject(new Error("Something failed"));
})
    .then(result => console.log("This is skipped"))
    .then(result => console.log("This too is skipped"))
    .catch(error => console.error(`Caught: ${error.message}`));

// throwing inside a .then() also routes to .catch()
Promise.resolve(1)
    .then(result => {
        throw new Error("Thrown in .then()");
    })
    .catch(error => console.error(`Caught: ${error.message}`));

// an unhandled rejection can be caught globally as a last resort
// (in a browser: window.addEventListener("unhandledrejection", ...))
// (in Node: process.on("unhandledRejection", ...))

/*
5. Promise API
    Promise has 6 static helper methods for working with groups of promises.
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
    so it can be used with .then()/await and fits promise-based code.
*/

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
    Promise callbacks (.then/.catch/.finally handlers) run as "microtasks":
    they execute only after the current synchronous code finishes, but
    before the browser/Node event loop renders or handles new events -
    and before macrotasks like setTimeout, even a setTimeout(fn, 0).
*/

console.log("1: script start");

setTimeout(() => console.log("2: setTimeout (macrotask)"), 0);

Promise.resolve().then(() => console.log("3: promise (microtask)"));

console.log("4: script end");

// logged order: "1: script start", "4: script end", "3: promise (microtask)", "2: setTimeout (macrotask)"

/*
8. Async/await
    `async` before a function makes it always return a promise.
    `await` (usable only inside an async function) pauses execution
    until the awaited promise settles, then returns its value or
    throws its error - letting async code read like synchronous code.
*/

async function loadScriptAsync(src) {
    console.log(`Loading ${src}...`);
    let result = await delay(`${src} ready`, 300); // pauses here, non-blocking
    console.log(result);
    return result;
}

loadScriptAsync("main.js").then(result => console.log(`Returned: ${result}`));

// error handling with async/await uses plain try...catch
async function loadScriptWithErrorHandling() {
    try {
        let result = await promisify(loadScriptSafely)("missing.js");
        console.log(result);
    } catch (error) {
        console.error(`Caught in async/await: ${error.message}`);
    }
}

loadScriptWithErrorHandling();

// awaiting multiple promises in parallel: combine await with Promise.all
async function loadMultiple() {
    let results = await Promise.all([
        delay("a", 200),
        delay("b", 100),
        delay("c", 300),
    ]);
    console.log("loadMultiple:", results);
}

loadMultiple();
