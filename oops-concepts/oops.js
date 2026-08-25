// ============================================================
// OOPS (Object-Oriented Programming) Concepts in JavaScript
// ============================================================

// ------------------------------------------------------------
// 1. CLASSES & OBJECTS
// ------------------------------------------------------------
// A class is a blueprint for creating objects.
class Vehicle {
  constructor(brand, speed) {
    this.brand = brand;
    this.speed = speed;
  }

  displayInfo() {
    console.log(`${this.brand} moves at ${this.speed} km/h`);
  }
}

const car = new Vehicle("Toyota", 180);
car.displayInfo(); // Toyota moves at 180 km/h

// ------------------------------------------------------------
// 2. ENCAPSULATION
// ------------------------------------------------------------
// Bundling data (properties) and methods that operate on that data
// into a single unit, while restricting direct access to some details.
// JS supports true private fields using the "#" prefix.
class BankAccount {
  #balance; // private field - not accessible outside the class

  constructor(owner, initialBalance) {
    this.owner = owner;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Deposit amount must be positive");
    this.#balance += amount;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
  }

  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount("Jay", 1000);
account.deposit(500);
console.log(account.getBalance()); // 1500
// console.log(account.#balance); // SyntaxError: private field not accessible

// ------------------------------------------------------------
// 3. GETTERS & SETTERS
// ------------------------------------------------------------
// Getters/setters let you control how a property is read or written,
// often used alongside encapsulation to validate or format data.
class Person {
  #age;

  constructor(name, age) {
    this.name = name;
    this.#age = age;
  }

  get age() {
    return this.#age;
  }

  set age(value) {
    if (value < 0) throw new Error("Age cannot be negative");
    this.#age = value;
  }
}

const person = new Person("Alice", 25);
console.log(person.age); // 25 (calls getter)
person.age = 30; // calls setter
console.log(person.age); // 30

// ------------------------------------------------------------
// 4. INHERITANCE
// ------------------------------------------------------------
// A class can inherit properties/methods from another class using "extends".
// "super" calls the parent class's constructor/methods.
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // calls Animal's constructor
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} (${this.breed}) barks.`);
  }
}

const dog = new Dog("Rex", "Labrador");
dog.speak(); // Rex (Labrador) barks.

// ------------------------------------------------------------
// 5. POLYMORPHISM
// ------------------------------------------------------------
// The ability of different classes to be treated through the same
// interface, with each providing its own implementation of a method.
class Cat extends Animal {
  speak() {
    console.log(`${this.name} meows.`);
  }
}

const animals = [new Dog("Buddy", "Beagle"), new Cat("Whiskers"), new Animal("Generic")];

animals.forEach((animal) => animal.speak());
// Buddy (Beagle) barks.
// Whiskers meows.
// Generic makes a sound.

// ------------------------------------------------------------
// 6. ABSTRACTION
// ------------------------------------------------------------
// Hiding complex implementation details and exposing only what's necessary.
// JS has no built-in "abstract class" keyword, but we can simulate one
// by throwing an error if the base class is instantiated directly,
// or if a required method isn't overridden.
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error("Cannot instantiate an abstract class 'Shape' directly");
    }
  }

  // Abstract method - must be implemented by subclasses
  area() {
    throw new Error("Method 'area()' must be implemented");
  }

  describe() {
    console.log(`Area of this shape is ${this.area()}`);
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return (Math.PI * this.radius ** 2).toFixed(2);
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

const shapes = [new Circle(5), new Rectangle(4, 6)];
shapes.forEach((shape) => shape.describe());
// Area of this shape is 78.54
// Area of this shape is 24

// new Shape(); // Error: Cannot instantiate an abstract class 'Shape' directly

// ------------------------------------------------------------
// 7. STATIC MEMBERS
// ------------------------------------------------------------
// "static" properties/methods belong to the class itself, not to instances.
class MathUtils {
  static PI = 3.14159;

  static square(n) {
    return n * n;
  }
}

console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.square(4)); // 16

// ------------------------------------------------------------
// 8. ACCESS MODIFIERS (JS conventions & real private fields)
// ------------------------------------------------------------
// - Public: default, accessible from anywhere (this.name)
// - Private: "#" prefix, accessible only within the class
// - Protected: no native keyword, but by convention prefixed with "_"
//   (still technically accessible from outside, just a naming hint)
class Employee {
  _department; // "protected" by convention
  #salary; // truly private

  constructor(name, department, salary) {
    this.name = name; // public
    this._department = department; // protected (convention only)
    this.#salary = salary; // private
  }

  #calculateBonus() {
    // private method
    return this.#salary * 0.1;
  }

  getAnnualCompensation() {
    return this.#salary + this.#calculateBonus();
  }
}

const emp = new Employee("Sam", "Engineering", 60000);
console.log(emp.getAnnualCompensation()); // 66000
console.log(emp._department); // Engineering (accessible, but discouraged)
// console.log(emp.#salary); // SyntaxError

// ------------------------------------------------------------
// 9. PROTOTYPES (how JS implements OOP under the hood)
// ------------------------------------------------------------
// Classes are syntactic sugar over JavaScript's prototype-based inheritance.
function OldStyleAnimal(name) {
  this.name = name;
}

OldStyleAnimal.prototype.speak = function () {
  console.log(`${this.name} makes a sound (prototype-based).`);
};

const oldDog = new OldStyleAnimal("Prototype Rex");
oldDog.speak(); // Prototype Rex makes a sound (prototype-based).

console.log(dog instanceof Animal); // true - Dog inherits from Animal
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true
