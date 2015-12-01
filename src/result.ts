'use strict';

import * as _ from 'lodash';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {TextFile} from './textfile';
import {Diagnostic, DiagnosticFormatter} from './diagnostic';
import {PassThroughStream, Env, hasExt, findExt, log} from './util';

const EXT_JS = 'js';
const EXT_JSX = 'jsx';
const EXT_JS_MAP = 'js.map';
const EXT_JSX_MAP = 'jsx.map';
const EXT_D_TS = 'd.ts';
const EXT_LIST = [EXT_JS, EXT_JSX, EXT_JS_MAP, EXT_JSX_MAP, EXT_D_TS];

export interface OutputFile extends _gu.File {
    sourceMap?: _sm.RawSourceMap;
    _textFile?: TextFile;
    _sourceMapFile?: OutputFile;
    _declarationFile?: OutputFile;
}

export interface Result {
    inputFiles: TextFile[];
    diagnostics: Diagnostic[];
    emitSkipped: boolean;
    scripts: OutputFile[];
    sourceMaps: OutputFile[];
    declarations: OutputFile[];
    emit(): PassThroughStream;
    emitScripts(): PassThroughStream;
    emitSourceMaps(): PassThroughStream;
    emitDeclarations(): PassThroughStream;
    writeFiles();
    writeFilesAsync(): Promise<{}>;
}

export function newResult(rootDir: string,
                          result: {
                              inputFiles: TextFile[];
                              outputFiles: TextFile[];
                              diagnostics: Diagnostic[];
                              emitSkipped: boolean;
                          },
                          formatter: DiagnosticFormatter): Result {
    const {inputFiles, outputFiles, diagnostics, emitSkipped} = result;
    const scripts: OutputFile[] = [];
    const sourceMaps: OutputFile[] = [];
    const declarations: OutputFile[] = [];
    const fileMap: _.Dictionary<OutputFile> = Object.create(null);

    for (let outputFile of outputFiles) {
        createScriptFile(outputFile);
    }
    for (let outputFile of outputFiles) {
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
        writeFilesAsync
    };

    function emit() {
        return new PassThroughStream([].concat(scripts, sourceMaps, declarations));
    }

    function emitScripts() {
        return new PassThroughStream(scripts);
    }

    function emitSourceMaps() {
        return new PassThroughStream(sourceMaps);
    }

    function emitDeclarations() {
        return new PassThroughStream(declarations);
    }

    function writeFiles() {
        for (let file of [].concat(scripts, sourceMaps, declarations)) {
            writeFileSync(file.path, file.contents, { encoding: 'UTF-8' });
        }
    }

    function writeFilesAsync(): Promise<{}> {
        return Promise.reject<{}>(new Error('Not implemented'));
    }

    function reportDiagnostics() {
        let messages = [];
        if (emitSkipped) {
            messages.push(_gu.colors.red('Emit skipped'));
        }
        else if (diagnostics.length) {
            messages.push(_gu.colors.red('Emit completed with errors'));
        }
        for (let diagnostic of diagnostics) {
            messages.push(formatter(diagnostic));
        }
        if (messages.length) {
            log(messages.join('\n'));
        }
    }

    function createScriptFile(file: TextFile) {
        const { basename, ext } = findExt(file.fileName, EXT_LIST);
        switch (ext) {
            case EXT_JS:
            case EXT_JSX:
                scripts.push(fileMap[basename] = newOutputFile(file));
                break;
        }
    }

    function createAndLinkNonScriptFile(file: TextFile) {
        const { basename, ext } = findExt(file.fileName, EXT_LIST);
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

    function newOutputFile(file: TextFile): OutputFile {
        const result = new _gu.File({
            base: rootDir,
            path: file.fileName,
            contents: new Buffer(file.text)
        }) as OutputFile;
        result._textFile = file;
        return result;
    }
}

function writeFileSync(path: string, data: any, options: any = { encoding: 'UTF-8' }) {
    mkdirpSync(_path.dirname(path));
    _fs.writeFileSync(path, data, options);
    function mkdirpSync(path: string) {
        try {
            let stats = _fs.statSync(path);
            if (stats.isDirectory()) {
                return;
            }
        }
        catch (ex) {}
        mkdirpSync(_path.dirname(path));
        _fs.mkdirSync(path);
    }
}
