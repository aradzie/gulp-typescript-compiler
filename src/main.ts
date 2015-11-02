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
    let output = new _compiler.Output();

    if (!_lang.isObject(config)) {
        throw new _util.PluginError(`The config argument is not an object`);
    }
    if (!_lang.isString(globs)) {
        if (!Array.isArray(globs)) {
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
    let options = parseOptions(adapter.options(), config, output);
    if (output.diagnostics.length) {
        output.reportDiagnostics();
    }
    else {
        adapter.compile(options, fileNames, output);
        if (output.diagnostics.length) {
            output.reportDiagnostics();
        }
    }

    return output;
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
                      output: _compiler.Output): Object {
    let result = Object.create(null);

    let optionsMap = _lang.groupBy(optionsList, 'name');

    _lang.forEach(config, validate);

    if (result.rootDir == null) {
        result.rootDir = resolvePath('.');
    }

    return result;

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

            result[name] = value;
        }
        else {
            error(`Unknown config property '${name}'`);
            return;
        }
    }

    function error(message: string) {
        output.diagnostics.push({
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
