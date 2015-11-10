var _sv = require('semver');
var _TS_1_6 = require('./TS_1_6');
var _TS_1_7 = require('./TS_1_7');
var _TS_1_8 = require('./TS_1_8');
var _lang = require('../lang');
var _util = require('../util');
function load(ts) {
    if (!_lang.isObject(ts) || !_lang.isString(ts.version)) {
        throw new _util.PluginError("The provided object is not a valid TypeScript module");
    }
    if (_sv.satisfies(ts.version, _TS_1_8.VERSION)) {
        return new _TS_1_8(ts);
    }
    if (_sv.satisfies(ts.version, _TS_1_7.VERSION)) {
        return new _TS_1_7(ts);
    }
    if (_sv.satisfies(ts.version, _TS_1_6.VERSION)) {
        return new _TS_1_6(ts);
    }
    throw new _util.PluginError(("The provided TypeScript module version '" + ts.version + "' is not supported, ") +
        ("supported versions are '" + _TS_1_6.VERSION + "', '" + _TS_1_7.VERSION + "' and  '" + _TS_1_8.VERSION + "'"));
}
exports.load = load;
