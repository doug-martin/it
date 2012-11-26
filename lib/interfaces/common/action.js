"use strict";
var comb = require("comb"),
    isFunction = comb.isFunction,
    EventEmitter = require("./emitter"),
    merge = comb.merge,
    Promise = comb.Promise,
    utils = require("../../utils"),
    setUpCb = utils.setUpCb;

EventEmitter.extend({

    instance: {

        level: 0,

        constructor: function (description, parent, level, action) {
            this._super(arguments);
            this.level = level;
            this.description = description;
            this.parent = parent;
            this.fn = action;
            this.__summary = {
                description: description,
                start: null,
                end: null,
                duration: 0, // test is pending
                status: 'pending',
                error: false
            };
            var stub = this.stub = !isFunction(action);
            this.action = !stub ? setUpCb(action) : new Promise().callback(this.__summary);
        },

        success: function (start, end) {
            merge(this.summary, { start: start, end: end, duration: end - start, status: "passed"});
            this.emit("success", this.summary);
            return this.summary;
        },

        failed: function (start, end, err) {
            merge(this.summary, { start: start, end: end, duration: end - start, status: "failed", error: err || new Error()});
            this.emit("error", err);
            return this.summary;
        },

        run: function () {
            var ret = new Promise();
            var start = new Date();
            if (this.stub) {
                // this test is pending (read: not defined yet)
                ret = this.action;
                this.emit("pending", this.summary);
            } else {
                ret = this.action(this.parent).chain(
                    function () {
                        return this.success(start, new Date());
                    }.bind(this),
                    function (err) {
                        return this.failed(start, new Date(), err);
                    }.bind(this)
                );
            }
            return ret;
        },

        getters: {

            summary: function () {
                return this.__summary;
            }

        }
    }

}).as(module);