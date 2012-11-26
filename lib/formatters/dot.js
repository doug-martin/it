"use strict";
var comb = require("comb"),
    Reporter = require("./reporter"),
    characters = comb.characters,
    string = comb.string,
    style = string.style,
    format = string.format,
    multiply = string.multiply;


var stdout = process.stdout;

var pluralize = function (count, str) {
    return count !== 1 ? comb.pluralize(str) : str;
};

Reporter.extend({
    instance: {
        printTitle: function printTitle(test) {
            if (!test.sub && test.description) {
                console.log("\n" + multiply("\t", test.level) + test.description + " ");
            }
        },

        printActionSuccess: function printSuccess(action) {
            stdout.write(style(".", ['green']));
        },

        printActionPending: function printPending(action) {
            stdout.write(style(".", ['cyan']));
        },

        printActionError: function printError(action) {
            stdout.write(style(characters.ITALIC_X, ['red']));
        },

        printError: function printError(err) {
            stdout.write(err.stack || err);
        },

        printSummary: function printSummary(test) {
            if (!test.sub) {
                var summary = test.summary;
                var stats = this.processSummary(summary);
                var errCount = stats.errCount, successCount = stats.successCount, pendingCount = stats.pendingCount, errors = stats.errors, duration = stats.duration;
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
        }
    }
}).as(module).registerType("dot").registerType("dotmatrix");








