"use strict";
var _ = require("../extended"),
    format = _.format;

_.declare({

    instance: {

        listenTest: function listenTest(test) {
            test.on("addTest", _.bind(this, "listenTest"));
            test.on("addAction", _.bind(this, "listenAction"));
            test.on("run", _.bind(this, "printTitle"));
            test.on("error", _.bind(this, "printError"));
            test.on("done", _.bind(this, "printSummary", test));
        },

        listenAction: function listenAction(action) {
            action.on("error", _.bind(this, "printActionError", action));
            action.on("success", _.bind(this, "printActionSuccess", action));
            action.on("pending", _.bind(this, "printActionPending", action));

        },

        formatMs: function formatMs(ms) {
            return format("% 6ds", ms / 1000);
        },

        printTitle: function printTitle() {

        },

        printActionSuccess: function printSuccess() {

        },

        printActionPending: function printPending() {

        },

        printActionError: function printError() {

        },

        printError: function printError() {

        },

        processSummary: function processSummary(summary) {
            if (summary.hasOwnProperty("summaries")) {
                summary = summary.summaries;
            }
            var errCount = 0, successCount = 0, pendingCount = 0, errors = {}, duration = 0;
            _(summary).forEach(function (sum) {
                duration += sum.duration;
            });
            (function total(summary) {
                _(summary).forEach(function (sum, i) {
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

        printSummary: function () {

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
                return new this.reporters[type]();
            } else {
                throw new Error("Invalid Reporter type");
            }
        }
    }

}).as(module);