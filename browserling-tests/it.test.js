require("../lib/browser/it");

it.reporter("tap");

require("./it-bdd.test");
require("./it-tdd.test");

it.run();