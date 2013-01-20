"use strict";
require("./dot");
require("./spec");
require("./tap");
require("./doc");

var Reporter = require("./reporter");

exports.getReporter = function getReporter(type) {
    return Reporter.getInstance(type);
};
