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

function getActionName(action) {
    var decription = "";
    if (action.parent) {
        decription += getActionName(action.parent) + ":";
    }
    decription += " " + action.description;
    return decription.replace(/#/g, '');
}

Reporter.extend({
    instance: {
        numActions: 0,
        ran: 0,
        passed: 0,
        failed: 0,

        listenAction: function () {
            this.numActions++;
            return this._super(arguments);
        },

        startTests: function () {
            console.log('%d..%d', 1, this.numActions);
        },

        printActionSuccess: function printSuccess(action) {
            this.passed++;
            console.log('ok %d %s', ++this.ran, getActionName(action));

        },

        printActionPending: function printPending(action) {
            console.log('ok %d %s # SKIP -', ++this.ran, getActionName(action));
        },

        printActionError: function printError(action) {
            this.failed++;
            var summary = action.get("summary"), err = summary.error;
            console.log('not ok %d %s', ++this.ran, getActionName(action));
            if (err.stack) {
                console.log(err.stack.replace(/^/gm, '  '));
            }
        },

        printFinalSummary: function () {
            console.log('# tests ' + (this.passed + this.failed));
            console.log('# pass ' + this.passed);
            console.log('# fail ' + this.failed);
        }
    }
}).as(module).registerType("tap");








