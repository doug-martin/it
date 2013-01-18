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
        printTitle: function printTitle(test) {
            if (!test.sub && test.description) {
                console.log("\n" + multiply("\t", test.level) + test.description + " ");
            }
        },

        printActionSuccess: function printSuccess() {
            stdout.write(style(".", ['green']));
        },

        printActionPending: function printPending() {
            stdout.write(style(".", ['cyan']));
        },

        printActionError: function printError() {
            stdout.write(style(characters.ITALIC_X, ['red']));
        },

        printError: function printError(err) {
            stdout.write(err.stack || err);
        },

        printSummary: function printSummary(test) {
            if (!test.sub) {
                var summary = test.summary || test.get("summary");
                var stats = this.processSummary(summary);
                var errCount = stats.errCount, successCount = stats.successCount, pendingCount = stats.pendingCount, duration = stats.duration;
                stdout.write(format(" %s %s ", characters.DOUBLE_RIGHT, this.formatMs(duration)));
                console.log(format("Finished in %s", this.formatMs(duration)));
                var out = [
                    successCount + pluralize(successCount, " example"),
                    errCount + pluralize(errCount, " error"),
                    pendingCount + " pending"
                ];
                var color = pendingCount > 0 ? 'cyan' : errCount > 0 ? 'red' : 'green';
                stdout.write(format("%s\n", style(out.join(", "), color)));
                return errCount ? 1 : 0;
            }
        },
        printFinalSummary: function () {
            this.printTitle({description: "Summary"});
            return this._super(arguments);
        }
    }
}).as(module).registerType("dot").registerType("dotmatrix");








