"use strict";

var Test = require("./common").Test,
    _ = require("../extended"),
    descriptions = {},
    duplicateDescribeBlockErrors = [];


_.bus.on("checkDuplicates", function (duplicateTests) {
    duplicateDescribeBlockErrors = duplicateDescribeBlockErrors.concat(duplicateTests);
    if (duplicateDescribeBlockErrors.length > 0) {
        _.bus.emit("printDuplicateActions", duplicateDescribeBlockErrors);
        throw new Error("" + duplicateDescribeBlockErrors.length + " duplicate describe block or test names are not allowed.");
    }
});

Test.extend({
    instance: {

        constructor: function () {
            this._super(arguments);
            _.bindAll(this, ["describe", "should"]);
        },

        describe: function (description, cb) {
            return this._addTest(description, cb);
        },

        should: function (description, cb) {
            return this._addAction("should " + description, cb);
        }
    },

    "static": {

        init: function () {
            _.bindAll(this, ["describe"]);
        },

        /**
         * Creates a test with it.
         * @param {String} description the description of the test.
         * @param {Function} [cb] the function to invoke in the scope of the test. The it suite is passed as the first argument.
         * @return {it.Suite} the test.
         */
        describe: function _description(description, cb) {
            var test = new this(description, {});
            var it = test._addAction;
            if (descriptions[description]){
                duplicateDescribeBlockErrors.push({
                    error: new Error("Duplicate describe block name:" + description),
                    test: test
                });
            }else{
                descriptions[description] = true
            }

            _(["description", "should", "describe", "timeout", "getAction", "beforeAll", "beforeEach",
                "afterAll", "afterEach", "context", "get", "set", "skip", "ignoreErrors"]).forEach(function (key) {
                    it[key] = test[key];
                });
            cb(it);
            return test;
        }

    }
}).as(module);
