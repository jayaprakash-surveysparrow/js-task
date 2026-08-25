/*
1. Dynamic import: import(...)
    A function-like operator (not a real function - can't be
    `.call`/`.apply`'d) that loads a module on demand and returns a
    Promise resolving to that module's exports namespace object. It
    works from regular scripts too, not just modules, and can be
    called from anywhere, e.g. conditionally or inside a function.
*/

async function loadMath() {
    const math = await import("./mathUtils.js"); // dynamic, lazy, code-split by bundlers
    alert(math.add(2, 3)); // 5
    // default export shows up as `.default` on the namespace object:
    // const { default: User } = await import("./user2.js");
}

// same thing with .then instead of await:
// import("./mathUtils.js").then((math) => alert(math.PI));

/*
2. import.meta
    Gives metadata about the current module. In browsers/Node ESM,
    `import.meta.url` is the module's own URL/file path - handy for
    resolving assets relative to the current file.
*/

// alert(import.meta.url); // e.g. "file:///path/to/dynamic_imports.js"

/*
3. Top-level await
    Inside a module (not a plain script), `await` is allowed directly
    at the top level - no wrapping async function needed. Modules that
    import a top-level-await module wait for it to finish before they
    themselves start running.
*/

// ---- file: config.js ----
// const res = await fetch("/config.json");
// export const config = await res.json();

// ---- file: main8.js ----
// import { config } from "./config.js"; // waits for config.js's fetch to settle
