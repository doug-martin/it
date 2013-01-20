"use strict";
var _ = require("../extended"),
    Reporter = require("./reporter"),
    characters = _.characters,
    style = _.style,
    format = _.format,
    multiply = _.multiply;


var stdout = process.stdout;

var pluralize = function (count, str) {
    return count !== 1 ? str + "s" : str;
};

Reporter.extend({
    instance: {

        actionSuccess: function printSuccess() {
            this._super(arguments);
            stdout.write(style(".", ['green']));
        },

        actionPending: function printPending() {
            this._super(arguments);
            stdout.write(style(".", ['cyan']));
        },

        actionError: function printError() {
            this._super(arguments);
            stdout.write(style(characters.ITALIC_X, ['red']));
        }
    }
}).as(module).registerType("dot").registerType("dotmatrix");








