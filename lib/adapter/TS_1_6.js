/// <reference path="../d/typescript-1.6.d.ts" />
"use strict";
var _ = require('lodash');
var textfile_1 = require('../textfile');
var diagnostic_1 = require('../diagnostic');
var result_1 = require('../result');
var TS_1_6_Adapter = (function () {
    function TS_1_6_Adapter(_ts) {
        this._ts = _ts;
    }
    TS_1_6_Adapter.prototype.parseOptions = function (env, options, fileNames) {
        var _this = this;
        var result = this._ts.parseConfigFile({
            'compilerOptions': options,
            'files': fileNames
        }, null, env.cwd);
        var fileMap = Object.create(null);
        return {
            options: result.options,
            fileNames: result.fileNames,
            diagnostics: result.errors.map(function (error) { return _this.diagnostic(fileMap, error); })
        };
    };
    TS_1_6_Adapter.prototype.compile = function (options, fileNames, cache) {
        var result = new result_1.Result();
        var host = wrapCompilerHost(this._ts.createCompilerHost(options), cache);
        var program = this._ts.createProgram(fileNames, options, host);
        var fileMap = Object.create(null);
        for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
            var sourceFile = _a[_i];
            var textFile = textfile_1.newTextFile(sourceFile.fileName, sourceFile.text);
            result.inputFiles.push(fileMap[textFile.fileName] = textFile);
        }
        var diagnostics = this._ts.getPreEmitDiagnostics(program);
        if (!options.noEmit) {
            var emitResult = program.emit(undefined, write, undefined);
            result.emitSkipped = emitResult.emitSkipped;
            diagnostics = diagnostics.concat(emitResult.diagnostics);
        }
        for (var _b = 0; _b < diagnostics.length; _b++) {
            var diagnostic = diagnostics[_b];
            result.diagnostics.push(this.diagnostic(fileMap, diagnostic));
        }
        return result;
        function write(fileName, data, writeByteOrderMark) {
            if (writeByteOrderMark) {
                data = '\uFEFF' + data;
            }
            result._create(options.rootDir, fileName, data);
        }
    };
    TS_1_6_Adapter.prototype.diagnostic = function (fileMap, tsd) {
        var cm = (_a = {},
            _a[this._ts.DiagnosticCategory.Warning] = diagnostic_1.DiagnosticCategory.Warning,
            _a[this._ts.DiagnosticCategory.Error] = diagnostic_1.DiagnosticCategory.Error,
            _a[this._ts.DiagnosticCategory.Message] = diagnostic_1.DiagnosticCategory.Message,
            _a
        );
        var cd = diagnostic(tsd);
        if (tsd.file) {
            cd.file = fileMap[tsd.file.fileName];
            cd.start = tsd.start;
            cd.length = tsd.length;
        }
        return cd;
        function diagnostic(tsd) {
            var what = tsd.messageText;
            if (_.isString(what)) {
                return {
                    file: null,
                    start: null,
                    length: null,
                    category: cm[tsd.category],
                    code: tsd.code,
                    message: what,
                    next: null
                };
            }
            else {
                return {
                    file: null,
                    start: null,
                    length: null,
                    category: cm[tsd.category],
                    code: tsd.code,
                    message: what.messageText,
                    next: chain(what.next)
                };
            }
        }
        function chain(tsc) {
            if (tsc) {
                return {
                    category: cm[tsc.category],
                    code: tsc.code,
                    message: tsc.messageText,
                    next: chain(tsc.next)
                };
            }
            else {
                return null;
            }
        }
        var _a;
    };
    TS_1_6_Adapter.VERSION = '~1.6.2';
    return TS_1_6_Adapter;
})();
exports.TS_1_6_Adapter = TS_1_6_Adapter;
function wrapCompilerHost(host, cache) {
    var getSourceFile = host.getSourceFile;
    host.getSourceFile = function getCachedSourceFile(fileName, languageVersion, onError) {
        var sourceFile = cache.getCached(fileName);
        if (sourceFile == null) {
            cache.putCached(fileName, sourceFile = getSourceFile(fileName, languageVersion, onError));
        }
        return sourceFile;
    };
    return host;
}
