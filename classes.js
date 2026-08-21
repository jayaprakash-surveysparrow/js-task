/*
1. Class basic syntax
    Classes are a template for creating objects. The constructor()
    method runs automatically when we call `new`. Methods declared
    inside the class body are non-enumerable and shared on the prototype.
*/

class User {
    constructor(name) {
        this.name = name;
    }

    sayHi() {
        alert(this.name);
    }
}

let user = new User("John");
user.sayHi(); // "John"

// under the hood, User is a function; sayHi lives on User.prototype
alert(typeof User);              // "function"
alert(User.prototype.sayHi === user.sayHi); // true

/*
2. Class inheritance
    `extends` sets up the prototype chain so a class can reuse and
    override methods from a parent class. `super(...)` calls the
    parent constructor; `super.method(...)` calls the parent method.
*/

class Animal {
    constructor(name) {
        this.name = name;
        this.speed = 0;
    }

    run(speed) {
        this.speed = speed;
        alert(`${this.name} runs with speed ${this.speed}`);
    }

    stop() {
        this.speed = 0;
        alert(`${this.name} stands still`);
    }
}

class Rabbit extends Animal {
    hide() {
        alert(`${this.name} hides!`);
    }

    stop() {
        super.stop();  // call the parent method
        this.hide();   // then add extra behavior
    }
}

let rabbit = new Rabbit("White Rabbit");
rabbit.run(5);
rabbit.stop(); // "stands still" then "hides!"

// classes without their own constructor get a default one that
// just forwards arguments to the parent: constructor(...args) { super(...args); }

/*
3. Static properties and methods
    `static` puts a property or method on the class itself rather
    than on instances. Useful for factory methods or shared data
    that doesn't belong to any single object.
*/

class Article {
    static publisher = "MDN";

    static compare(articleA, articleB) {
        return articleA.date - articleB.date;
    }

    static createTodays() {
        return new Article("Today's digest", new Date());
    }

    constructor(title, date) {
        this.title = title;
        this.date = date;
    }
}

let articles = [
    new Article("HTML", new Date(2019, 1, 1)),
    new Article("CSS", new Date(2019, 0, 1)),
];

articles.sort(Article.compare);
alert(articles[0].title); // "CSS"
alert(Article.publisher); // "MDN"

let todays = Article.createTodays();

// static properties/methods are inherited too, accessible via the child class
class SpecialArticle extends Article {}
alert(SpecialArticle.publisher); // "MDN"

/*
4. Private and protected properties and methods
    Protected fields (by convention, prefixed with `_`) are not
    enforced by the language but signal "internal use only".
    Private fields (prefixed with `#`) are truly inaccessible from
    outside the class, even to subclasses.
*/

class CoffeeMachine {
    _waterAmount = 0; // protected: convention only, still accessible outside

    #power = 100; // private: only visible inside this class

    set waterAmount(value) {
        if (value < 0) value = 0;
        this._waterAmount = value;
    }

    get waterAmount() {
        return this._waterAmount;
    }

    #fixPower() {
        this.#power = 100;
    }

    reset() {
        this.#fixPower(); // private methods are callable from inside the class
    }
}

let machine = new CoffeeMachine();
machine.waterAmount = -10;
alert(machine.waterAmount); // 0, guarded by the setter

// machine.#power;      // SyntaxError: private field not accessible from outside
// machine.#fixPower();  // SyntaxError: private method not accessible from outside

/*
5. Extending built-in classes
    Built-ins like Array can be extended. Methods that return a
    new instance (like filter, map) use the subclass as the
    constructor, thanks to Symbol.species / the class's `constructor`.
*/

class PowerArray extends Array {
    isEmpty() {
        return this.length === 0;
    }
}

let powerArr = new PowerArray(1, 2, 5, 10, 50);
alert(powerArr.isEmpty()); // false

let filteredArr = powerArr.filter((item) => item >= 10);
alert(filteredArr.isEmpty());          // false
alert(filteredArr instanceof PowerArray); // true, filter returns a PowerArray

/*
6. Class checking: "instanceof"
    `obj instanceof Class` checks whether obj's prototype chain
    includes Class.prototype, walking up through inheritance.
*/

class Rabbit2 {}
let rabbit2 = new Rabbit2();

alert(rabbit2 instanceof Rabbit2); // true
alert(rabbit2 instanceof Object);  // true, Rabbit2 -> Object by default

function isArrayLike(obj) {
    return obj && typeof obj.length === "number";
}

alert([1, 2, 3] instanceof Array); // true

class Animal2 {
    // Symbol.toStringTag customizes what Object.prototype.toString.call returns
    get [Symbol.toStringTag]() {
        return "Animal";
    }
}

let animal2 = new Animal2();
alert(Object.prototype.toString.call(animal2)); // "[object Animal]"

/*
7. Mixins
    JS classes support only single inheritance. A mixin is a plain
    object (or class) whose methods get copied onto a prototype,
    letting one class "borrow" behavior from several sources.
*/

let sayHiMixin = {
    sayHi() {
        alert(`Hello ${this.name}`);
    },
    sayBye() {
        alert(`Bye ${this.name}`);
    },
};

class Person {
    constructor(name) {
        this.name = name;
    }
}

Object.assign(Person.prototype, sayHiMixin); // copy mixin methods in

let person = new Person("Dave");
person.sayHi(); // "Hello Dave"

// event mixin: adds .trigger(), .on(), .off() to any class
let eventMixin = {
    on(eventName, handler) {
        if (!this._eventHandlers) this._eventHandlers = {};
        if (!this._eventHandlers[eventName]) this._eventHandlers[eventName] = [];
        this._eventHandlers[eventName].push(handler);
    },

    off(eventName, handler) {
        let handlers = this._eventHandlers?.[eventName];
        if (!handlers) return;
        this._eventHandlers[eventName] = handlers.filter((h) => h !== handler);
    },

    trigger(eventName, ...args) {
        if (!this._eventHandlers?.[eventName]) return;
        this._eventHandlers[eventName].forEach((handler) => handler.apply(this, args));
    },
};

class Menu {
    choose(value) {
        this.trigger("select", value);
    }
}

Object.assign(Menu.prototype, eventMixin);

let menu = new Menu();
menu.on("select", (value) => alert(`Selected: ${value}`));
menu.choose("Coffee"); // "Selected: Coffee"
