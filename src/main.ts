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
    let options = parseOptions(adapter.options(), config, result);
    if (result.diagnostics.length) {
        result.reportDiagnostics();
    }
    else {
        adapter.compile(options, fileNames, result);
        if (result.diagnostics.length) {
            result.reportDiagnostics();
        }
    }

    return result;
}

function findFiles(globs: string[]): string[] {
    let fileNames: string[] = [];

    for (let glob of globs) {
        fileNames = fileNames.concat(_glob.sync(glob, { nodir: true }));
    }

    return fileNames.map(resolvePath).filter(unique);

    function unique<T>(value: T, index: number, array: T[]) {
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

function parseOptions(optionsList: _compiler.Option[],
                      config: Object,
                      result: _compiler.Result): Object {
    let options = Object.create(null);

    let optionsMap = _lang.groupBy(optionsList, 'name');

    _lang.forEach(config, validate);

    if (options.rootDir == null) {
        options.rootDir = resolvePath('.');
    }

    return options;

    function validate(name, value) {
        if (name === S_TYPESCRIPT) {
            // Ignore.
        }
        else if (name in optionsMap) {
            let option = optionsMap[name];
            switch (option.type) {
                case 'string':
                    if (!_lang.isString(value)) {
                        error(`Expected string value of the config property '${name}'`);
                        return;
                    }
                    break;
                case 'number':
                    if (!_lang.isNumber(value)) {
                        error(`Expected number value of the config property '${name}'`);
                        return;
                    }
                    break;
                case 'boolean':
                    if (!_lang.isBoolean(value)) {
                        error(`Expected boolean value of the config property '${name}'`);
                        return;
                    }
                    break;
                default:
                    if (value in <any>option.type) {
                        value = option.type[value];
                    }
                    else {
                        error(`Unknown value '${value}' of the config property '${name}', ` +
                            `expected one of ${Object.keys(option.type).map(s => `'${s}'`).join(', ')}`);
                        return;
                    }
                    break;
            }

            if (option.isFilePath) {
                value = resolvePath(value);
            }

            options[name] = value;
        }
        else {
            error(`Unknown config property '${name}'`);
            return;
        }
    }

    function error(message: string) {
        result.diagnostics.push({
            fileName: null,
            start: null,
            length: null,
            line: null,
            character: null,
            category: _compiler.DiagnosticCategory.Error,
            code: 9999,
            message: message,
            next: null
        });
    }
}

function resolvePath(path: string): string {
    return _path.normalize(_path.resolve(process.cwd(), path));
}

export = plugin;
