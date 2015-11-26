/// <reference path="../d/typescript-1.7.d.ts" />

import ts = TS_1_7;
import {FileCache} from '../cache';
import {
    Adapter,
    Project,
    TextPosition,
    TextFile,
    Result,
    DiagnosticCategory,
    DiagnosticChain,
    Diagnostic
} from '../compiler';
import {Env} from '../util';
import * as _lang from '../lang';

export default class TS_1_7_Adapter implements Adapter {
    static VERSION = '~1.7.0';

    constructor(private _ts: typeof ts) {}

    parseOptions(env: Env, options: any, fileNames: string[]): {
        options: any;
        fileNames: string[];
        diagnostics: Diagnostic[];
    } {
        let result = this._ts.parseJsonConfigFileContent({
            'compilerOptions': options,
            'files': fileNames
        }, null, env.cwd);

        let fileMap: _lang.Map<TextFile> = Object.create(null);

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

        let fileMap: _lang.Map<TextFile> = Object.create(null);

        for (let sourceFile of program.getSourceFiles()) {
            let textFile = new TextFile(sourceFile.fileName, sourceFile.text);
            result.inputFiles.push(fileMap[textFile.fileName] = textFile);
        }

        let diagnostics = [];

        diagnostics = diagnostics.concat(program.getOptionsDiagnostics());
        diagnostics = diagnostics.concat(program.getGlobalDiagnostics());
        diagnostics = diagnostics.concat(program.getSyntacticDiagnostics());
        diagnostics = diagnostics.concat(program.getSemanticDiagnostics());
        diagnostics = diagnostics.concat(program.getDeclarationDiagnostics());

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

    private diagnostic(fileMap: _lang.Map<TextFile>, tsd: ts.Diagnostic): Diagnostic {
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
            if (_lang.isString(what)) {
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
