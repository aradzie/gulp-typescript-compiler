"use strict";
const _ = require("lodash");
const _gu = require("gulp-util");
const factory_1 = require("./adapter/factory");
const cache_1 = require("./cache");
const diagnostic_1 = require("./diagnostic");
const result_1 = require("./result");
const util_1 = require("./util");
function newProject(env, ts, _options, _fileNames) {
    const cache = cache_1.newFileCache();
    const formatter = diagnostic_1.newFormatter(env);
    const adapter = factory_1.newAdapter(env, ts);
    const { options, fileNames, diagnostics } = adapter.parseOptions(_options, _fileNames);
    if (diagnostics.length) {
        const messages = [];
        messages.push(_gu.colors.red("Invalid compiler options"));
        for (const diagnostic of diagnostics) {
            messages.push(formatter(diagnostic));
        }
        util_1.log(messages.join("\n"));
        throw new util_1.PluginError(`Invalid compiler options`);
    }
    return {
        compile,
        watch,
    };
    function compile() {
        const started = Date.now();
        const compileResult = adapter.compile(options, fileNames, cache);
        const finished = Date.now();
        if (options.diagnostics === true) {
            util_1.log(`Compilation completed in ${formatTime(finished - started)}.`);
        }
        if (options.listFiles === true) {
            for (const inputFile of compileResult.inputFiles) {
                console.log(inputFile.fileName);
            }
        }
        return result_1.newResult(options.rootDir, compileResult, formatter);
    }
    function watch(callback) {
        if (!_.isFunction(callback)) {
            throw new util_1.PluginError(`The callback argument is not a function`);
        }
        if (!cache.watch(onChange)) {
            throw new util_1.PluginError(`Already watching`);
        }
        callback(recompile());
        function onChange() {
            util_1.log(`File change detected. Starting incremental compilation...`);
            callback(recompile());
        }
        function recompile() {
            const started = Date.now();
            const compileResult = adapter.compile(options, fileNames, cache);
            const finished = Date.now();
            util_1.log(`Compilation completed in ${formatTime(finished - started)}. Watching for file changes.`);
            return result_1.newResult(options.rootDir, compileResult, formatter);
        }
    }
    function formatTime(time) {
        if (time < 1000) {
            return time + "ms";
        }
        return (time / 1000) + "s";
    }
}
exports.newProject = newProject;
