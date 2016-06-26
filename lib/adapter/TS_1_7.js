/// <reference path="typescript-1.7.d.ts" />
"use strict";
var _ = require('lodash');
var textfile_1 = require('../textfile');
var diagnostic_1 = require('../diagnostic');
exports.TS_1_7_Factory = {
    VERSION: '~1.7.5', newAdapter: newAdapter
};
function newAdapter(env, ts) {
    return { parseOptions: parseOptions, compile: compile };
    function parseOptions(options, fileNames) {
        var parseResult = ts.parseJsonConfigFileContent({
            'compilerOptions': options,
            'files': fileNames
        }, null, env.cwd);
        return {
            options: parseResult.options,
            fileNames: parseResult.fileNames,
            diagnostics: mapDiagnostics(newFileMap(), parseResult.errors)
        };
    }
    function compile(options, fileNames, cache) {
        var host = wrapCompilerHost(ts.createCompilerHost(options), cache);
        var program = ts.createProgram(fileNames, options, host);
        var fileMap = newFileMap();
        var inputFiles = [];
        var outputFiles = [];
        var diagnostics = ts.getPreEmitDiagnostics(program);
        var emitSkipped = true;
        for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
            var sourceFile = _a[_i];
            var textFile = textfile_1.newTextFile(sourceFile.fileName, sourceFile.text);
            inputFiles.push(fileMap[textFile.fileName] = textFile);
        }
        if (!options.noEmit) {
            var emitResult = program.emit(undefined, write, undefined);
            diagnostics = diagnostics.concat(emitResult.diagnostics);
            emitSkipped = emitResult.emitSkipped;
        }
        return {
            inputFiles: inputFiles,
            outputFiles: outputFiles,
            diagnostics: mapDiagnostics(fileMap, diagnostics),
            emitSkipped: emitSkipped
        };
        function write(fileName, data, writeByteOrderMark) {
            if (writeByteOrderMark) {
                data = '\uFEFF' + data;
            }
            outputFiles.push(textfile_1.newTextFile(fileName, data));
        }
    }
    function mapDiagnostics(fileMap, tsd) {
        return tsd.map(function (v) { return mapDiagnostic(fileMap, v); });
    }
    function mapDiagnostic(fileMap, tsd) {
        var cm = (_a = {},
            _a[ts.DiagnosticCategory.Warning] = diagnostic_1.DiagnosticCategory.Warning,
            _a[ts.DiagnosticCategory.Error] = diagnostic_1.DiagnosticCategory.Error,
            _a[ts.DiagnosticCategory.Message] = diagnostic_1.DiagnosticCategory.Message,
            _a
        );
        var cd = newDiagnostic(tsd);
        if (tsd.file) {
            cd.file = fileMap[tsd.file.fileName];
            cd.start = tsd.start;
            cd.length = tsd.length;
        }
        return cd;
        function newDiagnostic(tsd) {
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
                    next: newChain(what.next)
                };
            }
        }
        function newChain(tsc) {
            if (tsc) {
                return {
                    category: cm[tsc.category],
                    code: tsc.code,
                    message: tsc.messageText,
                    next: newChain(tsc.next)
                };
            }
            else {
                return null;
            }
        }
        var _a;
    }
    function newFileMap() {
        return Object.create(null);
    }
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
}
