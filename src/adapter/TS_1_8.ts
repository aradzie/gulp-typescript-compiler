/// <reference path="../d/typescript-1.8-wip.d.ts" />

import ts = TS_1_8;
import {FileCache} from '../cache';
import {Adapter, Project, Result, DiagnosticCategory, DiagnosticChain, Diagnostic} from '../compiler';
import {Env} from '../util';
import * as _lang from '../lang';

export default class TS_1_8_Adapter implements Adapter {
    static VERSION = '~1.8.0';

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

        return {
            options: result.options,
            fileNames: result.fileNames,
            diagnostics: this.mapDiagnostics(result.errors)
        };
    }

    compile(options: any, fileNames: string[], cache: FileCache): Result {
        return this.compileImpl(options as ts.CompilerOptions, fileNames, cache);
    }

    private compileImpl(options: ts.CompilerOptions, fileNames: string[], cache: FileCache): Result {
        let result = new Result();

        let host = wrapCompilerHost(this._ts.createCompilerHost(options), cache);
        let program = this._ts.createProgram(fileNames, options, host);

        let diagnostics = [];
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getOptionsDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getGlobalDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getSyntacticDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getSemanticDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getDeclarationDiagnostics()));

        if (!options.noEmit) {
            let emitResult = program.emit(undefined, write, undefined);
            result.emitSkipped = emitResult.emitSkipped;
            diagnostics = diagnostics.concat(this.mapDiagnostics(emitResult.diagnostics));
        }

        for (let diagnostic of diagnostics) {
            result.diagnostics.push(diagnostic);
        }

        for (let file of program.getSourceFiles()) {
            result.fileList.push(file.fileName);
        }

        if (options.listFiles) {
            for (let fileName of result.fileList) {
                console.log(fileName);
            }
        }

        if (options.diagnostics) {
            // TODO
        }

        return result;

        function write(fileName: string, data: string, writeByteOrderMark: boolean) {
            if (writeByteOrderMark) {
                data = '\uFEFF' + data;
            }
            result._create(options.rootDir, fileName, data);
        }
    }

    private mapDiagnostics(diagnostics: ts.Diagnostic[]): Diagnostic[] {
        let result = [];
        for (let tsd of diagnostics) {
            result.push(this.mapDiagnostic(tsd));
        }
        return result;
    }

    private mapDiagnostic(tsd: ts.Diagnostic): Diagnostic {
        let cm = {
            [this._ts.DiagnosticCategory.Warning]: DiagnosticCategory.Warning,
            [this._ts.DiagnosticCategory.Error]: DiagnosticCategory.Error,
            [this._ts.DiagnosticCategory.Message]: DiagnosticCategory.Message,
        };
        let cd = diagnostic(tsd);
        if (tsd.file) {
            let p = this._ts.getLineAndCharacterOfPosition(tsd.file, tsd.start);
            cd.fileName = tsd.file.fileName;
            cd.start = tsd.start;
            cd.length = tsd.length;
            cd.line = p.line;
            cd.character = p.character;
        }
        return cd;

        function diagnostic(tsd: ts.Diagnostic): Diagnostic {
            if (_lang.isString(tsd.messageText)) {
                return new Diagnostic(cm[tsd.category], tsd.code, <string>tsd.messageText);
            }
            else {
                let tsc = <ts.DiagnosticMessageChain>tsd.messageText;
                return new Diagnostic(cm[tsd.category], tsd.code, tsc.messageText, chain(tsc.next));
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
