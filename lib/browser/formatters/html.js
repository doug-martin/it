"use strict";
var _ = require("../../extended"),
    Reporter = require("../../formatters/reporter"),
    characters = _.characters,
    format = _.format,
    multiply = _.multiply,
    arraySlice = Array.prototype.slice;


var pluralize = function (count, str) {
    return count !== 1 ? str + "s" : str;
};

var TAB = "&nbsp;&nbsp;&nbsp;";

function formatError(err) {
    return err.stack ? err.stack.replace(/\n/g, "</br>").replace(/\t/g, TAB).replace(/\s/g, "&nbsp;") : err;
}

function getSpacing(action) {
    return action.level * 2.5 + "em";
}

function createDom(type, attrs) {
    var el = document.createElement(type);
    _(arraySlice.call(arguments, 2)).forEach(function (child) {
        if (_.isString(child)) {
            el.appendChild(document.createTextNode(child));
        } else if (child) {
            el.appendChild(child);
        }
    });
    _(attrs || {}).forEach(function (attrs, attr) {
        if (attr === "className") {
            el[attr] = attrs;
        } else {
            el.setAttribute(attr, attrs);
        }
    });
    return el;
}

function getActionName(action) {
    var decription = "";
    if (action.parent) {
        decription += getActionName(action.parent) + ":";
    }
    decription += " " + action.description;
    return decription;
}

function updateActionStatus(action, status) {
    var els = document.querySelectorAll('[data-it-actionName="' + getActionName(action) + '"]');
    for (var i = 0, l = els.length; i < l; i++) {
        var el = els.item(i), className = el.className;
        el.className = className.replace(/(not-run|pending|error|passed) */ig, "") + " " + status;
    }
}

Reporter.extend({
    instance: {

        constructor: function (el) {
            this.el = document.getElementById(el);
            this.header = this.el.appendChild(createDom("div", {className: "header"}, createDom("h1", {}, "It")));
            this.summary = this.header.appendChild(createDom("div", {className: "summary"}));
            this.progress = this.el.appendChild(createDom("ul", {className: "progress"}));
            this.actions = this.el.appendChild(createDom("div", {className: "actions"}));
            this.errors = [];
            if (!this.el) {
                throw new Error("Unable to find el with id #" + el);
            }
        },

        printLineForLevel: function printLineForLevel(level) {
            if (!level) {
                this.el.appendChild(createDom("br"));
            }
            return this;
        },

        listenAction: function (action) {
            this._super(arguments);
            var actionName = getActionName(action);
            this.progress.appendChild(createDom("li", {className: "not-run", "data-it-actionName": actionName}));

        },

        printTitle: function printTitle(action) {
            if (action.description) {
                this.actions.appendChild(createDom("div",
                    {className: "header", style: "padding-left:" + getSpacing(action), "data-it-actionName": getActionName(action)},
                    createDom("br"),
                    action.description,
                    createDom("br")
                ));
            }
        },

        __addAction: function (action) {
            var summary = action.get("summary");
            this.actions.appendChild(createDom("div",
                {className: "pending", style: "padding-left:" + getSpacing(action), "data-it-actionName": getActionName(action)},
                format(" %s, (%dms)", action.description, summary.duration)
            ));
            updateActionStatus(action, summary.status);
            return this;
        },

        printActionSuccess: function (action) {
            this.__addAction(action);
        },

        printActionPending: function (action) {
            this.__addAction(action);
        },

        printActionError: function printError(action) {
            this.__addAction(action).errors.push(action);
        },

        printError: function printError(err) {
            this.errors.push(err);
        },

        printErrors: function () {
            if (this.errors.length) {
                //clear all actions
                this.actions.innerHTML = "";
                _(this.errors).forEach(function (action) {
                    var el;
                    if (_.isString(action)) {
                        el = createDom("pre", {className: "failed"}, action);
                    } else if (_.instanceOf(action, Error)) {
                        el = createDom("pre", {className: "failed"}, action.stack);
                    } else {
                        var summary = action.get("summary"), err = summary.error;
                        el = createDom("pre",
                            {className: "failed"},
                            format(" %s, (%dms)", getActionName(action), summary.duration),
                            createDom("br"),
                            (err.stack ? err.stack : err).toString()
                        );
                    }
                    this.actions.appendChild(el);
                }, this);
            }
        },

        printFinalSummary: function (test) {
            var summary = test.summary;
            var stats = this.processSummary(summary);
            var errCount = stats.errCount, successCount = stats.successCount, pendingCount = stats.pendingCount, duration = stats.duration;
            var out = [
                "Duration " + this.formatMs(duration),
                successCount + pluralize(successCount, " example"),
                errCount + pluralize(errCount, " error"),
                pendingCount + " pending"
            ];
            this.summary.appendChild(createDom("div",
                {className: pendingCount > 0 ? "pending" : errCount > 0 ? "failed" : "success"},
                out.join(", ")));
            this.printErrors();
            return errCount ? 1 : 0;
        }
    }
}).as(module).registerType("html");