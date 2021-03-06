"use strict";
const _ = require("lodash");
const project_1 = require("./project");
const util_1 = require("./util");
const S_TYPESCRIPT = "typescript";
function plugin(config, globs) {
    return plugin.project(config, globs).compile();
}
(function (plugin) {
    function project(config, globs) {
        const env = util_1.newEnv();
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
        const fileNames = env.glob(globs);
        if (fileNames.length == 0) {
            throw new util_1.PluginError("The matched file set is empty");
        }
        return project_1.newProject(env, loadTypeScript(config), parseConfig(config), fileNames);
    }
    plugin.project = project;
})(plugin || (plugin = {}));
function loadTypeScript(config) {
    if (S_TYPESCRIPT in config) {
        return config[S_TYPESCRIPT];
    }
    else {
        return require("typescript");
    }
}
function parseConfig(config) {
    const options = Object.create(null);
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
module.exports = plugin;
