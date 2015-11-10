/// <reference path="../typings/tsd.d.ts" />

import test = require('tape');

import util = require('../lib/util');

test('example test', function (t) {
    t.plan(3);

    t.equal(1, 1);
    t.equal(2, 2);
    t.equal(3, 3);
});
