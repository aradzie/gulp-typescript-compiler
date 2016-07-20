import * as _ from "lodash";
import * as _sv from "semver";
import {TS_1_8_Factory} from "./TS_1_8";
import {TS_2_0_Factory} from "./TS_2_0";
import {Adapter} from "./api";
import {PluginError, Env} from "../util";

export function newAdapter(env: Env, ts: any): Adapter {
    if (!_.isObject(ts) || !_.isString(ts.version)) {
        throw new PluginError(`The provided object is not a valid TypeScript module`);
    }
    if (_sv.satisfies(ts.version, TS_2_0_Factory.VERSION)) {
        return TS_2_0_Factory.newAdapter(env, ts);
    }
    if (_sv.satisfies(ts.version, TS_1_8_Factory.VERSION)) {
        return TS_1_8_Factory.newAdapter(env, ts);
    }
    throw new PluginError(`The provided TypeScript module version '${ts.version}' is not supported, ` +
            `supported versions are '${TS_1_8_Factory.VERSION}' and '${TS_2_0_Factory.VERSION}'`);
}
