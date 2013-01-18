"use strict";
require("./dot");
require("./spec");

var Reporter = require("./reporter");

exports.getReporter = function getReporter(type) {
    return Reporter.getInstance(type);
};
