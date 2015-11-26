/// <reference path="../typings/tsd.d.ts" />
var _ = require('lodash');
var compiler_1 = require('./compiler');
var util_1 = require('./util');
var S_TYPESCRIPT = 'typescript';
function plugin(config, globs) {
    return plugin.project(config, globs).compile();
}
var plugin;
(function (plugin) {
    function project(config, globs) {
        var env = util_1.makeEnv();
        if (!_.isObject(config)) {
            throw new util_1.PluginError("The config argument is not an object");
        }
        if (!_.isString(globs)) {
            if (!Array.isArray(globs) || !globs.every(_.isString)) {
                throw new util_1.PluginError("The globs argument is not a string or array of strings");
            }
        }
        else {
            globs = [globs];
        }
        var fileNames = env.glob(globs);
        if (fileNames.length === 0) {
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
    _.forEach(config, function (value, name) {
        if (name === S_TYPESCRIPT) {
        }
        else {
            options[name] = value;
        }
    });
    return options;
}
module.exports = plugin;
