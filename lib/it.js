/**
 *
 * @projectName it
 * @github https://github.com/doug-martin/it
 * @header
 * It
 * ===
 *
 * Overview
 * --------
 *
 * It is a BDD testing framework for node.js. The premise behind it is to be as lightweight as possible while making testing easy and fun to do.
 *
 * ## Installation
 *
 * `npm install it`
 *
 * To use the it executable
 *
 * `npm install -g it`
 *
 * ##Usage
 *
 * It contains the following functions to write and run tests.
 *
 * * describe - The name of object/context you are testing.
 * * should - the action that you are testing/should happen.
 * * beforeAll - an action that should happen before all tests in the current context.
 * * afterAll - an action that should happen after all tests in the current context.
 * * beforeEach - an action that should happen before each test in the current context.
 * * afterEach - an action that should happen before each test in the current context.
 *
 * ###Synchronous tests
 *
 * Writing synchronous tests in **It** is extremely simple. So lets start off with an example.
 *
 * Lets assume we have a Person Object
 *
 * ```
 * var Person = function (name, age) {
 *      this.name = name;
 *      this.age = age;
 *
 *      this.getOlder = function (years) {
 *          if (years > 0) {
 *              this.age = this.age + years;
 *          }
 *      };
 *
 *};
 * ```
 *
 * The first tests we could run on person could be testing the setting of name and age.
 *
 * ```javascript
 *
 * var it = require("../index"),
 * assert = require("assert");
 *
 * it.describe("Person", function (it) {
 *
 *      it.should("set set name", function () {
 *          var person = new Person("bob", 1);
 *          assert.equal(person.name, "bob");
 *      });
 *
 *      it.should("set set age", function () {
 *          var person = new Person("bob", 1);
 *          assert.equal(person.age, 1);
 *      });
 * }).as(module);
 *
 * ```
 * Notice we use the **it** passed back to the describe callback.
 *
 * Next we could test different scenarios of Person#getOlder
 *
 * ```
 * var it = require("../index"),
 * assert = require("assert");
 *
 * it.describe("Person", function (it) {
 *
 *      it.describe("#getOlder", function (it) {
 *
 *          it.should("accept positive numbers", function () {
 *              var person = new Person("bob", 1);
 *              person.getOlder(2);
 *              assert.equal(person.age, 3);
 *          });
 *
 *          it.should("not apply negative numbers", function () {
 *              var person = new Person("bob", 1);
 *              person.getOlder(-2);
 *              assert.equal(person.age, 1);
 *          });
 *      });
 * }).as(module);
 *
 * ```
 *
 * In this example we are describing the **getOlder** method and run different tests against it.
 * Notice the **it** passed back is used again.
 *
 * You may nest tests as deep as you like as long as you remember to use the proper **it**.
 *
 * ```
 * it.describe("#getOlder nested", function (it) {
 *
 *      it.describe("with positive numbers", function (it) {
 *
 *          it.should("work", function () {
 *              var person = new Person("bob", 1);
 *              person.getOlder(2);
 *              assert.equal(person.age, 3);
 *          });
 *
 *      });
 *
 *      it.describe("with negative numbers", function () {
 *
 *          //uh oh wrong it
 *          it.should("not work", function () {
 *              var person = new Person("bob", 1);
 *              person.getOlder(-2);
 *              assert.equal(person.age, 1);
 *          });
 *      });
 *
 * });
 * ```
 *
 * ###Asynchronous tests
 *
 * Writing asynchronous tests in **It** is just as easy as writing synchronous tests.
 *
 * Lets modify Person to make get older async
 *
 * ```
 * var Person = function (name, age) {
 *      this.name = name;
 *      this.age = age;
 *
 *      this.getOlder = function (years, cb) {
 *          setTimeout(function () {
 *              this.age = this.age + years;
 *              cb.call(this, null, this);
 *          }.bind(this), years * 500);
 *      };
 * };
 * ```
 *
 * Now that **getOlder** is async lets test it
 *
 * ```
 * it.describe("#getOlder", function (it) {
 *      //Call with next
 *      it.should("accept positive numbers", function (next) {
 *          var person = new Person("bob", 1);
 *          person.getOlder(2, function (err, person) {
 *              if(err) return next(err)
 *              assert.equal(person.age, 3);
 *              next();
 *           });
 *      });
 *
 *      //return promise
 *      it.should("not apply negative numbers", function () {
 *          var ret = new comb.Promise();
 *          var person = new Person("bob", 1);
 *          person.getOlder(-2, function (err, person) {
 *              assert.equal(person.age, 1);
 *              ret.callback();
 *          });
 *          return ret;
 *      });
 * });
 * ```
 *
 * So in the above example the first **should** invocation accepts a **next** argument which is a function that should
 * be called when the current test is done. If **next**'s function signature is **next(err, ...)**. So if next is invoked
 * with a first argument other than null or undefined then it is assumed that the test errored.
 *
 * The second **should** used a promise as a return value if you have used **comb** or any other framework that uses
 * **Promises** then this will feel pretty natural to you. The test will wait for the promise to resolve before
 * continuing any other tests.
 *
 * ###Running Tests
 *
 * To run tests there are two options the **it** executable
 *
 * Options
 *
 * * -d, --directory : The root directory of your tests
 * * -r, --reporter : The reporter to use when running the tests
 * * --cov-html : create coverage output in html, if an output path is included then the file will be written to that file otherwise it will defalt to `./coverage.html`
 * * --reporters : Display a list of reporters that are available
 * * -h, --help : Displays help.
 *
 * To run an entire suite
 *
 * `it -d ./mytests -r dotmatrix`
 *
 *
 * To run an individual test
 *
 * `it ./mytests/person.test.js`
 *
 *
 * You can alternatively run the test directly
 *
 * ```
 *
 * it.describe("A Person", function(it){
 *
 *      it.should("set set name", function () {
 *          var person = new Person("bob", 1);
 *          assert.equal(person.name, "bob");
 *      });
 *
 *      it.should("set set age", function () {
 *          var person = new Person("bob", 1);
 *          assert.equal(person.age, 1);
 *      });
 * }).run();
 *
 * ```
 *
 * ###Code Coverage
 * If you use [node-jscoverage](https://github.com/visionmedia/node-jscoverage) to generate coverage then by default `it`
 * will output a coverage report. You may also output coverage to an `HTML` file by passing in the `--cov-html` flag to the executable.
 * For example out put see [patio test coverage](http://c2fo.github.com/patio/coverage.html).
 *
 *
 *
 * ###Reporters
 *
 * **It** currently has two reporters built in
 * * spec
 * * dotmatrix
 *
 * For the above tests the output for spec should look as follows
 *
 * ```
 * Person
 *
 *      √ should set set name (0ms)
 *      √ should set set age (0ms)
 *      #getOlder
 *          √ should accept positive numbers (1002ms)
 *          √ should not apply negative numbers (0ms)
 * Finished in  1.002s
 * 4 examples, 0 errors
 *
 * ```
 *
 * With dot matrix
 *
 * ```
 * Person
 *
 * ....
 * Finished in  1.002s
 * 4 examples, 0 errors
 * ```
 *
 * ###Assert extensions
 *
 * The following methods are added to assert for convenience
 *
 * * lengthOf - assert the length of an array
 * * isTrue - assert that a value is true
 * * isFalse - assert that a value is false
 * * isRegExp - assert that a value is a Regular Expression
 * * isArray - assert that a value is an Array
 * * isHash - assert that a value is a plain object
 * * isObject - assert that a value is a object
 * * isNumber - assert that a value is a Number
 * * isDate - assert that a value is a Date
 * * isBoolean - assert that a value is a Boolean
 * * isString - assert that a value is a String
 * * isUndefined - assert that a value is undefined
 * * isUndefinedOrNull - assert that a value is undefined or null
 * * isPromiseLike - assert that a value is Promise like (contains the funtions "then", "addErrback", and "addCallback")
 * * isFunction - assert that a value is a function
 * * isNull - assert that a value is null
 * * isNotNull - assert that a value is not null
 * * instanceOf - assert that a value is an instanceof a particular object
 *
 * @footer
 * License
 * -------
 *
 * MIT <https://github.com/doug-martin/it/raw/master/LICENSE>
 *
 * Meta
 * ----
 *
 * Code: `git clone git://github.com/doug-martin/it.git`
 *
 */

"use strict";
var comb = require("comb"),
    string = comb.string,
    multiply = string.multiply,
    hitch = comb.hitch,
    formatters = require("./formatters");

require("./extension");

var its = {};
var summaries = {};

var formatter = formatters.spec;
exports.__defineSetter__("reporter", function (f) {
    if (comb.isString(f)) {
        formatter = formatters[f];
    } else if (comb.isObject(f)
        && comb.isFunction(f.printTitle)
        && comb.isFunction(f.printSuccess)
        && comb.isFunction(f.printError)
        && comb.isFunction(f.printSummary)) {
        formatter = f;
    } else {
        throw new Error("Invalid formatter " + f);
    }
});


function setUpCb(cb, it) {
    return function () {
        var ret = new comb.Promise();
        var funcRet = new comb.Promise();
        var isCallback = false;
        var ignoreProcessError = it.ignoreProcessError === true;
        var errorHandler = function (err) {
            if (!isCallback) {
                isCallback = true;
                ret.errback(err);
            }
        };
        if (ignoreProcessError === false) {
            process.on("uncaughtException", errorHandler);
        }
        try {
            var classicNext = function (err) {
                if (!isCallback) {
                    if (err) {
                        ret.errback(err);
                    } else {
                        ret.callback();
                    }
                    isCallback = true;
                }
            };
            var l = cb.length;
            var response = cb.bind(funcRet)(classicNext, funcRet);
            if (comb.isPromiseLike(response)) {
                response.then(funcRet);
            } else if (comb.isDefined(response) || l == 0) {
                if (!isCallback) {
                    ret.callback();
                    isCallback = true;
                }
            }
            funcRet.then(function () {
                if (!isCallback) {
                    ret.callback();
                    isCallback = true;
                }
            }, function (err) {
                if (!isCallback) {
                    ret.errback(err);
                    isCallback = true;
                }
            });

        } catch (err) {
            if (!isCallback) {
                ret.errback(err);
                isCallback = true;
            }
        }
        ret.both(function () {
            if (ignoreProcessError === false) {
                process.removeListener("uncaughtException", errorHandler);
            }
        });
        return ret;
    };
}

function describeIt(description, sub, level) {
    var it = {

        __reporter : formatter,

        __shoulds:[],

        __level:level || 0,

        __run:false,

        __ba:[],
        __be:[],
        __aa:[],
        __ae:[],
        stopOnError:false,
        ignoreProcessError:false,
        __summaries:{},
        topic:description,

        as:function (mod) {
            mod.exports = this;
            return this;
        },

        beforeAll:function (cb) {
            this.__ba.push(setUpCb(cb, this));
            return it;
        },

        beforeEach:function (cb) {
            this.__be.push(setUpCb(cb, this));
            return it;
        },

        afterAll:function (cb) {
            this.__aa.push(setUpCb(cb, this));
            return it;
        },

        afterEach:function (cb) {
            this.__ae.push(setUpCb(cb, this));
            return it;
        },

        describe:function (description, cb) {
            var it = describeIt(description, true, this.__level + 1);
            it.__be = this.__be.slice();
            it.__ae = this.__ae.slice();
            it.stopOnError = this.stopOnError;
            it.ignoreProcessError = this.ignoreProcessError;
            var summaries = this.__summaries;
            "function" === typeof cb && cb(it);
            this.__shoulds.push(hitch(this, function () {
                var ret = new comb.Promise();
                it.run().both(function (summary) {
                    summaries[description] = comb.merge(summaries[description] || {}, summary);
                    ret.callback();
                });
                return ret;
            }));
            return it;
        },

        context:function (cb) {
            var it = describeIt(null, true, this.__level);
            it.__be = this.__be.slice();
            it.__ae = this.__ae.slice();
            it.stopOnError = this.stopOnError;
            it.ignoreProcessError = this.ignoreProcessError;
            var summaries = this.__summaries;
            "function" === typeof cb && cb(it);
            this.__shoulds.push(hitch(this, function () {
                var ret = new comb.Promise();
                it.run().both(function (summary) {
                    comb.merge(summaries, summary.summaries);
                    ret.callback();
                });
                return ret;
            }));
            return it;
        },

        should:function (description, cb) {
            description = description || "Should " + this.__shoulds.length + 1;
            var summaries = this.__summaries,
                stopOnError = this.stopOnError;
            var level = this.__level + 1;
            this.__shoulds.push(hitch(this, function () {
                var ret = new comb.Promise();
                var start = new Date();
                if (typeof cb !== "function") {
                    // this test is pending (read: not defined yet)
                    var sum = {description:description,
                        start:start,
                        end:start,
                        duration:0, // test is pending
                        status:'pending'
                    };
                    summaries[description] = sum;
                    formatter.printPending(sum, level);
                    ret.callback();
                } else {
                    setUpCb(cb, this)().classic(function (err) {
                        var end = new Date();
                        var sum = {description:description, start:start, end:end, duration:end - start, status:err ? "failed" : "passed", error:err || false};
                        summaries[description] = sum;
                        if (err) {
                            var formatErr = formatter.printError(sum, level, err);
                            if (comb.isDefined(formatErr)) {
                                sum.status = formatErr === false ? "passed" : "failed";
                                sum.error = formatErr === false ? false : err;
                            }
                        } else {
                            formatter.printSuccess(sum, level);
                        }
                        ret[err && stopOnError ? "errback" : "callback"](summaries);
                    });
                }
                return ret;
            }));
            return it;
        },

        _processSummary:function (summary, promise, method) {
            var ret = {};
            if (!this.__level && description) {
                ret[description] = summary;
                this.__summaries = ret;
            } else {
                this.__summaries = ret = summary;
            }
            !sub && formatter.printSummary(summary.summaries, summary.duration);
            promise[method](ret);
        },

        run:function () {
            var ret = this.__runPromise;
            if (!ret) {
                if (sub) {
                    level = level || 1;
                } else {
                    level = null;
                }
                if (this.topic) {
                    formatter.printTitle(this.topic, level);
                }
                var funcs = this.__ba.slice();
                this.__shoulds.forEach(function (batch) {
                    funcs = funcs.concat(this.__be);
                    funcs.push(batch);
                    funcs = funcs.concat(this.__ae);
                }, this);
                funcs = funcs.concat(this.__aa);
                var start = new Date();
                var summaries = this.__summaries;
                ret = this.__runPromise = new comb.Promise();
                comb.serial(funcs).then(comb.hitch(this, function () {
                    var duration = new Date() - start;
                    this._processSummary({summaries:summaries, duration:duration}, ret, "callback");
                }), comb.hitch(this, function (err) {
                    this.__run = true;
                    var duration = new Date() - start;
                    formatter.printError("Top level error", 1, err);
                    this._processSummary({summaries:summaries, duration:duration}, ret, "errback");
                }));
            }
            return ret.promise();
        }
    };

    it.__defineSetter__("reporter", function (f) {
        if (comb.isString(f)) {
            formatter = formatters[f];
        } else if (comb.isObject(f)
            && comb.isFunction(f.printTitle)
            && comb.isFunction(f.printSuccess)
            && comb.isFunction(f.printError)
            && comb.isFunction(f.printSummary)) {
            this.__formatter = f;
        } else {
            throw new Error("Invalid formatter " + f);
        }
    });

    it.__defineGetter__("reporter", function (f) {
        return formatter;
    });
    sub !== true && (its[it.topic] = it);
    return it;
}


function printSummary(its) {
    formatter.printTitle("Summary");
    var summary = {};
    var keys = Object.keys(its), length;
    Object.keys(its).forEach(function (k) {
        var itSummary = its[k];
        if (itSummary) {
            summary[k] = itSummary;
            length++;
        }
    });
    //console.log(summary);
    if (length < keys.length) {
        formatter.printError(new Error("Async Error"));
    }
    formatter.printSummary(summary);
}

/**
 * Entry point for writing tests with it.
 * @namespace
 * @name it
 * @ignoreCode code
 */
comb.merge(exports, {
    /**@lends it*/

    /**
     * Creates a test with it.
     * @param {String} description the description of the test.
     * @param {Function} [cb] the function to invoke in the scope of the test. The it suite is passed as the first argument.
     * @return {it.Suite} the test.
     */
    describe:function description(description, cb) {
        var it = describeIt(description);
        "function" === typeof cb && cb(it);
        return it;
    },

    printSummary:printSummary,

    printCoverage:function printCoverate(type, coverage, out) {
        return formatters[type].showCoverage(coverage, out);
    },

    /**
     * Run all tests that are currently registered.
     * @return {comb.Promise} a promise that is resolved once all tests are done running.
     */
    run:function run() {
        var ret = comb.serial(Object.keys(its).map(function (k) {
            return function () {
                return its[k].run();
            };
        }));
        comb.listenForExit(function () {
            ret.then(function (results) {
                var its = {};
                results.forEach(function (summary) {
                    comb.merge(its, summary);
                });
                printSummary(its);
            });
        });
        return ret;
    }

})


