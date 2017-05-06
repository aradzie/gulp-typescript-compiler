"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const _sv = require("semver");
const TS_2_1_1 = require("./TS_2_1");
const TS_2_2_1 = require("./TS_2_2");
const TS_2_3_1 = require("./TS_2_3");
const util_1 = require("../util");
function newAdapter(env, ts) {
    if (!_.isObject(ts) || !_.isString(ts.version)) {
        throw new util_1.PluginError("The provided object is not a valid TypeScript module");
    }
    if (_sv.satisfies(ts.version, TS_2_3_1.TS_2_3_Factory.VERSION)) {
        return TS_2_3_1.TS_2_3_Factory.newAdapter(env, ts);
    }
    if (_sv.satisfies(ts.version, TS_2_2_1.TS_2_2_Factory.VERSION)) {
        return TS_2_2_1.TS_2_2_Factory.newAdapter(env, ts);
    }
    if (_sv.satisfies(ts.version, TS_2_1_1.TS_2_1_Factory.VERSION)) {
        return TS_2_1_1.TS_2_1_Factory.newAdapter(env, ts);
    }
    throw new util_1.PluginError(`The provided TypeScript module version "${ts.version}" is not supported`);
}
exports.newAdapter = newAdapter;
