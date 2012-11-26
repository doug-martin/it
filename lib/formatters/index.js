"use strict";
require("./dot");
require("./spec");

var Reporter = require("./reporter");


exports.coverage = require("./coverage.js");
exports.coverageHtml = require("./coverage-html.js");

exports.getReporter = function getReporter(type) {
    return Reporter.getInstance(type);
}
