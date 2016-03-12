"use strict";
var _fs = require('fs');
var _path = require('path');
var _gu = require('gulp-util');
var util_1 = require('./util');
var EXT_JS = 'js';
var EXT_JSX = 'jsx';
var EXT_JS_MAP = 'js.map';
var EXT_JSX_MAP = 'jsx.map';
var EXT_D_TS = 'd.ts';
var EXT_LIST = [EXT_JS, EXT_JSX, EXT_JS_MAP, EXT_JSX_MAP, EXT_D_TS];
function newResult(rootDir, result, formatter) {
    var inputFiles = result.inputFiles, outputFiles = result.outputFiles, diagnostics = result.diagnostics, emitSkipped = result.emitSkipped;
    var scripts = [];
    var sourceMaps = [];
    var declarations = [];
    var fileMap = Object.create(null);
    for (var _i = 0, outputFiles_1 = outputFiles; _i < outputFiles_1.length; _i++) {
        var outputFile = outputFiles_1[_i];
        createScriptFile(outputFile);
    }
    for (var _a = 0, outputFiles_2 = outputFiles; _a < outputFiles_2.length; _a++) {
        var outputFile = outputFiles_2[_a];
        createAndLinkNonScriptFile(outputFile);
    }
    reportDiagnostics();
    return {
        inputFiles: inputFiles,
        diagnostics: diagnostics,
        emitSkipped: emitSkipped,
        scripts: scripts,
        sourceMaps: sourceMaps,
        declarations: declarations,
        emit: emit,
        emitScripts: emitScripts,
        emitSourceMaps: emitSourceMaps,
        emitDeclarations: emitDeclarations,
        writeFiles: writeFiles,
        writeFilesAsync: writeFilesAsync
    };
    function emit() {
        return new util_1.PassThroughStream([].concat(scripts, sourceMaps, declarations));
    }
    function emitScripts() {
        return new util_1.PassThroughStream(scripts);
    }
    function emitSourceMaps() {
        return new util_1.PassThroughStream(sourceMaps);
    }
    function emitDeclarations() {
        return new util_1.PassThroughStream(declarations);
    }
    function writeFiles() {
        for (var _i = 0, _a = [].concat(scripts, sourceMaps, declarations); _i < _a.length; _i++) {
            var file = _a[_i];
            writeFileSync(file.path, file.contents, { encoding: 'UTF-8' });
        }
    }
    function writeFilesAsync() {
        return Promise.reject(new Error('Not implemented'));
    }
    function reportDiagnostics() {
        var messages = [];
        if (emitSkipped) {
            messages.push(_gu.colors.red('Emit skipped'));
        }
        else if (diagnostics.length) {
            messages.push(_gu.colors.red('Emit completed with errors'));
        }
        for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
            var diagnostic = diagnostics_1[_i];
            messages.push(formatter(diagnostic));
        }
        if (messages.length) {
            util_1.log(messages.join('\n'));
        }
    }
    function createScriptFile(file) {
        var _a = util_1.findExt(file.fileName, EXT_LIST), basename = _a.basename, ext = _a.ext;
        switch (ext) {
            case EXT_JS:
            case EXT_JSX:
                scripts.push(fileMap[basename] = newOutputFile(file));
                break;
        }
    }
    function createAndLinkNonScriptFile(file) {
        var _a = util_1.findExt(file.fileName, EXT_LIST), basename = _a.basename, ext = _a.ext;
        switch (ext) {
            case EXT_JS_MAP:
            case EXT_JSX_MAP:
                sourceMaps.push(fileMap[basename]._sourceMapFile = newOutputFile(file));
                break;
            case EXT_D_TS:
                declarations.push(fileMap[basename]._declarationFile = newOutputFile(file));
                break;
        }
    }
    function newOutputFile(file) {
        var result = new _gu.File({
            base: rootDir,
            path: file.fileName,
            contents: new Buffer(file.text)
        });
        result._textFile = file;
        return result;
    }
}
exports.newResult = newResult;
function writeFileSync(path, data, options) {
    if (options === void 0) { options = { encoding: 'UTF-8' }; }
    mkdirpSync(_path.dirname(path));
    _fs.writeFileSync(path, data, options);
    function mkdirpSync(path) {
        try {
            var stats = _fs.statSync(path);
            if (stats.isDirectory()) {
                return;
            }
        }
        catch (ex) { }
        mkdirpSync(_path.dirname(path));
        _fs.mkdirSync(path);
    }
}
