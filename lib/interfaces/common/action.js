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
                ret = this.action(parent);
                ret.classic(function (err) {
                    var end = new Date();
                    merge(this.__summary, {
                        start: start,
                        end: end,
                        duration: end - start,
                        status: err ? "failed" : "passed",
                        error: err || false
                    });
                }.bind(this));
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