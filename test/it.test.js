"use strict";
var it = require("../index"), assert = require("assert"), comb = require("comb");

it.describe("it",function (it) {

    it.should("not be null", function () {
        assert.isNotNull(it);
    });

    it.should("describe", function () {
        assert.equal(it.topic, "it");
    });

    it.should("have methods", function () {
        assert.isFunction(it.beforeAll);
        assert.isFunction(it.beforeEach);
        assert.isFunction(it.afterEach);
        assert.isFunction(it.afterAll);
        assert.isFunction(it.should);
        assert.isFunction(it.describe);
        assert.isFunction(it.context);
    });

    it.describe("assert extensions", function (it) {

        it.should('add methods', function () {
            assert.isFunction(assert.isFunction);
            assert.isFunction(assert.isArray);
            assert.isFunction(assert.isDate);
            assert.isFunction(assert.isBoolean);
            assert.isFunction(assert.isString);
            assert.isFunction(assert.isUndefined);
            assert.isFunction(assert.isUndefinedOrNull);
            assert.isFunction(assert.isPromiseLike);
            assert.isFunction(assert.isRegExp);
            assert.isFunction(assert.isTrue);
            assert.isFunction(assert.isFalse);
            assert.isFunction(assert.truthy);
            assert.isFunction(assert.falsy);
            assert.isFunction(assert.isNull);
            assert.isFunction(assert.isNotNull);
            assert.isFunction(assert.instanceOf);
            assert.isFunction(assert.lengthOf);
        });

        it.should('test properly', function () {
            assert.doesNotThrow(function () {
                assert.isFunction(function () {
                });
            });
            assert.doesNotThrow(function () {
                assert.isArray([]);
            });
            assert.doesNotThrow(function () {
                assert.isDate(new Date());
            });

            assert.doesNotThrow(function () {
                assert.isBoolean(true);
                assert.isBoolean(false);
            });

            assert.doesNotThrow(function () {
                assert.isString("");
            });

            assert.doesNotThrow(function () {
                assert.isUndefined(undefined);
            });

            assert.doesNotThrow(function () {
                assert.isUndefinedOrNull(null);
                assert.isUndefinedOrNull(undefined);

            });

            assert.doesNotThrow(function () {
                assert.isPromiseLike(new comb.Promise());
                assert.isPromiseLike({then:function () {
                }, addCallback:function () {
                }, addErrback:function () {
                }});
            });

            assert.doesNotThrow(function () {
                assert.isRegExp(/hello/i);
            });

            assert.doesNotThrow(function () {
                assert.isTrue(true);
            });

            assert.doesNotThrow(function () {
                assert.isFalse(false);
            });
            assert.doesNotThrow(function () {
                assert.isNull(null);
            });

            assert.doesNotThrow(function () {
                assert.isNotNull(true);
            });

            assert.doesNotThrow(function () {
                assert.instanceOf(new String(), String);
            });

            assert.doesNotThrow(function () {
                assert.lengthOf([1, 2, 3], 3);
            });

            assert.throws(function () {
                assert.isFunction(true);
            });
            assert.throws(function () {
                assert.isArray(true);
            });
            assert.throws(function () {
                assert.isDate("hi");
            });

            assert.throws(function () {
                assert.isBoolean("");
            });

            assert.throws(function () {
                assert.isString(new Date());
            });

            assert.throws(function () {
                assert.isUndefined(null);
            });

            assert.throws(function () {
                assert.isUndefinedOrNull("hi");

            });

            assert.throws(function () {
                assert.isPromiseLike("");
            });

            assert.throws(function () {
                assert.isRegExp("/hello/");
            });

            assert.throws(function () {
                assert.isTrue(false);
            });

            assert.throws(function () {
                assert.isFalse(true);
            });

            assert.throws(function () {
                assert.truthy('');
            });

            assert.throws(function () {
                assert.falsy('hi');
            });

            assert.throws(function () {
                assert.isNull(undefined);
            });

            assert.throws(function () {
                assert.isNotNull(null);
            });

            assert.throws(function () {
                assert.instanceOf(new String(), Boolean);
            });

            assert.throws(function () {
                assert.lengthOf([1, 2, 3], 1);
            });
        });
    });

    it.describe("#beforeAll", function (it) {

        var called = 0;
        it.beforeAll(function () {
            called++;
        });

        it.should("call beforeAll", function () {
            assert.equal(called, 1);
        });
        it.should("call not call beforeAll more than once", function () {
            assert.equal(called, 1);
        });
    });

    it.describe("#beforeAll multi", function (it) {

        var called = 0, called2 = 0;
        it.beforeAll(function () {
            called++;
        });

        it.beforeAll(function () {
            called2++;
        });

        it.should("call beforeAll", function () {
            assert.equal(called, 1);
            assert.equal(called2, 1);
        });
        it.should("call not call beforeAll more than once", function () {
            assert.equal(called, 1);
            assert.equal(called2, 1);
        });
    });

    it.describe("#beforeEach", function (it) {

        var called = 0;
        it.beforeEach(function () {
            called++;
        });

        it.should("call beforeEach", function () {
            assert.equal(called, 1);
        });
        it.should("call beforeEach again", function () {
            assert.equal(called, 2);
        });
    });

    it.describe("#beforeEach multi", function (it) {

        var called = 0, called2 = 0;
        it.beforeEach(function () {
            called++;
        });

        it.beforeEach(function () {
            called2++;
        });

        it.should("call beforeEach", function () {
            assert.equal(called, 1);
            assert.equal(called2, 1);
        });
        it.should("call beforeEach again", function () {
            assert.equal(called, 2);
            assert.equal(called2, 2);
        });
    });

    it.describe("#afterEach", function (it) {

        var called = 0;
        it.afterEach(function () {
            called++;
        });

        it.should("call not have called afterEach", function () {
            assert.equal(called, 0);
        });
        it.should("have called afterEach", function () {
            assert.equal(called, 1);
        });

        it.should("call afterEach again", function () {
            assert.equal(called, 2);
        });
    });

    it.describe("#afterEach multi", function (it) {

        var called = 0, called2 = 0;
        it.afterEach(function () {
            called++;
        });

        it.afterEach(function () {
            called2++;
        });

        it.should("call not have called afterEach", function () {
            assert.equal(called, 0);
            assert.equal(called2, 0);
        });
        it.should("have called afterEach", function () {
            assert.equal(called, 1);
            assert.equal(called2, 1);
        });

        it.should("call afterEach again", function () {
            assert.equal(called, 2);
            assert.equal(called2, 2);
        });
    });

    it.describe("#afterAll", function (it) {

        var called = 0;
        it.afterAll(function () {
            called++;
        });

        it.afterAll(function () {
            assert.equal(called, 1);
        });

        it.should("not call afterAll", function () {
            assert.equal(called, 0);
        });
        it.should("still not call afterAll", function () {
            assert.equal(called, 0);
        });

    });


    it.describe("#should", function (it) {

        it.describe("provided a callback with an arity 0 of zero", function (it) {

            it.should("callback immediatly", function () {
            });
            it.should("be called", function () {
                //just to ensure it was called
                assert.isTrue(true);
            });
        });

        it.describe("provided a callback that returns a promise", function (it) {

            var success = 0, error = 0, title = 0, summary = 0;
            var mockFormatter = {
                printSuccess:function () {
                    orig.printSuccess.apply(orig, arguments);
                    success++;
                },
                printError:function () {
                    orig.printSuccess.apply(orig, arguments);
                    error++;
                    return false;
                },
                printTitle:function () {
                    orig.printTitle.apply(orig, arguments);
                    title++;
                },
                printSummary:function () {
                    orig.printSummary.apply(orig, arguments);
                    summary++;
                }
            };
            var orig = it.reporter;
            it.beforeAll(function () {
                it.reporter = mockFormatter;
            });

            it.afterAll(function () {
                it.reporter = orig;
            });
            it.should("callback when the promise is resolved", function () {
                var ret = new comb.Promise();
                setTimeout(comb.hitch(ret, "callback"), 100);
                return ret;
            });

            it.should("increment call", function () {
                assert.equal(success, 1);
            });

            it.should("callback when the promise is errored", function () {
                var ret = new comb.Promise();
                setTimeout(comb.hitch(ret, "errback"), 100);
                return ret;
            });

            it.should("increment call printError", function () {
                assert.equal(error, 1);
            });
        });
    });

    it.describe("#run", function () {
        it.run().then(function (summary) {
            assert.isObject(summary);
            var str = [];
            var expected = [
                [
                    "not be null",
                    {
                        "status":"passed"
                    }
                ],
                [
                    "describe",
                    {
                        "status":"passed"
                    }
                ],
                [
                    "have methods",
                    {
                        "status":"passed"
                    }
                ],
                [
                    "assert extensions",
                    [
                        "add methods",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "test properly",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#beforeAll",
                    [
                        "call beforeAll",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "call not call beforeAll more than once",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#beforeAll multi",
                    [
                        "call beforeAll",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "call not call beforeAll more than once",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#beforeEach",
                    [
                        "call beforeEach",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "call beforeEach again",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#beforeEach multi",
                    [
                        "call beforeEach",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "call beforeEach again",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#afterEach",
                    [
                        "call not have called afterEach",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "have called afterEach",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "call afterEach again",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#afterEach multi",
                    [
                        "call not have called afterEach",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "have called afterEach",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "call afterEach again",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#afterAll",
                    [
                        "not call afterAll",
                        {
                            "status":"passed"
                        }
                    ],
                    [
                        "still not call afterAll",
                        {
                            "status":"passed"
                        }
                    ]
                ],
                [
                    "#should",
                    [
                        "provided a callback with an arity 0 of zero",
                        [
                            "callback immediatly",
                            {
                                "status":"passed"
                            }
                        ],
                        [
                            "be called",
                            {
                                "status":"passed"
                            }
                        ]
                    ],
                    [
                        "provided a callback that returns a promise",
                        [
                            "callback when the promise is resolved",
                            {
                                "status":"passed"
                            }
                        ],
                        [
                            "increment call",
                            {
                                "status":"passed"
                            }
                        ],
                        [
                            "callback when the promise is errored",
                            {
                                "status":"passed"
                            }
                        ],
                        [
                            "increment call printError",
                            {
                                "status":"passed"
                            }
                        ]
                    ]
                ]
            ];
            (function gather(str, a) {
                var summaries = a.summaries;
                Object.keys(summaries).forEach(function (k) {
                    if (summaries[k].summaries) {
                        var newStrs = [k];
                        gather(newStrs, summaries[k]);
                        str.push(newStrs);
                    } else {
                        var sum = summaries[k];
                        str.push([k, {status:sum.status}]);
                    }
                });
            })(str, summary.it);
            assert.deepEqual(str, expected);
            assert.isNumber(summary.it.duration);


        });
    });

}).as(module);
