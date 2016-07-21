/// <reference path="typescript-1.8.d.ts" />
"use strict";
const _ = require("lodash");
const textfile_1 = require("../textfile");
const diagnostic_1 = require("../diagnostic");
exports.TS_1_8_Factory = {
    VERSION: "~1.8.10", newAdapter,
};
function newAdapter(env, ts) {
    return {
        parseOptions,
        compile,
    };
    function parseOptions(options, fileNames) {
        const parseResult = ts.parseJsonConfigFileContent({
            "compilerOptions": options,
            "files": fileNames,
        }, null, env.cwd);
        return {
            options: parseResult.options,
            fileNames: parseResult.fileNames,
            diagnostics: mapDiagnostics(newFileMap(), parseResult.errors),
        };
    }
    function compile(options, fileNames, cache) {
        const host = wrapCompilerHost(ts.createCompilerHost(options), cache);
        const program = ts.createProgram(fileNames, options, host);
        const fileMap = newFileMap();
        const inputFiles = [];
        const outputFiles = [];
        let diagnostics = ts.getPreEmitDiagnostics(program);
        let emitSkipped = true;
        for (const sourceFile of program.getSourceFiles()) {
            const textFile = textfile_1.newTextFile(sourceFile.fileName, sourceFile.text);
            inputFiles.push(fileMap[textFile.fileName] = textFile);
        }
        if (!options.noEmit) {
            const emitResult = program.emit(undefined, write, undefined);
            emitSkipped = emitResult.emitSkipped;
            if (!emitSkipped) {
                diagnostics = diagnostics.concat(emitResult.diagnostics);
            }
        }
        return {
            inputFiles,
            outputFiles,
            diagnostics: mapDiagnostics(fileMap, diagnostics),
            emitSkipped,
        };
        function write(fileName, data, writeByteOrderMark) {
            if (writeByteOrderMark) {
                data = "\uFEFF" + data;
            }
            outputFiles.push(textfile_1.newTextFile(fileName, data));
        }
    }
    function mapDiagnostics(fileMap, tsd) {
        return tsd.map(v => mapDiagnostic(fileMap, v));
    }
    function mapDiagnostic(fileMap, tsd) {
        const cm = {
            [ts.DiagnosticCategory.Warning]: diagnostic_1.DiagnosticCategory.Warning,
            [ts.DiagnosticCategory.Error]: diagnostic_1.DiagnosticCategory.Error,
            [ts.DiagnosticCategory.Message]: diagnostic_1.DiagnosticCategory.Message,
        };
        const cd = newDiagnostic(tsd);
        if (tsd.file) {
            cd.file = fileMap[tsd.file.fileName];
            cd.start = tsd.start;
            cd.length = tsd.length;
        }
        return cd;
        function newDiagnostic(tsd) {
            const what = tsd.messageText;
            if (_.isString(what)) {
                return {
                    file: null,
                    start: null,
                    length: null,
                    category: cm[tsd.category],
                    code: tsd.code,
                    message: what,
                    next: null,
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
                    next: newChain(what.next),
                };
            }
        }
        function newChain(tsc) {
            if (tsc) {
                return {
                    category: cm[tsc.category],
                    code: tsc.code,
                    message: tsc.messageText,
                    next: newChain(tsc.next),
                };
            }
            else {
                return null;
            }
        }
    }
    function newFileMap() {
        return Object.create(null);
    }
    function wrapCompilerHost(host, cache) {
        const getSourceFile = host.getSourceFile;
        host.getSourceFile = function (fileName, languageVersion, onError) {
            let sourceFile = cache.getCached(fileName);
            if (sourceFile == null) {
                cache.putCached(fileName, sourceFile = getSourceFile(fileName, languageVersion, onError));
            }
            return sourceFile;
        };
        const fileExists = host.fileExists;
        host.fileExists = function (fileName) {
            if (cache.getCached(fileName) != null) {
                return true;
            }
            return fileExists(fileName);
        };
        return host;
    }
}
