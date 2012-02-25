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
    formatter = formatters[f];
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
            var response = cb.bind(funcRet)(classicNext, funcRet);
            if (comb.isPromiseLike(response)) {
                response.then(hitch(funcRet, "callback"), hitch(funcRet, "errback"));
            } else if (comb.isDefined(response)) {

                !isCallback && funcRet.callback();
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

        __ba:[],
        __be:[],
        __aa:[],
        __ae:[],
        __stopOnError:false,
        __summaries:{},
        __topic:description || "Test " + its.length + 1,

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
            it.__be = this.__be;
            it.__ae = this.__ae;
            it.__stopOnError = this.__stopOnError;
            var summaries = this.__summaries;
            "function" === typeof cb && cb(it);
            this.__shoulds.push(hitch(this, function () {
                var ret = new comb.Promise();
                it.run().both(function (summary) {
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
            this.__shoulds.push(function () {
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
                    var sum = {description:description, start:start, end:end, duration:end - start, status:"failed", error:err};
                    summaries[description] = sum;
                    formatter.printError(sum, err, level);
                    ret[stopOnError ? "errback" : "callback"](err);
                });
                return ret;
            });
            return it;
        },

        run:function (level) {
            if (sub) {
                level = level || 1;
            } else {
                level = null;
            }
            formatter.printTitle(this.__topic, level);
            var funcs = this.__ba.slice();
            this.__shoulds.forEach(function (batch) {
                funcs = funcs.concat(this.__be);
                funcs.push(batch);
                funcs = funcs.concat(this.__ae);
            }, this);
            funcs = funcs.concat(this.__aa);
            var start = new Date();
            var successes = this.__successes, errors = this.__errors, summaries = this.__summaries;
            var ret = new comb.Promise();
            comb.serial(funcs).then(function () {
                var duration = new Date() - start;
                !sub && formatter.printSummary(summaries, duration);
                ret.callback({summaries:summaries, duration:duration});
            }, function (err) {
                var duration = new Date() - start;
                formatter.printError("Top level error", err);
                !sub && formatter.printSummary(summaries, duration);
                ret.callback({summaries:summaries, duration:duration});
            });
            return ret;
        }
    };
    sub !== true && (its[it.__topic] = it);
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

