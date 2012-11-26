"use strict";

var utils = require("../../utils"),
    splitFilter = utils.splitFilter,
    setUpCb = utils.setUpCb,
    comb = require("comb"),
    EventEmitter = require("./emitter"),
    compact = comb.array.compact,
    flatten = comb.array.flatten,
    asyncArray = comb.async.array,
    isEmpty = comb.isEmpty,
    isString = comb.isString,
    merge = comb.merge,
    isFunction = comb.isFunction,
    Promise = comb.Promise,
    Action = require("./action"),
    formatters = require("../../formatters");

EventEmitter.extend({
    instance: {

        sub: false,

        parent: null,

        level: 0,

        stopOnError: false,
        ignoreProcessError: false,

        constructor: function constructor(description, options) {
            this._super(arguments);
            this.Action = this._static.Action;
            this.description = description;
            this.__shoulds = [];
            this.__ba = [];
            this.__be = [];
            this.__aa = [];
            this.__ae = [];
            merge(this, options);
            if (!this.sub && !this.filtered) {
                this._static.tests[description] = this;
            }
        },

        getAction: function getAction(name) {
            var matched = this.__shoulds.filter(function (should) {
                if (should instanceof this.Action) {
                    return should.description === name;
                } else {
                    return false;
                }
            }, this);
            return matched.length !== 0 ? matched[0] : null;
        },

        as: function (mod) {
            mod.exports = this;
            return this;
        },

        beforeAll: function (cb) {
            this.__ba.push(comb.partial(setUpCb(cb), this));
            return this;
        },

        beforeEach: function (cb) {
            this.__be.push(comb.partial(setUpCb(cb), this));
            return this;
        },

        afterAll: function (cb) {
            this.__aa.push(comb.partial(setUpCb(cb), this));
            return this;
        },

        afterEach: function (cb) {
            this.__ae.push(comb.partial(setUpCb(cb), this));
            return this;
        },


        context: function (cb) {
            var cloned = this._static.clone(this, null, {sub: true});
            this.emit("addTest", cloned);
            if (cb) {
                cb(cloned);
            }
            this.__shoulds.push(cloned);
            return cloned;
        },


        _addTest: function (description, cb) {
            var cloned = this._static.clone(this, description, {sub: true, level: this.level + 1, parent: this}, cb);
            this.emit("addTest", cloned);
            if (cb) {
                cb(cloned);
            }
            this.__shoulds.push(cloned);
            return cloned;
        },


        _addAction: function (description, cb) {
            var action = new this.Action(description, this, this.level + 1, cb);
            this.emit("addAction", action);
            this.__shoulds.push(action);
            return this;
        },


        __runAction: function (action) {
            var level = this.level + 1, stopOnError = this.stopOnError;
            return comb.serial(this.__be)
                .chain(function () {
                var ret = new Promise();
                action.run(this).chain(
                    function actionSuccess() {
                        var summary = action.summary;
                        if (summary.status === "pending") {
                            ret.callback();
                        } else if (summary.status === "passed") {
                            ret.callback();
                        } else {
                            ret[stopOnError ? "errback" : "callback"]();
                        }
                    }.bind(this), function actionError(err) {
                        this.emit("error", err);
                    }.bind(this));
                return ret;
            }.bind(this)).chain(function () {
                return comb.serial(this.__ae);
            }.bind(this));
        },

        run: function (filter) {
            var ret;
            if (filter) {
                ret = this.filter(filter).run();
            } else {
                ret = this.__runPromise;
                if (!ret) {
                    this.emit("run", this);
                    ret = this.__runPromise = comb.serial(this.__ba).chain(function () {
                        return asyncArray(this.__shoulds).forEach(function (action) {
                            var ret;
                            if (action instanceof Action) {
                                ret = this.__runAction(action);
                            } else {
                                ret = action.run();
                            }
                            return ret;
                        }, this, 1);
                    }.bind(this), function (err) {
                        this.emit("error", err);
                    }.bind(this)).chain(function () {
                        return comb.serial(this.__aa);
                    }.bind(this), function (err) {
                        this.emit("error", err);
                    }.bind(this)).chainBoth(function () {
                        this.emit("done");
                    }.bind(this));
                }
            }
            return ret;

        },

        matches: function matches(filter) {
            return this.description === filter;
        },

        filter: function filter(f) {
            var ret = this, i, l;
            if (f.length) {
                f = isString(f) ? splitFilter(f) : [f];
                if (f) {
                    ret = this._static.clone(this, this.description, {
                        sub: this.sub,
                        "filtered": this.sub ? false : true,
                        __ba: this.__ba.slice(0),
                        __aa: this.__ba.slice(0),
                        "__shoulds": compact(this.__shoulds.map(function (action) {
                            var rest, include = false, ret = null;
                            for (i = 0, l = f.length; i < l && !include; i++) {
                                if (action.description === f[i][0]) {
                                    include = true;
                                    rest = f[i].slice(1);
                                }
                            }
                            if (include) {
                                if (action instanceof this.Action) {
                                    ret = action;
                                } else {
                                    ret = action.filter(rest);
                                }
                            }
                            return ret;
                        }.bind(this)))
                    });
                }
            }
            return ret;
        },

        getters: {
            summary: function () {
                var duration = 0, ret = {description: this.description, summaries: {}}, summaries = ret.summaries;
                this.__shoulds.map(function (action) {
                    var actionSum = action.summary;
                    if (action instanceof Action || action.description) {
                        summaries[action.description] = actionSum;
                        duration += actionSum.duration;
                    } else {
                        merge(summaries, actionSum.summaries);
                        duration += actionSum.duration;
                    }
                });
                ret.duration = duration;
                return ret;
            }
        }
    },

    "static": {

        tests: {},

        init: function init() {
            this.reporter = formatters.getReporter("spec");
            this.Action = Action;
        },

        clone: function (behavior, description, options, cb) {
            return new this(description, merge({
                level: behavior.level,
                __be: behavior.__be.slice(),
                __ae: behavior.__ae.slice(),
                reporter: behavior.reporter,
                stopOnError: behavior.stopOnError,
                ignoreProcessError: behavior.ignoreProcessError
            }, options), cb);
        },


        __filter: function (filter) {
            var ret = {}, tests = this.tests, names = filter.map(function (f) {
                return f[0];
            });
            names.forEach(function (t, index) {
                var test = tests[t];
                if (test) {
                    var filtered = tests[t].filter(filter[index].slice(1));
                    if (ret[t]) {
                        ret[t].__shoulds = ret[t].__shoulds.concat(filtered.__shoulds);
                    } else {
                        ret[t] = filtered;
                    }

                }
            });
            return ret;
        },

        run: function run(filter) {
            var summaries = {}, tests = this.tests;
            filter = splitFilter(filter);
            if (filter.length) {
                tests = this.__filter(filter);
            }
            if (!isEmpty(tests)) {
                return comb.serial(Object.keys(tests).map(function (k) {
                    return function () {
                        return tests[k].run().chainBoth(function (summary) {
                            summaries[k] = summary;
                        });
                    };
                })).chain(function () {
                    if (!filter || !filter.length) {
                        this.printSummary(summaries);
                    }
                    return summaries;
                }.bind(this));
            } else {
                console.warn("No Tests found");
                return new comb.Promise().callback();
            }
        },

        printSummary: function printSummary() {
            var formatter = this.reporter, tests = this.tests;
            if (!isEmpty(tests)) {
                formatter.printTitle({description: "Summary"});
                var summary = {};
                var keys = Object.keys(tests), length = 0;
                Object.keys(tests).forEach(function (k) {
                    var testSummary = tests[k].summary;
                    if (testSummary) {
                        summary[k] = testSummary;
                        length += 1;
                    }
                });
                if (length < keys.length) {
                    formatter.printError(new Error("Async Error"));
                }
                return formatter.printSummary({summary: summary});
            }
        }
    }
}).as(module);