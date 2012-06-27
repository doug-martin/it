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


var setUpCb = function (cb, it) {
    return function () {
        var ret = new comb.Promise();
        var funcRet = new comb.Promise();
        var isCallback = false;
        var ignoreProcessError = it.ignoreProcessError === true;
        var errorHandler = function (err) {
            if(!isCallback){
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
    }
};

var describeIt = function (description, sub, level) {
    var it = {

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
        __formatter:formatter,
        topic:description,

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
            it.__formatter = this.__formatter;
            var summaries = this.__summaries;
            "function" === typeof cb && cb(it);
            this.__shoulds.push(hitch(this, function () {
                var ret = new comb.Promise();
                it.run(this.__level + 1).both(function (summary) {
                    summaries[description] = summary;
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
            it.__formatter = this.__formatter;
            var summaries = this.__summaries;
            "function" === typeof cb && cb(it);
            this.__shoulds.push(hitch(this, function () {
                var ret = new comb.Promise();
                it.run(this.__level).both(function (summary) {
                    summaries[description] = summary;
                    ret.callback();
                });
                return ret;
            }));
            return it;
        },

        should:function (description, cb) {
            description = description || "Should " + this.__shoulds.length + 1;
            var summaries = this.__summaries, stopOnError = this.stopOnError;
            var level = this.__level + 1;
            this.__shoulds.push(hitch(this, function () {
                var formatter = this.__formatter;
                var ret = new comb.Promise();
                var start = new Date();
                if (typeof cb !== "function") {
                    // this test is pending (read: not defined yet)
                    var sum = {
                        description : description,
                        start : start,
                        end : start,
                        duration : 0, // test is pending
                        status : 'pending'
                    };
                    summaries[description] = sum;
                    formatter.printPending(sum, level);
                    ret.callback();
                } else {
                    setUpCb(cb, this)().then(function () {
                        var end = new Date();
                        var sum = {description:description, start:start, end:end, duration:end - start, status:"passed", error:false};
                        summaries[description] = sum;
                        formatter.printSuccess(sum, level);
                        ret.callback();
                    }, function (err) {
                        var end = new Date();

                        var sum = {
                            description:description,
                            start:start, end:end,
                            duration:end - start,
                            status:"failed",
                            error:err
                        };
                        var formatErr = formatter.printError(sum, level, err);
                        if (comb.isDefined(formatErr)) {
                            sum.status = formatErr === false ? "passed" : "failed";
                            sum.error = formatErr === false ? false : err;
                        }
                        summaries[description] = sum;

                        ret[stopOnError ? "errback" : "callback"](err);
                    });
                }
                return ret;
            }));
            return it;
        },

        _processSummary:function (summary, ret, method) {
            var formatter = this.__formatter;
            this.__summaries = summary;
            !sub && formatter.printSummary(summary.summaries, summary.duration);
            ret[method](this.__summaries);
        },

        run:function (level) {
            var ret = new comb.Promise();
            if (!this.__run) {
                this.__run = true;
                if (sub) {
                    level = level || 1;
                } else {
                    level = null;
                }
                var formatter = this.__formatter;
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
                comb.serial(funcs).then(comb.hitch(this, function () {
                    var duration = new Date() - start;
                    this._processSummary({summaries:summaries, duration:duration}, ret, "callback");
                }), comb.hitch(this, function (err) {
                    this.__run = true;
                    var duration = new Date() - start;
                    formatter.printError("Top level error", 1, err);
                    this._processSummary({summaries:summaries, duration:duration}, ret, "errback");
                }));
            } else {
                ret.callback(this.__summaries);
            }
            return ret;
        }
    };
    it.__defineSetter__("reporter", function (f) {
        if (comb.isString(f)) {
            this.__formatter = formatters[f];
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
        return this.__formatter;
    });
    sub !== true && (its[it.topic] = it);
    return it;
};

exports.describe = function (description, cb) {
    var it = describeIt(description);
    "function" === typeof cb && cb(it);
    return it;
};

exports.run = function (opts) {
    var ret = comb.serial(Object.keys(its).map(function (k) {
        return function () {
            return its[k].run();
        }
    }));

    comb.listenForExit(function () {
        formatter.printTitle("Summary");
        var summary = {};
        var keys = Object.keys(its), length;
        Object.keys(its).forEach(function (k) {
            var itSummary = its[k].__summaries;
            if (itSummary) {
                summary[k] = itSummary;
                length++;
            }
        });
        //console.log(summary);
        if (summary.length < keys.length) {
            formatter.printError(new Error("Async Error"));
        }
        formatter.printSummary(summary);

    });
    return ret;
};

