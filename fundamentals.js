/*
1. Hello, world!
    The most basic JS program. In a browser, alert() pops up a dialog.
    In Node, console.log() prints to the terminal.
*/

alert("Hello, world!");
console.log("Hello, world!");

/*
2. Code structure
    Statements are separated by semicolons (auto-inserted if omitted,
    but relying on that can cause bugs). Comments can be single-line
    (starting with //) or multiline blocks like this one.
*/

alert("Statement one");
alert("Statement two"); // a comment after a statement

alert("Still runs even without a semicolon before this line")

/*
3. Use Strict
    Allows us to force the JS engine to use the older JavaScript
    syntax and rules upon modern syntax and modifications
*/

"use strict"
x = 5; // throws in strict mode: x is not defined
alert(x);

/*
4. Variables
    Allows us to store content and values
*/

var x = 10;
let y = 100;
const c = 1000;
const COLOR_ORANGE = "#FF7F00";

let a, b, ready; // multiple declarations
a = b = ready = true;

/*
5. Datatypes
    number
    bigint
    string
    boolean
    null
    undefined
    object
    symbol
*/
let int = 50;
let bigint = 500000000000000009;
let string = "String";
let boolean = true;
let null_var  = null;
let undefined_var = undefined;
let obj = Math;
let sym = Symbol("id");

alert(typeof int);       // "number"
alert(typeof string);    // "string"
alert(typeof null_var);  // "object" (a known JS quirk)
alert(typeof undefined_var); // "undefined"

/*
6. Interaction: alert, prompt, confirm
    alert shows a message, prompt asks for input, confirm asks yes/no
*/

alert("This is a message");

let name = prompt("What is your name?", "Guest");
alert(`Hello, ${name}!`);

let isBoss = confirm("Are you the boss?");
alert(isBoss); // true or false

/*
7. Type Conversions
    String, Number, Boolean conversions happen explicitly or implicitly
*/

let numToStr = String(123);      // "123"
let strToNum = Number("123");    // 123
let emptyToNum = Number("");     // 0
let invalidToNum = Number("abc"); // NaN

alert(Boolean(0));        // false
alert(Boolean(""));       // false
alert(Boolean("hello"));  // true
alert(Boolean(null));     // false

alert("6" + 1);  // "61" (string concatenation)
alert("6" - 1);  // 5 (numeric conversion)

/*
8. Basic operators, maths
    + - * / % ** and operator precedence
*/

alert(5 + 2);   // 7
alert(5 - 2);   // 3
alert(5 * 2);   // 10
alert(5 / 2);   // 2.5
alert(5 % 2);   // 1 (remainder)
alert(5 ** 2);  // 25 (exponent)

let counter = 1;
counter++;
counter--;
alert(counter); // 1

alert(2 + 2 * 2); // 6, multiplication has higher precedence

/*
9. Comparisons
    == does type conversion, === checks value and type
*/

alert(2 > 1);     // true
alert(2 == "2");  // true (loose equality)
alert(2 === "2"); // false (strict equality)
alert(null == undefined); // true
alert(null === undefined); // false

alert("apple" > "banana"); // false, dictionary/lexicographic comparison

/*
10. Conditional branching: if, '?'
*/

let age = 18;

if (age >= 18) {
    alert("Adult");
} else if (age >= 13) {
    alert("Teenager");
} else {
    alert("Child");
}

let accessAllowed = (age >= 18) ? "yes" : "no";
alert(accessAllowed);

/*
11. Logical operators
    && || ! and short-circuit evaluation
*/

alert(true && false); // false
alert(true || false); // true
alert(!true);         // false

let user = null;
let guest = user || "Anonymous"; // short-circuit: falls back when falsy
alert(guest);

/*
12. Nullish coalescing operator '??'
    Returns the right side only if the left is null or undefined
    (unlike ||, which reacts to any falsy value)
*/

let volume = 0;
alert(volume || 50); // 50, because 0 is falsy
alert(volume ?? 50); // 0, because 0 is not null/undefined

/*
13. Loops: while and for
*/

let i = 0;
while (i < 3) {
    alert(`while: ${i}`);
    i++;
}

for (let j = 0; j < 3; j++) {
    alert(`for: ${j}`);
}

/*
14. The "switch" statement
*/

let fruit = "apple";

switch (fruit) {
    case "banana":
        alert("Banana");
        break;
    case "apple":
        alert("Apple");
        break;
    default:
        alert("Unknown fruit");
}

/*
15. Functions
*/

function showMessage(message = "Hello") {
    alert(message);
}

showMessage("Function declaration");
showMessage();

/*
16. Function expressions
    A function created inside an expression, assigned to a variable
*/

let sayHi = function() {
    alert("Function expression");
};

sayHi();

/*
17. Arrow functions, the basics
*/

let sum = (a, b) => a + b;
alert(sum(2, 3)); // 5

let square = n => n * n;
alert(square(4)); // 16

let greet = () => alert("Arrow function, no args");
greet();

/*
18. JavaScript specials
    A few quirks worth remembering: hoisting, automatic semicolon
    insertion, and that functions are values too.
*/

hoisted(); // works even though called before the declaration below
function hoisted() {
    alert("Function declarations are hoisted");
}

let add = function(a, b) {
    return a + b;
};
alert(typeof add); // "function", functions are just objects
