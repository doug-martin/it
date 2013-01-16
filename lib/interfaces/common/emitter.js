"use strict";
var comb = require("comb"),
    EventEmitter = require("events").EventEmitter;

var instance = comb.merge({}, EventEmitter.prototype, {
    constructor: function () {
        EventEmitter.call(this);
        return this._super(arguments);
    }
});

comb.define({
    instance: instance
}).as(module);
