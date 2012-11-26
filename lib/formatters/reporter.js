"use strict";
var comb = require("comb"),
    format = comb.string.format;

comb.define({

    instance: {

        listenTest: function listenTest(test) {
            test.on("addTest", function (test) {
                this.listenTest(test);
            }.bind(this));
            test.on("addAction", function (action) {
                this.listenAction(action);
            }.bind(this));
            test.on("run", function () {
                this.printTitle(test);
            }.bind(this));
            test.on("error", function (err) {
                this.printError(err);
            }.bind(this))
            test.on("done", function () {
                this.printSummary(test);
            }.bind(this));
        },

        listenAction: function listenAction(action) {
            var printError = this.printActionError.bind(this, action),
                printSuccess = this.printActionSuccess.bind(this, action),
                printPending = this.printActionPending.bind(this, action);
            action.on("error", printError);
            action.on("success", printSuccess);
            action.on("pending", printPending);

        },

        formatMs: function formatMs(ms) {
            return format("% 6ds", ms / 1000);
        },

        printTitle: function printTitle(test) {

        },

        printActionSuccess: function printSuccess(action) {

        },

        printActionPending: function printPending(action) {

        },

        printActionError: function printError(action) {

        },

        printError: function printError(err) {

        },

        processSummary: function processSummary(summary) {
            if (summary.hasOwnProperty("summaries")) {
                summary = summary.summaries;
            }
            var errCount = 0, successCount = 0, pendingCount = 0, errors = {}, duration = 0;
            Object.keys(summary).forEach(function (k) {
                duration += summary[k].duration;
            });
            (function total(summary) {
                Object.keys(summary).forEach(function (i) {
                    var sum = summary[i];
                    if (sum.hasOwnProperty("summaries")) {
                        total(sum.summaries);
                    } else if (sum.status === "passed") {
                        successCount++;
                    } else if (sum.status === "pending") {
                        pendingCount++;
                    } else {
                        errors[i] = sum.error;
                        errCount++;
                    }
                });
            })(summary);
            return {errCount: errCount, successCount: successCount, pendingCount: pendingCount, errors: errors, duration: duration};
        },

        printSummary: function (summary) {

        }


    },

    "static": {

        reporters: {},

        registerType: function (type) {
            type = type.toLowerCase();
            if (!this.reporters.hasOwnProperty(type)) {
                this.reporters[type] = this;
            }
            return this;
        },

        getInstance: function (type) {
            type = type.toLowerCase();
            if (this.reporters.hasOwnProperty(type)) {
                var Const = this.reporters[type];
                return new Const();
            } else {
                throw new Error("Invalid Reporter type");
            }
        }
    }

}).as(module);