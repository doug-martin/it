"use strict";

var utils = require("../../utils"),
    splitFilter = utils.splitFilter,
    setUpCb = utils.setUpCb,
    _ = require("../../extended"),
    EventEmitter = require("./emitter"),
    isEmpty = _.isEmpty,
    isString = _.isString,
    merge = _.merge,
    Promise = _.Promise,
    Action = require("./action");

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
            var matched = _.filter(this.__shoulds, function (should) {
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
            this.__ba.push(_.partial(setUpCb(cb), this));
            return this;
        },

        beforeEach: function (cb) {
            this.__be.push(_.partial(setUpCb(cb), this));
            return this;
        },

        afterAll: function (cb) {
            this.__aa.push(_.partial(setUpCb(cb), this));
            return this;
        },

        afterEach: function (cb) {
            this.__ae.push(_.partial(setUpCb(cb), this));
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
            var stopOnError = this.stopOnError;
            return _.serial(this.__be)
                .then(_.bind(this, function () {
                    var ret = new Promise();
                    action.run(this).then(
                        _.bind(this, function actionSuccess() {
                            var summary = action.get("summary");
                            if (summary.status === "pending") {
                                ret.callback();
                            } else if (summary.status === "passed") {
                                ret.callback();
                            } else {
                                ret[stopOnError ? "errback" : "callback"]();
                            }
                        }),
                        _.bind(this, function actionError(err) {
                            this.emit("error", err);
                        }));
                    return ret;
                })).then(_.bind(this, function () {
                    return _.serial(this.__ae);
                }));
        },

        run: function (filter) {
            var ret;
            if (filter) {
                ret = this.filter(filter).run();
            } else {
                ret = this.__runPromise;
                if (!ret) {
                    this.emit("run", this);
                    ret = this.__runPromise = _.serial(this.__ba).then(
                            _.bind(this, function () {
                                return _.serial(_.map(this.__shoulds, function (action) {
                                    return _.bind(this, function () {
                                        var ret;
                                        if (action instanceof Action) {
                                            ret = this.__runAction(action);
                                        } else {
                                            ret = action.run();
                                        }
                                        return ret;
                                    });
                                }, this));
                            })
                        ).then(
                            _.bind(this, function () {
                                return _.serial(this.__aa);
                            }),
                            _.bind(this, "emit", "error")
                        ).both(_.bind(this, "emit", "done"));
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
                        "__shoulds": _(this.__shoulds).map(function (action) {
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
                        }, this).compact().value()
                    });
                }
            }
            return ret;
        },

        getters: {
            summary: function () {
                var duration = 0, ret = {description: this.description, summaries: {}}, summaries = ret.summaries;
                _.map(this.__shoulds, function (action) {
                    var actionSum = action.get("summary");
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
            var ret = {}, tests = this.tests, names = _.pluck(filter, "0");
            _.forEach(names, function (t, index) {
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
                this.reporter.startTests();
                return _.serial(_(tests).keys().map(function (k) {
                        return function () {
                            return tests[k].run().both(function (summary) {
                                summaries[k] = summary;
                            });
                        };
                    }).value()).then(_.bind(this, function () {
                        if (!filter || !filter.length) {
                            return this.printSummary();
                        }
                        return 0;
                    }));
            } else {
                console.warn("No Tests found");
                return _.resolve();
            }
        },

        printSummary: function printSummary() {
            var formatter = this.reporter, tests = this.tests;
            if (!isEmpty(tests)) {
                var summary = {};
                var keys = _.hash.keys(tests), length = 0;
                _(tests).forEach(function (test, k) {
                    var testSummary = test.get("summary");
                    if (testSummary) {
                        summary[k] = testSummary;
                        length += 1;
                    }
                });
                if (length < keys.length) {
                    formatter.printError(new Error("Async Error"));
                }
                return formatter.printFinalSummary({summary: summary});
            }
        }
    }
}).as(module);