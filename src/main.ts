/// <reference path="../typings/tsd.d.ts" />

import _fs = require('fs');
import _path = require('path');
import _glob = require('glob');
import _util = require('./util');
import _compiler = require('./compiler');
import _adapter = require('./adapter');
import _lang = require('./lang');

const S_TYPESCRIPT = 'typescript';

function plugin(config: Object, globs: string | string[]) {
    let result = new _compiler.Result();

    if (!_lang.isObject(config)) {
        throw new _util.PluginError(`The config argument is not an object`);
    }
    if (!_lang.isString(globs)) {
        if (!Array.isArray(globs) || !globs.every(_lang.isString)) {
            throw new _util.PluginError(`The globs argument is not a string or array of strings`);
        }
    }
    else {
        globs = [<string>globs];
    }

    let fileNames = findFiles(<string[]>globs);
    if (!fileNames.length) {
        throw new _util.PluginError(`The matched file set is empty`);
    }

    let adapter = loadAdapter(config);
    adapter.compile(parseConfig(config), fileNames, result);
    if (result.diagnostics.length) {
        result.reportDiagnostics();
    }

    return result;
}

function findFiles(globs: string[]): string[] {
    let fileNames: string[] = [];

    for (let glob of globs) {
        fileNames = fileNames.concat(_glob.sync(glob, { nodir: true }));
    }

    return fileNames.map(resolvePath).filter(unique);

    function resolvePath(path: string): string {
        return _path.normalize(_path.resolve(process.cwd(), path));
    }

    function unique<T>(value: T, index: number, array: T[]): boolean {
        return array.indexOf(value) === index;
    }
}

function loadAdapter(config: Object): _compiler.Compiler {
    if (S_TYPESCRIPT in config) {
        return _adapter.load(config[S_TYPESCRIPT]);
    }
    else {
        return _adapter.load(require('typescript'));
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
