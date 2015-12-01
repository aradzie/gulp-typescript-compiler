"use strict";

import * as _ from 'lodash';
import * as _sv from 'semver';
import {TS_1_6_Adapter} from './TS_1_6';
import {TS_1_7_Adapter} from './TS_1_7';
import {TS_1_8_Adapter} from './TS_1_8';
import {Adapter} from '../compiler';
import {PluginError} from '../util';

export function loadAdapter(ts: any): Adapter {
    if (!_.isObject(ts) || !_.isString(ts.version)) {
        throw new PluginError(`The provided object is not a valid TypeScript module`);
    }
    if (_sv.satisfies(ts.version, TS_1_8_Adapter.VERSION)) {
        return new TS_1_8_Adapter(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_7_Adapter.VERSION)) {
        return new TS_1_7_Adapter(ts);
    }
    if (_sv.satisfies(ts.version, TS_1_6_Adapter.VERSION)) {
        return new TS_1_6_Adapter(ts);
    }
    throw new PluginError(`The provided TypeScript module version '${ts.version}' is not supported, ` +
        `supported versions are '${TS_1_6_Adapter.VERSION}', '${TS_1_7_Adapter.VERSION}' and '${TS_1_8_Adapter.VERSION}'`);
}
