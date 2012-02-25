var assert = require("assert"), comb = require("comb"), format = comb.string.format;

assert.lengthOf = function (arr, length, message) {
    if(arr.length !== length){
        assert.fail(arr.length, length, message || format("expected %s, to have %d elements", [arr, length]), assert.lengthOf);
    }
};

assert.isTrue = function (val, message) {
    if(val !== true){
        assert.fail(val, true, message || format("expected %s, got %s", true, val), assert.isTrue);
    }

};

assert.isFalse = function (val, message) {
    if(val !== false){
        assert.fail(val, false, message || format("expected %s, got %s", false, val), assert.isFalse);
    }
};

assert.isRegExp = comb.isRexExp;
[["isArray", "an array"], ["isDate", "a date"], ["isBoolean", "a boolean"], ["isString", "a string"], ["isUndefined", "undefined"], ["isUndefinedOrNull", "undefined or null"], ["isPromiseLike", "a promise"]].forEach(function(i){
    var k = i[0], extra = i[1];
    assert[k] = function(val, message){
        if(!comb[k](val)){
            assert.fail(val, 0, message || format("expected %s, to be " + extra, val), assert[k]);
        }
    };
});

assert.isNull = function (actual, message) {
    if (actual !== null) {
        assert.fail(actual, null, message || format("expected %s, got %s", null, actual), "===", assert.isNull);
    }
};

assert.isNotNull = function (actual, message) {
    if (actual === null) {
        assert.fail(actual, null, message || format("expected non-null value, got %s", actual), "===", assert.isNotNull);
    }
};

assert.instanceOf = function (val, cls, message) {
    if (!comb.isInstanceOf(val, cls)) {
        assert.fail(val, cls, message || format("expected %j to be instanceof %j", val, cls), "===", assert.isNotNull);
    }
};




