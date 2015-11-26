import * as _ from 'lodash';
import * as _sv from 'semver';
import TS_1_6 from './TS_1_6';
import TS_1_7 from './TS_1_7';
import TS_1_8 from './TS_1_8';
import {Adapter} from '../compiler';
import {PluginError} from '../util';

export default function load(ts: any): Adapter {
    if (!_.isObject(ts) || !_.isString(ts.version)) {
        throw new PluginError(`The provided object is not a valid TypeScript module`);
    }
    if (satisfies(ts, TS_1_8.VERSION)) {
        return new TS_1_8(ts);
    }
    if (satisfies(ts, TS_1_7.VERSION)) {
        return new TS_1_7(ts);
    }
    if (satisfies(ts, TS_1_6.VERSION)) {
        return new TS_1_6(ts);
    }
    throw new PluginError(`The provided TypeScript module version '${ts.version}' is not supported, ` +
        `supported versions are '${TS_1_6.VERSION}', '${TS_1_7.VERSION}' and '${TS_1_8.VERSION}'`);

    function satisfies(ts: any, version: string) {
        return _sv.satisfies(ts.version, version) || _sv.satisfies(ts.version, version + '-dev');
    }
}
