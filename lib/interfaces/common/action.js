"use strict";
var comb = require("comb"),
    isFunction = comb.isFunction,
    merge = comb.merge,
    Promise = comb.Promise,
    utils = require("../../utils"),
    setUpCb = utils.setUpCb;


comb.define({

    instance: {

        constructor: function (description, action) {
            this.description = description;
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

        run: function (parent) {
            var ret = new Promise();
            var start = new Date();
            if (this.stub) {
                // this test is pending (read: not defined yet)
                ret = this.action;
            } else {
                var summary = this.__summary;
                ret = this.action(parent).chain(
                    function (err) {
                        var end = new Date();
                        return merge(summary, { start: start, end: end, duration: end - start, status: "passed"});
                    },
                    function (err) {
                        var end = new Date();
                        return merge(summary, { start: start, end: end, duration: end - start, status: "failed", error: err || new Error()});
                    }
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