"use strict";
var _ = require("../extended"),
    format = _.format,
    Reporter = require("./reporter");


function getActionName(action) {
    return action.get("fullName").replace(/#/g, '');
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

        startTests: function (tests) {
            console.log(format('%d..%d', 1, (this.numActions = tests.numActions)));
        },

        actionSuccess: function printSuccess(action) {
            this.passed++;
            console.log(format('ok %d %s', ++this.ran, getActionName(action)));

        },

        actionPending: function printPending(action) {
            console.log(format('ok %d %s # SKIP -', ++this.ran, getActionName(action)));
        },

        actionError: function printError(action) {
            this.failed++;
            var summary = action.get("summary"), err = summary.error;
            console.log(format('not ok %d %s', ++this.ran, getActionName(action)));
            if (err.stack) {
                console.log(err.stack.replace(/^/gm, '  '));
            } else if (err.message) {
                console.log(err.message);
            } else {
                console.log(err);
            }
        },

        printFinalSummary: function () {
            console.log('# tests ' + (this.passed + this.failed));
            console.log('# pass ' + this.passed);
            console.log('# fail ' + this.failed);
            return this.failed ? 1 : 0;
        }
    }
}).as(module).registerType("tap");








