"use strict";
var _ = require("../extended"),
    style = _.style,
    format = _.format;


var pluralize = function (count, str) {
    return count !== 1 ? str + "s" : str;
};

_.declare({

    instance: {

        constructor: function () {
            this.errors = [];
        },

        listenTest: function listenTest(test) {
            test.on("addTest", _.bind(this, "listenTest"));
            test.on("addAction", _.bind(this, "listenAction"));
            test.on("run", _.bind(this, "testRun"));
            test.on("error", _.bind(this, "testError"));
            test.on("done", _.bind(this, "testEnd", test));
        },

        listenAction: function listenAction(action) {
            action.on("error", _.bind(this, "actionError", action));
            action.on("success", _.bind(this, "actionSuccess", action));
            action.on("pending", _.bind(this, "actionPending", action));

        },

        formatMs: function formatMs(ms) {
            return format("% 6ds", ms / 1000);
        },

        startTests: function () {
        },

        testRun: function printTitle() {

        },

        actionSuccess: function printSuccess() {

        },

        actionPending: function printPending() {

        },

        actionError: function printError(action) {
            var error = action.get("summary").error;
            this.errors.push({error: error, test: action});
        },

        testError: function printError(test) {
            this.errors.push({error: test.error, test: test});
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

        testEnd: function () {

        },

        printFinalSummary: function (test) {
            this.testEnd.apply(this, arguments);
            console.log("\nSummary");
            var summary = test.summary || test.get("summary");
            var stats = this.processSummary(summary);
            var errCount = stats.errCount, successCount = stats.successCount, pendingCount = stats.pendingCount, duration = stats.duration;
            console.log(format("Finished in %s", this.formatMs(duration)));
            var out = [
                successCount + pluralize(successCount, " example"),
                errCount + pluralize(errCount, " error"),
                pendingCount + " pending"
            ];
            var color = pendingCount > 0 ? 'cyan' : errCount > 0 ? 'red' : 'green';
            console.log(style(out.join(", "), color));
            this._static.list(this.errors);
            return errCount ? 1 : 0;
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

        getInstance: function (type, args) {
            type = type.toLowerCase();
            if (this.reporters.hasOwnProperty(type)) {
                return new this.reporters[type](args || {});
            } else {
                throw new Error("Invalid Reporter type");
            }
        },

        list: function (errors) {
            console.error();
            errors.forEach(function (test, i) {
                // format
                var fmt = '  %s) %s:\n' + style('     %s', "red") + style('\n%s\n', ["red", "bold"]);

                // msg
                var err = test.error,
                    message = err.message || '',
                    stack = err.stack || message,
                    index = stack.indexOf(message) + message.length,
                    msg = stack.slice(0, index);

                // indent stack trace without msg
                stack = stack.slice(index ? index + 1 : index)
                    .replace(/^/gm, '  ');

                console.error(fmt, (i + 1), test.test.get("fullName"), msg, stack);
            });
        }
    }

}).as(module);