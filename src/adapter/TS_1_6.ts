/// <reference path="../d/typescript-1.6.d.ts" />

"use strict";

import * as _ from 'lodash';
import ts = TS_1_6;
import {FileCache} from '../cache';
import {Adapter} from '../compiler';
import {TextFile, newTextFile} from '../textfile';
import {DiagnosticCategory, DiagnosticChain, Diagnostic} from '../diagnostic';
import {Result} from '../result';
import {Env} from '../util';

export class TS_1_6_Adapter implements Adapter {
    static VERSION = '~1.6.2';

    constructor(private _ts: typeof ts) {}

    parseOptions(env: Env, options: any, fileNames: string[]): {
        options: any;
        fileNames: string[];
        diagnostics: Diagnostic[];
    } {
        let result = this._ts.parseConfigFile({
            'compilerOptions': options,
            'files': fileNames
        }, null, env.cwd);

        let fileMap: _.Dictionary<TextFile> = Object.create(null);

        return {
            options: result.options,
            fileNames: result.fileNames,
            diagnostics: result.errors.map(error => this.diagnostic(fileMap, error))
        };
    }

    compile(options: ts.CompilerOptions, fileNames: string[], cache: FileCache): Result {
        let result = new Result();

        let host = wrapCompilerHost(this._ts.createCompilerHost(options), cache);
        let program = this._ts.createProgram(fileNames, options, host);

        let fileMap: _.Dictionary<TextFile> = Object.create(null);

        for (let sourceFile of program.getSourceFiles()) {
            let textFile = newTextFile(sourceFile.fileName, sourceFile.text);
            result.inputFiles.push(fileMap[textFile.fileName] = textFile);
        }

        let diagnostics = this._ts.getPreEmitDiagnostics(program);

        if (!options.noEmit) {
            let emitResult = program.emit(undefined, write, undefined);
            result.emitSkipped = emitResult.emitSkipped;
            diagnostics = diagnostics.concat(emitResult.diagnostics);
        }

        for (let diagnostic of diagnostics) {
            result.diagnostics.push(this.diagnostic(fileMap, diagnostic));
        }

        return result;

        function write(fileName: string, data: string, writeByteOrderMark: boolean) {
            if (writeByteOrderMark) {
                data = '\uFEFF' + data;
            }
            result._create(options.rootDir, fileName, data);
        }
    }

    private diagnostic(fileMap: _.Dictionary<TextFile>, tsd: ts.Diagnostic): Diagnostic {
        let cm = {
            [this._ts.DiagnosticCategory.Warning]: DiagnosticCategory.Warning,
            [this._ts.DiagnosticCategory.Error]: DiagnosticCategory.Error,
            [this._ts.DiagnosticCategory.Message]: DiagnosticCategory.Message,
        };
        let cd = diagnostic(tsd);
        if (tsd.file) {
            cd.file = fileMap[tsd.file.fileName];
            cd.start = tsd.start;
            cd.length = tsd.length;
        }
        return cd;

        function diagnostic(tsd: ts.Diagnostic): Diagnostic {
            let what = tsd.messageText;
            if (_.isString(what)) {
                return new Diagnostic(cm[tsd.category], tsd.code, what);
            }
            else {
                return new Diagnostic(cm[tsd.category], tsd.code, what.messageText, chain(what.next));
            }
        }

        function chain(tsc: ts.DiagnosticMessageChain): DiagnosticChain {
            if (tsc) {
                return new DiagnosticChain(cm[tsc.category], tsc.code, tsc.messageText, chain(tsc.next));
            }
            else {
                return null;
            }
        }
    }
}

function wrapCompilerHost(host: ts.CompilerHost, cache: FileCache): ts.CompilerHost {
    let getSourceFile = host.getSourceFile;
    host.getSourceFile = function getCachedSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError: (message: string) => void): ts.SourceFile {
        let sourceFile = cache.getCached(fileName) as ts.SourceFile;
        if (sourceFile == null) {
            cache.putCached(fileName, sourceFile = getSourceFile(fileName, languageVersion, onError));
        }
        return sourceFile;
    };
    return host;
}
