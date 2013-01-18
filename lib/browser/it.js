(function () {
    "use strict";
    function __defineIt() {
        "use strict";
        var _ = require("../extended"),
            merge = _.merge,
            interfaces = require("../interfaces"),
            HtmlReporter = require("./formatters/html");


        var it = {
            assert: require("../extension"),

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

        interfaces.reporter(new HtmlReporter("it"));

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