"use strict";
var comb = require("comb"),
    isPromiseLike = comb.isPromiseLike,
    isDefined = comb.isDefined,
    isString = comb.isString,
    Promise = comb.Promise;

function splitFilter(filter) {
    var ret = [];
    if (isString(filter)) {
        ret = filter.split("|").map(function (filter) {
            return filter.trim().split(":").map(function (f) {
                return f.trim();
            });
        });
    }
    return ret;
}

exports.splitFilter = splitFilter;


function setUpCb(cb) {
    return function (it) {
        var ret = new Promise();
        var funcRet = new Promise();
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
            if (isPromiseLike(response)) {
                response.then(funcRet);
            } else if (isDefined(response) || l === 0) {
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

exports.setUpCb = setUpCb;