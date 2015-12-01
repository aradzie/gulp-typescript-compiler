/// <reference path="../typings/tsd.d.ts" />

'use strict';

import * as _ from 'lodash';
import {Project, newProject} from './project';
import {Result} from './result';
import {PluginError, Env, newEnv} from './util';

const S_TYPESCRIPT = 'typescript';

function plugin(config: Object, globs: string | string[]): Result {
    return plugin.project(config, globs).compile();
}

namespace plugin {
    export function project(config: Object, globs: string | string[]): Project {
        let env = newEnv();

        if (!_.isObject(config)) {
            throw new PluginError(`The config argument is not an object`);
        }
        if (!_.isString(globs)) {
            if (!Array.isArray(globs) || !globs.every(_.isString)) {
                throw new PluginError(`The globs argument is not a string or array of strings`);
            }
        }
        else {
            globs = [globs as string];
        }

        let fileNames = env.glob(globs as string[]);
        if (fileNames.length == 0) {
            throw new PluginError(`The matched file set is empty`);
        }

        return newProject(env, loadTypeScript(config), parseConfig(config), fileNames);
    }
}

function loadTypeScript(config: _.Dictionary<any>): any {
    if (S_TYPESCRIPT in config) {
        return config[S_TYPESCRIPT];
    }
    else {
        return require('typescript');
    }
}

function parseConfig(config: _.Dictionary<any>): Object {
    let options = Object.create(null);

    _.forEach(config, (value, name) => {
        if (name == S_TYPESCRIPT) {
            // Ignore.
        }
        else {
            options[name] = value;
        }
    });

    return options;
}

export = plugin;
