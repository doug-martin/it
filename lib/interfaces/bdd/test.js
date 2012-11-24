"use strict";

var Test = require("../common").Test;


Test.extend({
    instance: {

        describe: function (description, cb) {
            return this._addTest(description, cb);
        },

        should: function (description, cb) {
            return this._addAction("should " + description, cb);
        }
    }
}).as(module);