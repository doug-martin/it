"use strict";

var Test = require("./common").Test,
    bdd = require("./bdd"),
    tdd = require("./tdd");

module.exports = {

    bdd: bdd,
    tdd: tdd,

    reporter: function reporter(r) {
        bdd.reporter(r);
        tdd.reporter(r);
    },

    printSummary: function printSummary() {
        return Test.printSummary();
    },

    run: function run() {
        return Test.run();
    }

};