"use strict";
var _ = require("./extended"),
    isPromiseLike = _.isPromiseLike,
    isDefined = _.isDefined,
    isString = _.isString,
    Promise = _.Promise;

function splitFilter(filter) {
    var ret = [];
    if (isString(filter)) {
        ret = _(filter.split("|")).map(function (filter) {
            return _(filter.trim().split(":")).map(function (f) {
                return f.trim();
            }).value();
        }).value();
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
            var response = _.bind(funcRet, cb)(classicNext, funcRet);
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