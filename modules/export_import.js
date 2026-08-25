/*
1. Named exports
    Export as many things as you want by name. Attach `export` right
    before a declaration, or export a list at the end of the file.
*/

// ---- file: mathUtils.js ----
export const PI = 3.14159;
export let counter = 0; // "let"/"var" exports are LIVE bindings: importers
// see updates when the exporting module changes the value later.

export function add(a, b) {
    return a + b;
}

export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// or, equivalently, declare first and export together at the bottom:
function subtract(a, b) {
    return a - b;
}
function multiply(a, b) {
    return a * b;
}
export { subtract, multiply };

// ---- file: main1.js ----
// import { PI, add, Vector } from "./mathUtils.js";
// alert(add(2, 3)); // 5

/*
2. Renaming on export / import ("export as", "import as")
    Use `as` to expose or consume a binding under a different name,
    without touching the original declaration.
*/

// ---- file: user.js ----
function login() {
    /* ... */
}
export { login as signIn }; // consumers must import it as `signIn`

// ---- file: main2.js ----
// import { signIn } from "./user.js";
// import { signIn as login } from "./user.js"; // rename again on the way in

/*
3. Default export
    Each module can have ONE default export - the "main" thing the
    file provides. `export default` works on a value, a function, or
    a class, named or anonymous.
*/

// ---- file: user2.js ----
export default class User {
    constructor(name) {
        this.name = name;
    }
}
// equivalent alternatives:
// export default function User(name) { this.name = name; }
// export default function() { ... }              // anonymous is fine
// const user = new User("John"); export default user; // export a value

// ---- file: main3.js ----
// import User from "./user2.js";      // no braces, and any local name works
// import MyUser from "./user2.js";    // this is legal too - default has no fixed name
// let user = new User("John");

/*
4. Named + default export together
    A module can mix one default export with any number of named
    exports. Import them in the same statement, default first.
*/

// ---- file: package.js ----
export default class Package {
    constructor(name) {
        this.name = name;
    }
}
export const VERSION = "1.0.0";
export function describe(pkg) {
    return `${pkg.name}@${VERSION}`;
}

// ---- file: main4.js ----
// import Package, { VERSION, describe } from "./package.js";
// import Package, * as pkgUtils from "./package.js"; // default + namespace

/*
5. Namespace import ("import * as")
    Import everything a module exports (named exports only, not
    default by itself) as properties of one object.
*/

// ---- file: main5.js ----
// import * as math from "./mathUtils.js";
// alert(math.add(1, 2));   // 3
// alert(math.PI);          // 3.14159
// Bundlers can tree-shake individual named imports more easily than
// a namespace import, since the used members are explicit.

/*
6. Side-effect-only import
    Import a module purely to run its top-level code (e.g. it patches
    a global, registers something, injects CSS) without pulling any
    bindings out of it.
*/

// ---- file: init.js ----
console.log("init module executed");
// no export needed at all

// ---- file: main6.js ----
// import "./init.js"; // just runs init.js once; nothing bound locally

/*
7. Re-exports ("export ... from")
    A module can forward another module's exports without importing
    them into its own local scope first. Common in "barrel" files
    (index.js) that aggregate a package's public API in one place.
*/

// ---- file: auth/loginForm.js ----
export default class LoginForm {}

// ---- file: auth/user.js ----
export class User {}
export function validate() {}

// ---- file: auth/index.js ---- (the "barrel")
export { default as LoginForm } from "./loginForm.js"; // re-export + rename default
export { User, validate } from "./user.js";             // re-export named as-is
export * from "./user.js";                              // re-export ALL named exports
// export * as userNs from "./user.js";                 // re-export as a namespace object
// NOTE: `export * from` never forwards a default export - re-export
// default explicitly (as shown on the LoginForm line) if you need it.

// ---- file: main7.js ----
// import { LoginForm, User, validate } from "./auth/index.js";

/*
8. CommonJS (Node.js's older module system: require / module.exports)
    Before ES modules, and still the default for plain .js files in
    Node without "type": "module", Node used CommonJS. Every file is
    wrapped in a function receiving (exports, require, module,
    __filename, __dirname). It has no live bindings (values are
    copied at require-time), require() is synchronous, and there's no
    tree-shaking.
*/

// ---- file: mathUtilsCJS.js ----
function addCJS(a, b) {
    return a + b;
}
const PI_CJS = 3.14159;

module.exports = { addCJS, PI_CJS }; // replace the whole exports object
// exports.addCJS = addCJS;          // ...or attach properties one by one
// exports.PI_CJS = PI_CJS;          // (don't mix `exports.x =` with
//                                      reassigning `module.exports = {}` -
//                                      the reassignment breaks the `exports`
//                                      shortcut's link to module.exports)
// module.exports = addCJS;          // a "single function" style default export

// ---- file: main9.js (CommonJS) ----
// const mathCJS = require("./mathUtilsCJS.js");
// alert(mathCJS.addCJS(2, 3));
//
// const { addCJS, PI_CJS } = require("./mathUtilsCJS.js"); // destructure on require
// const addOnly = require("./mathUtilsCJS.js").addCJS;

/*
9. Mixing ESM and CommonJS
    - .mjs is always an ES module; .cjs is always CommonJS, regardless
      of "type" in package.json.
    - plain .js follows package.json's "type" ("module" -> ESM,
      "commonjs" or missing -> CommonJS).
    - an ESM file can `import` a CommonJS file: Node wraps its
      `module.exports` as the default export (and tries to expose
      named properties too, on a best-effort basis via static analysis).
    - a CommonJS file CANNOT `require()` an ES module - it must use
      the async `await import(...)` instead, since require is sync
      and ESM loading is not.
*/

// ---- file: main10.mjs (ESM importing CommonJS) ----
// import mathCJS from "./mathUtilsCJS.js"; // whole module.exports as default
// alert(mathCJS.addCJS(2, 3));
