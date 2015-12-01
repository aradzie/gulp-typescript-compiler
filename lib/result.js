'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _fs = require('fs');
var _path = require('path');
var _gu = require('gulp-util');
var util_1 = require('./util');
var OutputFile = (function (_super) {
    __extends(OutputFile, _super);
    function OutputFile(options) {
        _super.call(this, options);
        this.sourceMap = null;
    }
    return OutputFile;
})(_gu.File);
exports.OutputFile = OutputFile;
function newResult(env, options, fileNames, result, formatter) {
    var inputFiles = result.inputFiles, outputFiles = result.outputFiles, diagnostics = result.diagnostics, emitSkipped = result.emitSkipped;
    var scripts = [];
    var sourceMaps = [];
    var declarations = [];
    for (var _i = 0; _i < outputFiles.length; _i++) {
        var outputFile = outputFiles[_i];
        createFile(options.rootDir, outputFile.fileName, outputFile.text);
    }
    reportDiagnostics();
    return {
        options: options,
        fileNames: fileNames,
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
        for (var _i = 0; _i < diagnostics.length; _i++) {
            var diagnostic = diagnostics[_i];
            messages.push(formatter(diagnostic));
        }
        if (messages.length) {
            util_1.log(messages.join('\n'));
        }
    }
    function createFile(base, path, data) {
        var file = new OutputFile({
            base: base,
            path: path,
            contents: new Buffer(data)
        });
        var _a = util_1.findExt(path, ['js', 'jsx', 'js.map', 'jsx.map', 'd.ts']), basename = _a.basename, ext = _a.ext;
        switch (ext) {
            case 'js':
            case 'jsx':
                scripts.push(file);
                break;
            case 'js.map':
            case 'jsx.map':
                sourceMaps.push(file);
                break;
            case 'd.ts':
                declarations.push(file);
                break;
            default:
                throw new Error("Unknown extension of file '" + path + "'");
        }
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
