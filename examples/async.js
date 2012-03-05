var it = require("../index"),
    comb = require("comb"),
    assert = require("assert");

var Person = function (name, age) {
    this.name = name;
    this.age = age;

    this.getOlder = function (years, cb) {
        if (years > 0) {
            setTimeout(function () {
                this.age = this.age + years;
                cb.call(this, null, this);
            }.bind(this), years * 500);
        } else {
            cb.call(this, null, this);
        }
    };
};

//it.reporter = "dotmatrix";
it.describe("Person", function (it) {

    it.should("set set name", function () {
        var person = new Person("bob", 1);
        assert.equal(person.name, "bob");
    });

    it.should("set set age", function () {
        var person = new Person("bob", 1);
        assert.equal(person.age, 1);
    });

    it.describe("#getOlder", function (it) {
        //Call with next
        it.should("accept positive numbers", function (next) {
            var person = new Person("bob", 1);
            person.getOlder(2, function (err, person) {
                assert.equal(person.age, 3);
                next();
            });
        });

        //return promise
        it.should("not apply negative numbers", function (next) {
            var ret = new comb.Promise();
            var person = new Person("bob", 1);
            person.getOlder(-2, function (err, person) {
                assert.equal(person.age, 1);
                ret.callback();
            });
            return ret;
        });
    });

    it.run();
});
