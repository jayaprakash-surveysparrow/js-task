/*
1. Introduction: async/await
    `async` before a function makes it always return a promise: a
    returned value becomes the resolved value, a thrown error
    becomes the rejection reason. `await` (usable only inside an
    async function, or at the top level of a module) pauses
    execution of that function until the awaited promise settles,
    then returns its value or throws its error - letting async code
    read top-to-bottom like synchronous code, without .then() chains.
*/

function delay(value, ms) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

async function loadScriptAsync(src) {
    console.log(`Loading ${src}...`);
    let result = await delay(`${src} ready`, 300); // pauses here, non-blocking
    console.log(result);
    return result;
}

loadScriptAsync("main.js").then(result => console.log(`Returned: ${result}`));

/*
2. Error handling
    `await` on a rejected promise throws, so the usual try...catch
    handles it - no separate .catch() or error-first callback needed.
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

async function loadScriptWithErrorHandling() {
    try {
        let result = await loadScriptPromise("missing.js");
        console.log(result);
    } catch (error) {
        console.error(`Caught in async/await: ${error.message}`);
    }
}

loadScriptWithErrorHandling();

/*
3. Sequential vs parallel awaiting
    Awaiting one promise after another runs them in *sequence* -
    each one starts only after the previous settles. If the awaits
    are independent, start all the operations first, then await
    them (or use Promise.all), so they run in *parallel* instead.
*/

async function sequential() {
    console.time("sequential");
    let a = await delay("a", 300); // starts, waits 300ms
    let b = await delay("b", 300); // only starts after a finishes
    console.timeEnd("sequential"); // ~600ms
    return [a, b];
}

async function parallel() {
    console.time("parallel");
    let pendingA = delay("a", 300); // starts immediately
    let pendingB = delay("b", 300); // also starts immediately
    let a = await pendingA;
    let b = await pendingB;
    console.timeEnd("parallel"); // ~300ms
    return [a, b];
}

sequential();
parallel();

// combining await with Promise.all is the idiomatic way to run many in parallel
async function loadMultiple() {
    let results = await Promise.all([
        delay("x", 200),
        delay("y", 100),
        delay("z", 300),
    ]);
    console.log("loadMultiple:", results);
}

loadMultiple();

/*
4. async functions always return a promise
    Even if the function body has no `await` and returns a plain
    value, the caller still gets a promise back and must use
    .then()/await to read the result.
*/

async function getValue() {
    return 42; // implicitly wrapped as Promise.resolve(42)
}

getValue().then(value => console.log(`getValue resolved with: ${value}`));

// a thrown error is likewise wrapped into a rejected promise
async function getError() {
    throw new Error("Something went wrong");
}

getError().catch(error => console.error(`getError rejected with: ${error.message}`));

/*
5. Top-level await
    In modules (and directly in Node's REPL), `await` can be used
    outside of an async function, at the top level of the module.
    (Not used here since this file isn't loaded as an ES module,
    but shown for reference.)
*/
// let data = await delay("top-level result", 100);
// console.log(data);

/*
6. async/await with loops
    Awaiting inside a for/of loop processes items one at a time
    (sequentially, respecting order). To process items concurrently,
    map to promises first and Promise.all() the results.
*/

async function processSequentially(items) {
    for (const item of items) {
        let result = await delay(`${item}-done`, 100);
        console.log("sequential item:", result);
    }
}

async function processConcurrently(items) {
    let results = await Promise.all(items.map(item => delay(`${item}-done`, 100)));
    console.log("concurrent items:", results);
}

processSequentially(["1", "2", "3"]);
processConcurrently(["a", "b", "c"]);
