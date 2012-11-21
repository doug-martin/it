"use strict";

var utils = require("../../utils"),
    setUpCb = utils.setUpCb,
    comb = require("comb"),
    asyncArray = comb.async.array,
    isEmpty = comb.isEmpty,
    merge = comb.merge,
    isFunction = comb.isFunction,
    Promise = comb.Promise,
    Test = require("../common").Test;

Test.extend({
    instance: {

        suite: function (description, cb) {
            return this._addTest(description, cb);
        },


        test: function (description, cb) {
            return this._addAction(description, cb);
        }
    }
}).as(module);