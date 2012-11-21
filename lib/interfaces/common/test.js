"use strict";

var utils = require("../../utils"),
    setUpCb = utils.setUpCb,
    comb = require("comb"),
    asyncArray = comb.async.array,
    isEmpty = comb.isEmpty,
    merge = comb.merge,
    isFunction = comb.isFunction,
    Promise = comb.Promise,
    Action = require("./action"),
    formatters = require("../../formatters");

comb.define({
    instance: {

        sub: false,

        level: 0,

        stopOnError: false,
        ignoreProcessError: false,

        constructor: function constructor(description, options, cb) {
            this.Action = this._static.Action;
            this.reporter = this._static.reporter;
            this.description = description;
            this.__shoulds = [];
            this.__ba = [];
            this.__be = [];
            this.__aa = [];
            this.__ae = [];
            this.__summaries = [];
            merge(this, options);
            if (isFunction(cb)) {
                cb(this);
            }
            if (!this.sub) {
                this._static.tests[description] = this;
            }
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
            var cloned = this._static.clone(this, null, {sub: true}, cb);
            this.__shoulds.push(cloned);
            return cloned;
        },


        _addTest: function (description, cb) {
            var cloned = this._static.clone(this, description, {sub: true, level: this.level + 1}, cb);
            this.__shoulds.push(cloned);
            return cloned;
        },


        _addAction: function (description, cb) {
            var action = new this.Action(description, cb);
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
                            this.reporter.printPending(summary, level);
                            ret.callback();
                        } else {
                            this.reporter.printSuccess(summary, level);
                            ret.callback();
                        }
                    }.bind(this), function actionError(err) {
                        var summary = action.summary;
                        var noError = this.reporter.printError(summary, level, err);
                        if (noError === false) {
                            summary.status = 'passed';
                            ret.callback();
                        } else {
                            ret[err && stopOnError ? "errback" : "callback"]();
                        }
                    }.bind(this));
                return ret;
            }.bind(this)).chain(function () {
                return comb.serial(this.__ae);
            }.bind(this));
        },

        run: function () {
            var ret = this.__runPromise;
            if (!ret) {
                if (this.description) {
                    this.reporter.printTitle(this.description, this.level);
                }
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
                    this.reporter.printError(null, null, err);
                }.bind(this)).chain(function () {
                    return comb.serial(this.__aa);
                }.bind(this), function (err) {
                    this.reporter.printError(this.description, this.level + 1, err);
                }.bind(this)).chainBoth(function () {
                    var summary = this.summary;
                    if (!this.sub) {
                        this.reporter.printSummary(summary.summaries, summary.duration);
                    }
                    return summary;
                }.bind(this));
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
            this.reporter = formatters.spec;
            this.Action = Action;
        },

        clone: function (behavior, description, options, cb) {
            return new this(description, merge({
                level: behavior.level,
                __be: behavior.__be.slice(),
                __ae: behavior.__ae.slice(),
                stopOnError: behavior.stopOnError,
                ignoreProcessError: behavior.ignoreProcessError
            }, options), cb);
        },

        run: function run() {
            var summaries = {}, tests = this.tests;
            if (!isEmpty(tests)) {
                return comb.serial(Object.keys(tests).map(function (k) {
                    return function () {
                        return tests[k].run().chainBoth(function (summary) {
                            summaries[k] = summary;
                        });
                    };
                })).chain(function () {
                    //this.printSummary(summaries);
                    return summaries;
                }.bind(this));
            }
        },

        printSummary: function printSummary() {
            var formatter = this.reporter, tests = this.tests;
            if (!isEmpty(tests)) {
                formatter.printTitle("Summary");
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
                return formatter.printSummary(summary);
            }
        }
    }
}).as(module);