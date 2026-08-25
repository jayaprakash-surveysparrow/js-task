/*
1. Objects
    Objects store keyed collections of values. Properties can be
    added, read, updated, and removed after creation.
*/

let user = {
    name: "John",
    age: 30,
};

user.isAdmin = true;      // add a property
alert(user.name);         // read a property
delete user.age;          // remove a property

for (let key in user) {
    alert(`${key}: ${user[key]}`); // loop over properties
}

/*
2. Object references and copying
    Objects are stored and copied "by reference", unlike primitives
    which are copied "by value".
*/

let admin = user;   // copies the reference, not the object
admin.name = "Alice";
alert(user.name);   // "Alice", both variables point to the same object

let clone = Object.assign({}, user); // shallow copy into a new object
clone.name = "Bob";
alert(user.name);   // still "Alice", clone is independent

let deepClone = structuredClone(user); // deep copy, handles nested objects too

/*
3. Garbage collection
    JS uses "reachability": an object is kept in memory as long as
    something can reach it, directly or through a chain of references.
    Once unreachable, the garbage collector frees the memory.
*/

let temp = { data: "will be collected" };
temp = null; // the object above becomes unreachable and is eligible for GC

let obj1 = {};
let obj2 = { ref: obj1 };
obj1 = null; // still reachable through obj2.ref, so not collected yet
obj2 = null; // now nothing references the original object, it's collected

/*
4. Object methods, "this"
    A function stored as an object property is called a "method".
    Inside a method, "this" refers to the object before the dot.
*/

let person = {
    name: "Eve",
    sayHi() {
        alert(`Hi, I'm ${this.name}`);
    },
};

person.sayHi(); // "this" is "person" here

function sayBye() {
    alert(`Bye, ${this.name}`);
}
person.sayBye = sayBye;
person.sayBye(); // "this" depends on how the function is called

/*
5. Constructor, operator "new"
    Constructor functions (capitalized by convention) let us create
    many similar objects using "new".
*/

function User(name) {
    this.name = name;
    this.isAdmin = false;
}

let user1 = new User("Jack");
let user2 = new User("Jill");
alert(user1.name); // "Jack"
alert(user2.name); // "Jill"

/*
6. Optional chaining '?.'
    Safely reads a property or calls a method deep inside an object
    without throwing if an intermediate step is null/undefined.
*/

let userWithoutAddress = {};

alert(userWithoutAddress.address?.street); // undefined, no error
alert(userWithoutAddress.address?.street?.length); // still undefined

userWithoutAddress.greet?.(); // does nothing, greet doesn't exist

/*
7. Symbol type
    Symbols create unique identifiers, often used as "hidden"
    object keys that won't collide with other properties.
*/

let id1 = Symbol("id");
let id2 = Symbol("id");
alert(id1 == id2); // false, every symbol is unique even with the same description

let userWithSymbol = {
    name: "Tom",
    [id1]: "secret value",
};

alert(userWithSymbol[id1]); // accessed via the symbol, not enumerable in for..in

/*
8. Object to primitive conversion
    Objects are converted to primitives for math, string, or
    comparison operations, guided by Symbol.toPrimitive or
    toString/valueOf.
*/

let room = {
    number: 23,
    [Symbol.toPrimitive](hint) {
        if (hint == "number") return this.number;
        if (hint == "string") return `Room ${this.number}`;
        return `[room ${this.number}]`; // "default" hint
    },
};

alert(+room);        // 23 (numeric hint)
alert(`${room}`);    // "Room 23" (string hint)
alert(room + "");    // "[room 23]" (default hint)
