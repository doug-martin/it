"use strict";
var comb = require("comb"),
    characters = comb.characters,
    string = comb.string,
    style = string.style,
    format = string.format,
    multiply = string.multiply;


var stdout = process.stdout;

var pluralize = function (count, str) {
    return count !== 1 ? comb.pluralize(str) : str;
};

var formatMs = function (ms) {
    return format("% 6ds", ms / 1000);
};

exports.printTitle = function (title, level) {
    if (!level) {
        console.log("\n" + multiply("\t", level) + title + " ");
    }
};

exports.printSuccess = function (it, level) {
    stdout.write(style(".", ['green']));
};

exports.printError = function (it, err, level) {
    stdout.write(style(characters.ITALIC_X, ['red']));
};

exports.printSummary = function (summary) {
    var errCount = 0, successCount = 0, errors = {}, duration = 0;
    (function total(summary) {
        for (var i in summary) {
            var sum = summary[i];
            if (sum["summaries"]) {
                total(sum.summaries);
            } else if (sum.status === "passed") {
                successCount++;
                duration += sum.duration;
            } else {
                errors[i] = sum.error;
                errCount++;
                duration += sum.duration;
            }
        }
    })(summary);
    stdout.write(format(" %s %s ", characters.DOUBLE_RIGHT,  formatMs(duration)));
    var summary = [];
    summary.push(successCount + pluralize(successCount, " example"));
    summary.push(errCount + pluralize(errCount, " error"));
    stdout.write(format("%s\n", style(summary.join(", "), errCount > 0 ? "red" : "green")));
};