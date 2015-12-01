'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var _stream = require('stream');
var _gu = require('gulp-util');
var factory_1 = require('./adapter/factory');
var cache_1 = require('./cache');
var diagnostic_1 = require('./diagnostic');
var result_1 = require('./result');
var vfs_1 = require('./vfs');
var util_1 = require('./util');
function newProject(env, ts, _options, _fileNames) {
    var sys = ts.sys;
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
    return { options: options, fileNames: fileNames, compile: compile, watch: watch, stream: stream };
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
        return result_1.newResult(options, fileNames, compileResult, formatter);
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
            return result_1.newResult(options, fileNames, compileResult, formatter);
        }
    }
    function stream() {
        var fileList = [];
        return new (function (_super) {
            __extends(CompileStream, _super);
            function CompileStream() {
                _super.call(this, { objectMode: true });
            }
            CompileStream.prototype._write = function (file, encoding, cb) {
                if (file.isNull()) {
                    cb();
                    return;
                }
                if (file.isStream()) {
                    cb(new util_1.PluginError("Streaming not supported"));
                    return;
                }
                fileList.push(file);
                cb();
            };
            CompileStream.prototype._read = function () { };
            CompileStream.prototype.end = function (chunk, encoding, cb) {
                ts.sys = vfs_1.patch(sys, fileList);
                try {
                    var result = compile();
                    if (!result.emitSkipped) {
                        for (var _i = 0, _a = result.scripts; _i < _a.length; _i++) {
                            var file = _a[_i];
                            this.push(file);
                        }
                        for (var _b = 0, _c = result.sourceMaps; _b < _c.length; _b++) {
                            var file = _c[_b];
                            this.push(file);
                        }
                        for (var _d = 0, _e = result.declarations; _d < _e.length; _d++) {
                            var file = _e[_d];
                            this.push(file);
                        }
                    }
                    this.push(null);
                }
                finally {
                    ts.sys = sys;
                }
            };
            return CompileStream;
        })(_stream.Duplex);
    }
    function formatTime(time) {
        if (time < 1000) {
            return time + 'ms';
        }
        return (time / 1000) + 's';
    }
}
exports.newProject = newProject;
