/*
What is a module?
    A module is just a file. Once you put "export"/"import" in a file
    (or run it as type="module"), it stops being a regular script and
    becomes a module:
      - it runs in strict mode automatically (no "use strict" needed)
      - it has its own top-level scope (top-level vars don't leak to
        other modules or to the global `window`/`globalThis`)
      - it is evaluated only once, no matter how many places import it
        (the module is cached; every importer shares the same instance)
      - `this` at the top level is `undefined` (not `window`)
      - code only runs after the imports it needs are resolved
        (imports are hoisted; you can `import` at the bottom of a file)
    In the browser: <script type="module" src="main.js"></script>
    In Node.js: either name the file *.mjs, or set "type": "module"
    in package.json (then *.js is treated as an ES module too).

    Below, each numbered section shows what would normally live in
    SEPARATE files. The "// ---- file: x.js ----" comments mark file
    boundaries; they can't literally run together in one file, this
    is just to show every export/import shape in context.
*/

/*
Modules are singletons, evaluated once
    Whichever syntax is used, importing the same module from many
    places always shares one evaluated instance - side effects (like
    a top-level console.log, or a shared counter) run only the first
    time, and every importer sees the same state.
*/

// ---- file: counterStore.js ----
export let count = 0;
export function increment() {
    count++;
}

// ---- file: a.js ----
// import { increment } from "./counterStore.js";
// increment();

// ---- file: b.js ----
// import { count } from "./counterStore.js";
// alert(count); // 1 - sees a.js's increment, because count is a live
//                  binding into the ONE shared module instance
