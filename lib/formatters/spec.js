"use strict";
var comb = require("comb"),
    characters = comb.characters,
    string = comb.string,
    style = string.style,
    format = string.format,
    multiply = string.multiply;

var pluralize = function (count, str) {
    return count !== 1 ? comb.pluralize(str) : str;
};

var formatMs = function (ms) {
    return format("% 6ds", ms / 1000);
}

exports.printTitle = function (title, level) {
    !level && console.log();
    console.log(multiply("\t", level) + title);
    !level && console.log();
};

exports.printSuccess = function (it, level) {
    if (comb.isHash(it)) {
        console.log(style(multiply("\t", level) + characters.CHECK + " should %s (%dms)", ['green']), it.description, it.duration);
    } else {
        console.log(style(multiply("\t", level) + " %s", ['green']), it);
    }
};

exports.printPending = function (it, level) {
    if (comb.isHash(it)) {
        console.log(style(multiply("\t", level) + characters.LAMBDA + " should %s (%dms)", ['cyan']), it.description, it.duration);
    }
    else {
        console.log(style(multiply("\t", level) + " %s", ['cyan']), it);
    }
};

exports.printError = function (it, level, err) {
    if (comb.isHash(it)) {
        console.log(style(multiply("\t", level) + characters.ITALIC_X + " should %s, (%dms)", ['red', "bold"]), it.description, it.duration);
    } else {
        console.log(style(multiply("\t", level) + " %s", ['red', "bold"]), it);
    }
    if (err) {
        if (err instanceof Error) {
            console.log(style(err.stack ? err.stack.toString() : err, ["red", "bold"]));
        } else {
            console.log(style(err.toString(), ["red", "bold"]));
        }
    }
};

exports.printSummary = function (summary) {
    var errCount = 0, successCount = 0, pendingCount = 0, errors = {}, duration = 0;
    (function total(summary) {
        for (var i in summary) {
            var sum = summary[i];
            if (sum["summaries"]) {
                total(sum.summaries);
            } else if (sum.status === "passed") {
                successCount++;
                duration += sum.duration;
            } else if (sum.status === "pending") {
                pendingCount++;
            } else {
                errors[i] = sum.error;
                errCount++;
                duration += sum.duration;
            }
        }
    })(summary);
    console.log(format("Finished in %s", formatMs(duration)));
    var summary = [];
    summary.push(successCount + pluralize(successCount, " example"));
    summary.push(errCount + pluralize(errCount, " error"));
    summary.push(pendingCount + " pending");
    var color = 'green';
    if (pendingCount > 0) {
        color = 'cyan';
    } else if (errCount > 0) {
        color = 'red';
    }
    console.log(style(summary.join(", "), color));
};
