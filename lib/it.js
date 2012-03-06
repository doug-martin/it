"use strict";
var comb = require("comb"),
    string = comb.string,
    multiply = string.multiply,
    hitch = comb.hitch,
    formatters = require("./formatters");

require("./extension");

var its = {};

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


var setUpCb = function (cb) {
    return function () {
        var ret = new comb.Promise();
        var funcRet = new comb.Promise();
        var isCallback = false;
        var errorHandler = function (err) {
            !isCallback && ret.errback(err);
        };
        process.on("uncaughtException", errorHandler);
        try {
            var classicNext = function (err) {
                if (err) {
                    ret.errback(err);
                } else {
                    ret.callback();
                }
            };
            var l = cb.length;
            var response = cb.bind(funcRet)(classicNext, funcRet);
            if (comb.isPromiseLike(response)) {
                response.then(hitch(funcRet, "callback"), hitch(funcRet, "errback"));
            } else if (comb.isDefined(response) || l == 0) {
                !isCallback && ret.callback();
                isCallback = true;
            }
            funcRet.then(function () {
                !isCallback && ret.callback();
                isCallback = true;
            }, function (err) {
                !isCallback && ret.errback(err);
                isCallback = true;
            });
        } catch (err) {
            !isCallback && ret.errback(err);
            isCallback = true;
        }
        ret.both(function () {
            process.removeListener("uncaughtException", errorHandler);
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
        __stopOnError:false,
        __summaries:{},
        __formatter:formatter,
        topic:description || "Test " + its.length + 1,

        beforeAll:function (cb) {
            this.__ba.push(setUpCb(cb));
            return it;
        },

        beforeEach:function (cb) {
            this.__be.push(setUpCb(cb));
            return it;
        },

        afterAll:function (cb) {
            this.__aa.push(setUpCb(cb));
            return it;
        },

        afterEach:function (cb) {
            this.__ae.push(setUpCb(cb));
            return it;
        },

        describe:function (description, cb) {
            var it = describeIt(description, true, this.__level + 1);
            it.__be = this.__be.slice();
            it.__ae = this.__ae.slice();
            it.__stopOnError = this.__stopOnError;
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

        should:function (description, cb) {
            description = description || "Should " + this.__shoulds.length + 1;
            var summaries = this.__summaries, stopOnError = this.__stopOnError;
            var level = this.__level + 1;
            this.__shoulds.push(hitch(this, function () {
                var formatter = this.__formatter;
                var ret = new comb.Promise();
                var start = new Date();
                setUpCb(cb)().then(function () {
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
                return ret;
            }));
            return it;
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
                formatter.printTitle(this.topic, level);
                var funcs = this.__ba.slice();
                this.__shoulds.forEach(function (batch) {
                    funcs = funcs.concat(this.__be);
                    funcs.push(batch);
                    funcs = funcs.concat(this.__ae);
                }, this);
                funcs = funcs.concat(this.__aa);
                var start = new Date();
                var summaries = this.__summaries;
                comb.serial(funcs).then(function () {
                    var duration = new Date() - start;
                    !sub && formatter.printSummary(summaries, duration);
                    this.__summaries = {summaries:summaries, duration:duration};
                    ret.callback(this.__summaries);
                }, function (err) {
                    this.__run = true;
                    var duration = new Date() - start;
                    formatter.printError("Top level error", 1, err);
                    !sub && formatter.printSummary(summaries, duration);
                    this.__summaries = {summaries:summaries, duration:duration};
                    ret.callback(this.__summaries);
                });
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
    return comb.serial(Object.keys(its).map(function (k) {
        return function () {
            return its[k].run();
        }
    }));
};

