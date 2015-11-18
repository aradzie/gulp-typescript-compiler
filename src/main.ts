/// <reference path="../typings/tsd.d.ts" />

import {Project, Result} from './compiler';
import {PluginError, Env, makeEnv} from './util';
import * as _lang from './lang';

const S_TYPESCRIPT = 'typescript';

function plugin(config: Object, globs: string | string[]): Result {
    return plugin.project(config, globs).compile();
}

namespace plugin {
    export function project(config: Object, globs: string | string[]): Project {
        let env = makeEnv();

        if (!_lang.isObject(config)) {
            throw new PluginError(`The config argument is not an object`);
        }
        if (!_lang.isString(globs)) {
            if (!Array.isArray(globs) || !globs.every(_lang.isString)) {
                throw new PluginError(`The globs argument is not a string or array of strings`);
            }
        }
        else {
            globs = [globs as string];
        }

        let fileNames = env.glob(globs as string[]);
        if (!fileNames.length) {
            throw new PluginError(`The matched file set is empty`);
        }

        return new Project(env, loadTypeScript(config), parseConfig(config), fileNames);
    }
}

function loadTypeScript(config: Object): any {
    if (S_TYPESCRIPT in config) {
        return config[S_TYPESCRIPT];
    }
    else {
        return require('typescript');
    }
}

function parseConfig(config: Object): Object {
    let options = Object.create(null);

    _lang.forEach(config, (name, value) => {
        if (name === S_TYPESCRIPT) {
            // Ignore.
        }
        else {
            options[name] = value;
        }
    });

    return options;
}

export = plugin;
