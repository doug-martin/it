(function () {
    "use strict";
    function __defineIt() {
        "use strict";
        var _ = require("../extended"),
            merge = _.merge,
            interfaces = require("../interfaces"),
            Reporter = require("../formatters/reporter");

        require("./formatters/html");
        require("../formatters/tap");

        var it = {
            assert: require("../extension"),


            reporter: function reporter(r, args) {
                interfaces.reporter(Reporter.getInstance(r, args));
            },


            /**@lends it*/
            printSummary: function printSummary() {
                interfaces.printSummary();
            },

            /**
             * Run all tests that are currently registered.
             * @return {comb.Promise} a promise that is resolved once all tests are done running.
             */
            run: function run(filter) {
                return interfaces.run(filter);
            }

        };

        _(interfaces).forEach(function (val) {
            it = merge({}, val, it);
        });
        if (typeof window !== "undefined") {
            it.reporter("html", "it");
        } else {
            it.reporter("tap");
        }

        /**
         * Entry point for writing tests with it.
         * @namespace
         * @name it
         * @ignoreCode code
         */
        return it;
    }

    if (process.title !== "browser") {
        module.exports = __defineIt();
    } else if ("function" === typeof this.define && this.define.amd) {
        define([], function () {
            return __defineIt();
        });
    } else {
        this.it = __defineIt();
    }
}).call(typeof window !== "undefined" ? window : global);