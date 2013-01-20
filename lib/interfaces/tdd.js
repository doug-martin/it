"use strict";

var Test = require("./common").Test,
    _ = require("../extended");

Test.extend({
    instance: {

        suite: function (description, cb) {
            return this._addTest(description, cb);
        },


        test: function (description, cb) {
            return this._addAction(description, cb);
        }
    },

    "static": {

        init: function () {
            _.bindAll(this, "suite");
        },

        /**
         * Creates a test with it.
         * @param {String} description the description of the test.
         * @param {Function} [cb] the function to invoke in the scope of the test. The it suite is passed as the first argument.
         * @return {it.Suite} the test.
         */
        suite: function _suite(description, cb) {
            var test = new this(description, {});
            cb(test);
            return test;
        }

    }
}).as(module);

