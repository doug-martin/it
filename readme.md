It
===

Overview
--------

It is a BDD testing framework for node.js. The premise behind it is to be as lightweight as possible while making testing easy and fun to do.

## Installation

    npm install it

##Usage

It contains the following functions to write and run tests.

  * describe - The name of object/context you are testing.
  * should - the action that you are testing/should happen.
  * beforeAll - an action that should happen before all tests in the current context.
  * afterAll - an action that should happen after all tests in the current context.
  * beforeEach - an action that should happen before each test in the current context.
  * afterEach - an action that should happen before each test in the current context.

###Example1

```javascript

    var it = require("it");
    it.describe("My Test", function(it){
         it.should("run this test", function(){
            assert.ok(true);
         });
        it.run();
    });

```

License
-------

MIT <https://github.com/doug-martin/it/raw/master/LICENSE>

Meta
----

* Code: `git clone git://github.com/doug-martin/it.git`
