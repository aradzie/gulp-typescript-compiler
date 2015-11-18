import * as _sv from 'semver';
import TS_1_6 from './TS_1_6';
import TS_1_7 from './TS_1_7';
import TS_1_8 from './TS_1_8';
import {Adapter} from '../compiler';
import {PluginError} from '../util';
import * as _lang from '../lang';

export default function load(ts: any): Adapter {
    if (!_lang.isObject(ts) || !_lang.isString(ts.version)) {
        throw new PluginError(`The provided object is not a valid TypeScript module`);
    }
    if (_sv.satisfies(ts.version, TS_1_8.VERSION)) {
        return new TS_1_8(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_7.VERSION)) {
        return new TS_1_7(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_6.VERSION)) {
        return new TS_1_6(ts);
    }
    throw new PluginError(`The provided TypeScript module version '${ts.version}' is not supported, ` +
        `supported versions are '${TS_1_6.VERSION}', '${TS_1_7.VERSION}' and  '${TS_1_8.VERSION}'`);
}
