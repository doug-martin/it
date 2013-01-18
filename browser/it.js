(function () {
    "use strict";
    function __defineIt() {
        "use strict";
        var _ = require("../lib/extended"),
            merge = _.merge,
            formatters = require("../lib/formatters"),
            interfaces = require("../lib/interfaces");

        var it = {
            /**@lends it*/

            reporter: function reporter(r) {
                interfaces.reporter(formatters.getReporter(r));
            },

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


        /**
         * Entry point for writing tests with it.
         * @namespace
         * @name it
         * @ignoreCode code
         */
        return it;
    }

    if ("function" === typeof this.define && this.define.amd) {
        define([], function () {
            return __defineIt();
        });
    } else {
        this.it = __defineIt();
    }
}).call(window);