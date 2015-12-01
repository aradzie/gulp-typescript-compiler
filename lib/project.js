"use strict";
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
        for (var _i = 0; _i < diagnostics.length; _i++) {
            var diagnostic = diagnostics[_i];
            messages.push(formatter(diagnostic));
        }
        _gu.log('TypeScript compiler:\n' + messages.join('\n'));
        throw new util_1.PluginError("Invalid configuration");
    }
    return { env: env, options: options, fileNames: fileNames, compile: compile, watch: watch };
    function compile() {
        var result = result_1.newResult(env, options, fileNames, adapter.compile(options, fileNames, cache), formatter);
        if (options.listFiles === true) {
            for (var _i = 0, _a = result.inputFiles; _i < _a.length; _i++) {
                var inputFile = _a[_i];
                console.log(inputFile.fileName);
            }
        }
        if (options.diagnostics === true) {
        }
        return result;
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
            _gu.log("TypeScript compiler: File change detected. Starting incremental compilation...");
            callback(recompile());
        }
        function recompile() {
            var started = Date.now();
            var result = result_1.newResult(env, options, fileNames, adapter.compile(options, fileNames, cache), formatter);
            var finished = Date.now();
            _gu.log("TypeScript compiler: Compilation completed in " + formatTime(finished - started) + ". Watching for file changes.");
            return result;
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
