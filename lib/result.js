"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _fs = require("fs");
const _path = require("path");
const _gu = require("gulp-util");
const util_1 = require("./util");
const EXT_JS = "js";
const EXT_JSX = "jsx";
const EXT_JS_MAP = "js.map";
const EXT_JSX_MAP = "jsx.map";
const EXT_D_TS = "d.ts";
const EXT_LIST = [EXT_JS, EXT_JSX, EXT_JS_MAP, EXT_JSX_MAP, EXT_D_TS];
function newResult(rootDir, result, formatter) {
    const { inputFiles, outputFiles, diagnostics, emitSkipped } = result;
    const scripts = [];
    const sourceMaps = [];
    const declarations = [];
    const fileMap = Object.create(null);
    for (const outputFile of outputFiles) {
        createScriptFile(outputFile);
    }
    for (const outputFile of outputFiles) {
        createAndLinkNonScriptFile(outputFile);
    }
    reportDiagnostics();
    return {
        inputFiles,
        diagnostics,
        emitSkipped,
        scripts,
        sourceMaps,
        declarations,
        emit,
        emitScripts,
        emitSourceMaps,
        emitDeclarations,
        writeFiles,
        writeFilesAsync,
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
        for (const file of [].concat(scripts, sourceMaps, declarations)) {
            writeFileSync(file.path, file.contents, { encoding: "UTF-8" });
        }
    }
    function writeFilesAsync() {
        return Promise.reject(new Error("Not implemented"));
    }
    function reportDiagnostics() {
        const messages = [];
        if (emitSkipped) {
            messages.push(_gu.colors.red("Emit skipped"));
        }
        else if (diagnostics.length) {
            messages.push(_gu.colors.red("Emit completed with errors"));
        }
        for (const diagnostic of diagnostics) {
            messages.push(formatter(diagnostic));
        }
        if (messages.length) {
            util_1.log(messages.join("\n"));
        }
    }
    function createScriptFile(file) {
        const { basename, ext } = util_1.findExt(file.fileName, EXT_LIST);
        switch (ext) {
            case EXT_JS:
            case EXT_JSX:
                scripts.push(fileMap[basename] = newOutputFile(file));
                break;
        }
    }
    function createAndLinkNonScriptFile(file) {
        const { basename, ext } = util_1.findExt(file.fileName, EXT_LIST);
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
        const result = new _gu.File({
            base: rootDir,
            path: file.fileName,
            contents: new Buffer(file.text),
        });
        result._textFile = file;
        return result;
    }
}
exports.newResult = newResult;
function writeFileSync(path, data, options = { encoding: "UTF-8" }) {
    mkdirpSync(_path.dirname(path));
    _fs.writeFileSync(path, data, options);
    function mkdirpSync(path) {
        try {
            const stats = _fs.statSync(path);
            if (stats.isDirectory()) {
                return;
            }
        }
        catch (ex) { }
        mkdirpSync(_path.dirname(path));
        _fs.mkdirSync(path);
    }
}
