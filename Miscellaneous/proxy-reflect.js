// ============================================================
// PROXY AND REFLECT IN JAVASCRIPT
// ============================================================
// Proxy: wraps an object and lets you intercept/customize
// fundamental operations on it (get, set, delete, etc.) via
// "traps".
// Reflect: a built-in object with methods that mirror those
// same fundamental operations. It's used inside Proxy traps
// to forward the default behavior safely.

// ------------------------------------------------------------
// 1. Basic Proxy: intercepting get/set
// ------------------------------------------------------------
const person = {
  name: "Alice",
  age: 25,
};

const personProxy = new Proxy(person, {
  get(target, prop, receiver) {
    console.log(`Reading property "${prop}"`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting property "${prop}" to ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },
});

console.log(personProxy.name); // logs "Reading property..." then "Alice"
personProxy.age = 30; // logs "Setting property..."
console.log(person.age); // 30 (underlying object is updated)

// ------------------------------------------------------------
// 2. Why use Reflect instead of doing it manually?
// ------------------------------------------------------------
// Without Reflect, you'd write: target[prop] = value; return true;
// Reflect.set/get correctly handles edge cases like inherited
// properties, getters/setters, and the `receiver` (the object
// `this` should point to), which matters for prototype chains.

// ------------------------------------------------------------
// 3. Validation trap: enforce rules on writes
// ------------------------------------------------------------
const user = { name: "Bob", age: 40 };

const validatedUser = new Proxy(user, {
  set(target, prop, value) {
    if (prop === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("Age must be a non-negative number");
    }
    return Reflect.set(target, prop, value);
  },
});

validatedUser.age = 41; // OK
try {
  validatedUser.age = "old"; // throws TypeError
} catch (err) {
  console.log(err.message); // "Age must be a non-negative number"
}

// ------------------------------------------------------------
// 4. has trap: customize the `in` operator
// ------------------------------------------------------------
const hiddenProps = new Proxy(
  { _secret: 123, visible: true },
  {
    has(target, prop) {
      if (typeof prop === "string" && prop.startsWith("_")) {
        return false; // hide private-looking properties
      }
      return Reflect.has(target, prop);
    },
  }
);

console.log("visible" in hiddenProps); // true
console.log("_secret" in hiddenProps); // false (hidden by the trap)

// ------------------------------------------------------------
// 5. deleteProperty trap: protect certain keys from deletion
// ------------------------------------------------------------
const protectedObj = new Proxy(
  { id: 1, name: "Item" },
  {
    deleteProperty(target, prop) {
      if (prop === "id") {
        console.log("Cannot delete protected property: id");
        return false;
      }
      return Reflect.deleteProperty(target, prop);
    },
  }
);

delete protectedObj.id; // logs message, id remains
delete protectedObj.name; // deleted normally
console.log(protectedObj); // { id: 1 }

// ------------------------------------------------------------
// 6. apply trap: intercept function calls
// ------------------------------------------------------------
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const loggedGreet = new Proxy(greet, {
  apply(target, thisArg, args) {
    console.log(`Calling greet with args: ${args}`);
    return Reflect.apply(target, thisArg, args);
  },
});

console.log(loggedGreet("Hello", "World")); // logs call, then "Hello, World!"

module.exports = { personProxy, validatedUser, hiddenProps, protectedObj, loggedGreet };
