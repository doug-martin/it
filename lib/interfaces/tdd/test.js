"use strict";

var Test = require("../common").Test;

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