"use strict";


var Test = require("./test");

var bdd = {

    Action: Test.Action,
    Test: Test,

    reporter: function reporter(r) {
        Test.reporter = r;
    },

    /**
     * Creates a test with it.
     * @param {String} description the description of the test.
     * @param {Function} [cb] the function to invoke in the scope of the test. The it suite is passed as the first argument.
     * @return {it.Suite} the test.
     */
    suite: function _description(description, cb) {
        return new Test(description, {}, cb);
    }

};

module.exports = bdd;