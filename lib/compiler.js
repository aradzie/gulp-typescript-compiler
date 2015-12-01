"use strict";
var _ = require('lodash');
var _gu = require('gulp-util');
var factory_1 = require('./adapter/factory');
var cache_1 = require('./cache');
var diagnostic_1 = require('./diagnostic');
var result_1 = require('./result');
var util_1 = require('./util');
function newProject(env, ts, _options, _fileNames) {
    var formatter = diagnostic_1.newFormatter(env);
    var adapter = factory_1.loadAdapter(env, ts);
    var cache = null;
    var result = adapter.parseOptions(_options, _fileNames);
    if (result.diagnostics.length) {
        var messages = [];
        for (var _i = 0, _a = result.diagnostics; _i < _a.length; _i++) {
            var diagnostic = _a[_i];
            messages.push(formatter(diagnostic));
        }
        _gu.log('TypeScript compiler:\n' + messages.join('\n'));
        throw new util_1.PluginError("Invalid configuration");
    }
    var options = result.options, fileNames = result.fileNames;
    return { env: env, options: options, fileNames: fileNames, compile: compile, watch: watch };
    function compile() {
        var result = newResult(adapter.compile(options, fileNames, new cache_1.NullCache()));
        result.reportDiagnostics();
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
        if (cache != null) {
            throw new util_1.PluginError("Already watching");
        }
        cache = new cache_1.WatchingCache(env, ['ts', 'tsx', 'd.ts']);
        cache.on('change', function () {
            _gu.log('TypeScript compiler: File change detected. Starting incremental compilation...');
            callback(recompile());
        });
        callback(recompile());
        function recompile() {
            var result = newResult(adapter.compile(options, fileNames, cache));
            result.reportDiagnostics();
            _gu.log('TypeScript compiler: Compilation complete. Watching for file changes.');
            return result;
        }
    }
    function newResult(compileResult) {
        var result = new result_1.Result();
        result.formatter = formatter;
        result.inputFiles = compileResult.inputFiles;
        result.diagnostics = compileResult.diagnostics;
        result.emitSkipped = compileResult.emitSkipped;
        for (var _i = 0, _a = compileResult.outputFiles; _i < _a.length; _i++) {
            var outputFile = _a[_i];
            result._create(env.cwd, outputFile.fileName, outputFile.text);
        }
        return result;
    }
}
exports.newProject = newProject;
