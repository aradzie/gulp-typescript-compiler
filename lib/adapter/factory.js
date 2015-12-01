"use strict";
var _ = require('lodash');
var _sv = require('semver');
var TS_1_6_1 = require('./TS_1_6');
var TS_1_7_1 = require('./TS_1_7');
var TS_1_8_1 = require('./TS_1_8');
var util_1 = require('../util');
function loadAdapter(ts) {
    if (!_.isObject(ts) || !_.isString(ts.version)) {
        throw new util_1.PluginError("The provided object is not a valid TypeScript module");
    }
    if (_sv.satisfies(ts.version, TS_1_8_1.TS_1_8_Adapter.VERSION)) {
        return new TS_1_8_1.TS_1_8_Adapter(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_7_1.TS_1_7_Adapter.VERSION)) {
        return new TS_1_7_1.TS_1_7_Adapter(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_6_1.TS_1_6_Adapter.VERSION)) {
        return new TS_1_6_1.TS_1_6_Adapter(ts);
    }
    throw new util_1.PluginError(("The provided TypeScript module version '" + ts.version + "' is not supported, ") +
        ("supported versions are '" + TS_1_6_1.TS_1_6_Adapter.VERSION + "', '" + TS_1_7_1.TS_1_7_Adapter.VERSION + "' and '" + TS_1_8_1.TS_1_8_Adapter.VERSION + "'"));
}
exports.loadAdapter = loadAdapter;
