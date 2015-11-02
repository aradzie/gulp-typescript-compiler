import _sv = require('semver');
import _TS_1_6 = require('./TS_1_6');
import _TS_1_7 = require('./TS_1_7');
import _compiler = require('../compiler');
import _lang = require('../lang');
import _util = require('../util');

export function load(ts: any): _compiler.Compiler {
    if (!_lang.isObject(ts) || !_lang.isString(ts.version)) {
        throw new _util.PluginError(`The provided object is not a valid TypeScript module`);
    }
    if (_sv.satisfies(ts.version, _TS_1_6.VERSION)) {
        return new _TS_1_6(ts);
    }
    if (_sv.satisfies(ts.version, _TS_1_7.VERSION)) {
        return new _TS_1_7(ts);
    }
    throw new _util.PluginError(`The provided TypeScript module version '${ts.version}' is not supported, ` +
        `supported versions are '${_TS_1_6.VERSION}' and '${_TS_1_7.VERSION}'`);
}
