'use strict';
var _ = require('lodash');
var _gu = require('gulp-util');
var factory_1 = require('./adapter/factory');
var cache_1 = require('./cache');
var diagnostic_1 = require('./diagnostic');
var result_1 = require('./result');
var util_1 = require('./util');
function newProject(env, ts, _options, _fileNames) {
    var cache = cache_1.newFileCache();
    var formatter = diagnostic_1.newFormatter(env);
    var adapter = factory_1.newAdapter(env, ts);
    var _a = adapter.parseOptions(_options, _fileNames), options = _a.options, fileNames = _a.fileNames, diagnostics = _a.diagnostics;
    if (diagnostics.length) {
        var messages = [];
        messages.push(_gu.colors.red('Invalid compiler options'));
        for (var _i = 0; _i < diagnostics.length; _i++) {
            var diagnostic = diagnostics[_i];
            messages.push(formatter(diagnostic));
        }
        util_1.log(messages.join('\n'));
        throw new util_1.PluginError("Invalid compiler options");
    }
    return { compile: compile, watch: watch };
    function compile() {
        var started = Date.now();
        var compileResult = adapter.compile(options, fileNames, cache);
        var finished = Date.now();
        if (options.diagnostics === true) {
            util_1.log("Compilation completed in " + formatTime(finished - started) + ".");
        }
        if (options.listFiles === true) {
            for (var _i = 0, _a = compileResult.inputFiles; _i < _a.length; _i++) {
                var inputFile = _a[_i];
                console.log(inputFile.fileName);
            }
        }
        return result_1.newResult(options.rootDir, compileResult, formatter);
    }
    function watch(callback) {
        if (!_.isFunction(callback)) {
            throw new util_1.PluginError("The callback argument is not a function");
        }
        if (!cache.watch(onChange)) {
            throw new util_1.PluginError("Already watching");
        }
        callback(recompile());
        function onChange() {
            util_1.log("File change detected. Starting incremental compilation...");
            callback(recompile());
        }
        function recompile() {
            var started = Date.now();
            var compileResult = adapter.compile(options, fileNames, cache);
            var finished = Date.now();
            util_1.log("Compilation completed in " + formatTime(finished - started) + ". Watching for file changes.");
            return result_1.newResult(options.rootDir, compileResult, formatter);
        }
    }
    function formatTime(time) {
        if (time < 1000) {
            return time + 'ms';
        }
        return (time / 1000) + 's';
    }
}
exports.newProject = newProject;
