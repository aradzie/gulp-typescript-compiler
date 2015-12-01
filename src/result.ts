'use strict';

import * as _ from 'lodash';
import * as _ev from 'events';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {TextFile} from './textfile';
import {Diagnostic, DiagnosticFormatter, newFormatter} from './diagnostic';
import {PassThroughStream, Env, hasExt, findExt} from './util';

export class OutputFile extends _gu.File {
    sourceMap: _sm.RawSourceMap = null;

    constructor(options?: {
        cwd?: string;
        base?: string;
        path?: string;
        history?: string[];
        stat?: _fs.Stats;
        contents?: Buffer | NodeJS.ReadWriteStream;
    }) {
        super(options);
    }
}

export interface Result {
    options: any;
    fileNames: string[];
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

export function newResult(env: Env,
                          options: any,
                          fileNames: any,
                          result: {
                              inputFiles: TextFile[];
                              outputFiles: TextFile[];
                              diagnostics: Diagnostic[];
                              emitSkipped: boolean;
                          },
                          formatter: DiagnosticFormatter): Result {
    let {inputFiles, outputFiles, diagnostics, emitSkipped} = result;
    let scripts: OutputFile[] = [];
    let sourceMaps: OutputFile[] = [];
    let declarations: OutputFile[] = [];

    for (let outputFile of outputFiles) {
        createFile(options.rootDir, outputFile.fileName, outputFile.text);
    }

    reportDiagnostics();

    return {
        options,
        fileNames,
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
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit skipped'));
        }
        else if (diagnostics.length) {
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit completed with errors'));
        }

        for (let diagnostic of diagnostics) {
            messages.push(formatter(diagnostic));
        }

        if (messages.length) {
            _gu.log(messages.join('\n'));
        }
    }

    function createFile(base: string, path: string, data: string): void {
        let file = new OutputFile({
            base: base,
            path: path,
            contents: new Buffer(data)
        });
        let { basename, ext } = findExt(path, ['js', 'jsx', 'js.map', 'jsx.map', 'd.ts']);
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
                throw new Error(`Unknown extension of file '${path}'`);
        }
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
