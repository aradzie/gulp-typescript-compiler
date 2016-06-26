/// <reference path="typescript-1.8.d.ts" />

import * as _ from 'lodash';
import TS = TS_1_8;
import {FileCache} from '../cache';
import {Adapter, ParseOptionsResult, CompileResult} from './api';
import {TextFile, newTextFile} from '../textfile';
import {DiagnosticCategory, DiagnosticChain, Diagnostic} from '../diagnostic';
import {Env} from '../util';

export const TS_1_8_Factory = {
    VERSION: '~1.8.10', newAdapter
};

function newAdapter(env: Env, ts: typeof TS): Adapter {
    return { parseOptions, compile };

    function parseOptions(options: any, fileNames: string[]): ParseOptionsResult {
        const parseResult = ts.parseJsonConfigFileContent({
            'compilerOptions': options,
            'files': fileNames
        }, null, env.cwd);
        return {
            options: parseResult.options,
            fileNames: parseResult.fileNames,
            diagnostics: mapDiagnostics(newFileMap(), parseResult.errors)
        };
    }

    function compile(options: TS.CompilerOptions, fileNames: string[], cache: FileCache): CompileResult {
        const host = wrapCompilerHost(ts.createCompilerHost(options), cache);
        const program = ts.createProgram(fileNames, options, host);

        const fileMap = newFileMap();
        const inputFiles = [];
        const outputFiles = [];
        let diagnostics = ts.getPreEmitDiagnostics(program);
        let emitSkipped = true;

        for (let sourceFile of program.getSourceFiles()) {
            let textFile = newTextFile(sourceFile.fileName, sourceFile.text);
            inputFiles.push(fileMap[textFile.fileName] = textFile);
        }

        if (!options.noEmit) {
            let emitResult = program.emit(undefined, write, undefined);
            diagnostics = diagnostics.concat(emitResult.diagnostics);
            emitSkipped = emitResult.emitSkipped;
        }

        return {
            inputFiles,
            outputFiles,
            diagnostics: mapDiagnostics(fileMap, diagnostics),
            emitSkipped
        };

        function write(fileName: string, data: string, writeByteOrderMark: boolean) {
            if (writeByteOrderMark) {
                data = '\uFEFF' + data;
            }
            outputFiles.push(newTextFile(fileName, data));
        }
    }

    function mapDiagnostics(fileMap: _.Dictionary<TextFile>, tsd: TS.Diagnostic[]): Diagnostic[] {
        return tsd.map(v => mapDiagnostic(fileMap, v));
    }

    function mapDiagnostic(fileMap: _.Dictionary<TextFile>, tsd: TS.Diagnostic): Diagnostic {
        const cm = {
            [ts.DiagnosticCategory.Warning]: DiagnosticCategory.Warning,
            [ts.DiagnosticCategory.Error]: DiagnosticCategory.Error,
            [ts.DiagnosticCategory.Message]: DiagnosticCategory.Message,
        };
        const cd = newDiagnostic(tsd);
        if (tsd.file) {
            cd.file = fileMap[tsd.file.fileName];
            cd.start = tsd.start;
            cd.length = tsd.length;
        }
        return cd;

        function newDiagnostic(tsd: TS.Diagnostic): Diagnostic {
            const what = tsd.messageText;
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

        function newChain(tsc: TS.DiagnosticMessageChain): DiagnosticChain {
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
    }

    function newFileMap(): _.Dictionary<TextFile> {
        return Object.create(null);
    }

    function wrapCompilerHost(host: TS.CompilerHost, cache: FileCache): TS.CompilerHost {
        const getSourceFile = host.getSourceFile;
        host.getSourceFile = function getCachedSourceFile(fileName: string, languageVersion: TS.ScriptTarget, onError: (message: string) => void): TS.SourceFile {
            let sourceFile = cache.getCached(fileName) as TS.SourceFile;
            if (sourceFile == null) {
                cache.putCached(fileName, sourceFile = getSourceFile(fileName, languageVersion, onError));
            }
            return sourceFile;
        };
        return host;
    }
}
