"use strict";
var _ = require("../extended"),
    Reporter = require("./reporter"),
    characters = _.characters,
    style = _.style,
    format = _.format,
    multiply = _.multiply;

var pluralize = function (count, str) {
    return count !== 1 ? str + "s" : str;
};

Reporter.extend({

    instance: {

        printLineForLevel: function printLineForLevel(level) {
            if (!level) {
                console.log();
            }
            return this;
        },

        printTitle: function printTitle(action) {
            if (action.description) {
                var level = action.level, title = action.description;
                this.printLineForLevel(level);
                console.log(multiply("\t", level) + title);
                this.printLineForLevel(level);
            }
        },

        printActionSuccess: function (action) {
            var level = action.level, summary = action.get("summary");
            console.log(style(multiply("\t", level) + characters.CHECK + " %s (%dms)", ['green']), action.description, summary.duration);
        },

        printActionPending: function (action) {
            var summary = action.get("summary"), level = action.level;
            console.log(style(multiply("\t", level) + characters.LAMBDA + " %s (%dms)", ['cyan']), action.description, summary.duration);
        },

        printActionError: function printError(action) {
            var level = action.level, summary = action.get("summary"), err = summary.error;
            console.log(style(multiply("\t", level) + characters.ITALIC_X + " %s, (%dms)", ['red', "bold"]), action.description, summary.duration);
            if (err) {
                if (err instanceof Error) {
                    console.log(style(err.stack ? err.stack.toString() : err, ["red", "bold"]));
                } else {
                    console.log(style(err.toString(), ["red", "bold"]));
                }
            }
        },

        printError: function printError(err) {
            if (err) {
                if (err instanceof Error) {
                    console.log(style(err.stack ? err.stack.toString() : err, ["red", "bold"]));
                } else {
                    console.log(style(err.toString(), ["red", "bold"]));
                }
            }
        },

        printSummary: function printSummary(test) {
            if (!test.sub) {
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
                return errCount ? 1 : 0;
            }
        }
    }

}).as(module).registerType("spec");



