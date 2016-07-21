"use strict";
const _ = require("lodash");
const _sv = require("semver");
const TS_1_8_1 = require("./TS_1_8");
const TS_2_0_1 = require("./TS_2_0");
const util_1 = require("../util");
function newAdapter(env, ts) {
    if (!_.isObject(ts) || !_.isString(ts.version)) {
        throw new util_1.PluginError("The provided object is not a valid TypeScript module");
    }
    if (_sv.satisfies(ts.version, TS_2_0_1.TS_2_0_Factory.VERSION)) {
        return TS_2_0_1.TS_2_0_Factory.newAdapter(env, ts);
    }
    if (_sv.satisfies(ts.version, TS_1_8_1.TS_1_8_Factory.VERSION)) {
        return TS_1_8_1.TS_1_8_Factory.newAdapter(env, ts);
    }
    throw new util_1.PluginError(`The provided TypeScript module version "${ts.version}" is not supported, ` +
        `supported versions are '${TS_1_8_1.TS_1_8_Factory.VERSION}' and '${TS_2_0_1.TS_2_0_Factory.VERSION}'`);
}
exports.newAdapter = newAdapter;
