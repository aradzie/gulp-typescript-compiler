/// <reference path="../typings/tsd.d.ts" />
var compiler_1 = require('./compiler');
var util_1 = require('./util');
var _lang = require('./lang');
var S_TYPESCRIPT = 'typescript';
function plugin(config, globs) {
    return plugin.project(config, globs).compile();
}
var plugin;
(function (plugin) {
    function project(config, globs) {
        var env = util_1.makeEnv();
        if (!_lang.isObject(config)) {
            throw new util_1.PluginError("The config argument is not an object");
        }
        if (!_lang.isString(globs)) {
            if (!Array.isArray(globs) || !globs.every(_lang.isString)) {
                throw new util_1.PluginError("The globs argument is not a string or array of strings");
            }
        }
        else {
            globs = [globs];
        }
        var fileNames = env.glob(globs);
        if (!fileNames.length) {
            throw new util_1.PluginError("The matched file set is empty");
        }
        return new compiler_1.Project(env, loadTypeScript(config), parseConfig(config), fileNames);
    }
    plugin.project = project;
})(plugin || (plugin = {}));
function loadTypeScript(config) {
    if (S_TYPESCRIPT in config) {
        return config[S_TYPESCRIPT];
    }
    else {
        return require('typescript');
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
