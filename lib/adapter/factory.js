var _sv = require('semver');
var TS_1_6_1 = require('./TS_1_6');
var TS_1_7_1 = require('./TS_1_7');
var TS_1_8_1 = require('./TS_1_8');
var util_1 = require('../util');
var _lang = require('../lang');
function load(ts) {
    if (!_lang.isObject(ts) || !_lang.isString(ts.version)) {
        throw new util_1.PluginError("The provided object is not a valid TypeScript module");
    }
    if (_sv.satisfies(ts.version, TS_1_8_1.default.VERSION)) {
        return new TS_1_8_1.default(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_7_1.default.VERSION)) {
        return new TS_1_7_1.default(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_6_1.default.VERSION)) {
        return new TS_1_6_1.default(ts);
    }
    throw new util_1.PluginError(("The provided TypeScript module version '" + ts.version + "' is not supported, ") +
        ("supported versions are '" + TS_1_6_1.default.VERSION + "', '" + TS_1_7_1.default.VERSION + "' and  '" + TS_1_8_1.default.VERSION + "'"));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = load;
