import * as _ from "lodash";
import * as _sv from "semver";
import {TS_2_1_Factory} from "./TS_2_1";
import {TS_2_2_Factory} from "./TS_2_2";
import {TS_2_3_Factory} from "./TS_2_3";
import {Adapter} from "./api";
import {PluginError, Env} from "../util";

export function newAdapter(env: Env, ts: any): Adapter {
    if (!_.isObject(ts) || !_.isString(ts.version)) {
        throw new PluginError("The provided object is not a valid TypeScript module");
    }
    if (_sv.satisfies(ts.version, TS_2_3_Factory.VERSION)) {
        return TS_2_3_Factory.newAdapter(env, ts);
    }
    if (_sv.satisfies(ts.version, TS_2_2_Factory.VERSION)) {
        return TS_2_2_Factory.newAdapter(env, ts);
    }
    if (_sv.satisfies(ts.version, TS_2_1_Factory.VERSION)) {
        return TS_2_1_Factory.newAdapter(env, ts);
    }
    throw new PluginError(`The provided TypeScript module version "${ts.version}" is not supported`);
}
