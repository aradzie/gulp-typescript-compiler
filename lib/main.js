/// <reference path="../typings/tsd.d.ts" />
var _path = require('path');
var _glob = require('glob');
var _util = require('./util');
var _compiler = require('./compiler');
var _adapter = require('./adapter');
var _lang = require('./lang');
var S_TYPESCRIPT = 'typescript';
function plugin(config, globs) {
    var result = new _compiler.Result();
    if (!_lang.isObject(config)) {
        throw new _util.PluginError("The config argument is not an object");
    }
    if (!_lang.isString(globs)) {
        if (!Array.isArray(globs) || !globs.every(_lang.isString)) {
            throw new _util.PluginError("The globs argument is not a string or array of strings");
        }
    }
    else {
        globs = [globs];
    }
    var fileNames = findFiles(globs);
    if (!fileNames.length) {
        throw new _util.PluginError("The matched file set is empty");
    }
    var adapter = loadAdapter(config);
    adapter.compile(parseConfig(config), fileNames, result);
    if (result.diagnostics.length) {
        result.reportDiagnostics();
    }
    return result;
}
function findFiles(globs) {
    var fileNames = [];
    for (var _i = 0; _i < globs.length; _i++) {
        var glob = globs[_i];
        fileNames = fileNames.concat(_glob.sync(glob, { nodir: true }));
    }
    return fileNames.map(resolvePath).filter(unique);
    function resolvePath(path) {
        return _path.normalize(_path.resolve(process.cwd(), path));
    }
    function unique(value, index, array) {
        return array.indexOf(value) === index;
    }
}
function loadAdapter(config) {
    if (S_TYPESCRIPT in config) {
        return _adapter.load(config[S_TYPESCRIPT]);
    }
    else {
        return _adapter.load(require('typescript'));
    }
}
function parseConfig(config) {
    var options = Object.create(null);
    _lang.forEach(config, function (name, value) {
        if (name === S_TYPESCRIPT) {
        }
        else {
            options[name] = value;
        }
    });
    return options;
}
module.exports = plugin;
