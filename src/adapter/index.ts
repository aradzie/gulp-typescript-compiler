import _ts = require('typescript');
import _sv = require('semver');
import _TS_1_6 = require('./TS_1_6');
import _TS_1_7 = require('./TS_1_7');

export interface Adapter {
    //
}

export function load(ts: typeof _ts): Adapter {
    if (_sv.satisfies(ts.version, '^1.6.2')) {
        return new _TS_1_6(ts);
    }
    if (_sv.satisfies(ts.version, '^1.7.0')) {
        return new _TS_1_7(ts);
    }
    throw new Error(`The provided TypeScript version '${ts.version}' is not supported, ` +
        `supported versions are '^1.6.2' and '^1.7.0'`);
}
