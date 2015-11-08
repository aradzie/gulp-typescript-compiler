/// <reference path="../d/typescript-1.6.d.ts" />

import ts = TS_1_6;
import _compiler = require('../compiler');
import _util = require('../util');
import _lang = require('../lang');

class TS_1_6_Adapter implements _compiler.Compiler {
    static VERSION = '~1.6.2';

    constructor(private _ts: typeof ts) {}

    compile(options: any, fileNames: string[], result: _compiler.Result) {
        let parseConfigResult = this._ts.parseConfigFile({
            'compilerOptions': options,
            'files': fileNames
        }, null, process.cwd());

        if (parseConfigResult.errors.length > 0) {
            this._reportDiagnostics(parseConfigResult.errors, result);
        }
        else {
            this._compileImpl(parseConfigResult.options, parseConfigResult.fileNames, result);
        }
    }

    private _compileImpl(options: ts.CompilerOptions, fileNames: string[], result: _compiler.Result) {
        let host = this._ts.createCompilerHost(options);
        let program = this._ts.createProgram(fileNames, options, new CompilerHost(host));
        this._reportDiagnostics(program.getOptionsDiagnostics(), result);
        this._reportDiagnostics(program.getGlobalDiagnostics(), result);
        this._reportDiagnostics(program.getSyntacticDiagnostics(), result);
        this._reportDiagnostics(program.getSemanticDiagnostics(), result);
        this._reportDiagnostics(program.getDeclarationDiagnostics(), result);
        let emitResult = program.emit(undefined, write, undefined);
        result.emitSkipped = emitResult.emitSkipped;
        this._reportDiagnostics(emitResult.diagnostics, result);

        // The 'sourceMaps' is an internal property, not exposed in the definition file.
        let sourceMaps = <ts.SourceMapData[]>emitResult['sourceMaps'];

        function write(fileName: string, data: string) {
            result._create(options.rootDir, fileName, data);
        }
    }

    private _reportDiagnostics(diagnostics: ts.Diagnostic[], result: _compiler.Result) {
        for (let tsd of diagnostics) {
            result.diagnostics.push(this._mapDiagnostic(tsd));
        }
    }

    private _mapDiagnostic(tsd: ts.Diagnostic): _compiler.Diagnostic {
        let cm = {
            [this._ts.DiagnosticCategory.Warning]: _compiler.DiagnosticCategory.Warning,
            [this._ts.DiagnosticCategory.Error]: _compiler.DiagnosticCategory.Error,
            [this._ts.DiagnosticCategory.Message]: _compiler.DiagnosticCategory.Message,
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

        function diagnostic(tsd: ts.Diagnostic): _compiler.Diagnostic {
            if (_lang.isString(tsd.messageText)) {
                return new _compiler.Diagnostic(cm[tsd.category], tsd.code, <string>tsd.messageText);
            }
            else {
                let tsc = <ts.DiagnosticMessageChain>tsd.messageText;
                return new _compiler.Diagnostic(cm[tsd.category], tsd.code, tsc.messageText, chain(tsc.next));
            }
        }

        function chain(tsc: ts.DiagnosticMessageChain): _compiler.DiagnosticChain {
            if (tsc) {
                return new _compiler.DiagnosticChain(cm[tsc.category], tsc.code, tsc.messageText, chain(tsc.next));
            }
            else {
                return null;
            }
        }
    }
}

class CompilerHost implements ts.CompilerHost {
    private _target: ts.CompilerHost;

    constructor(target: ts.CompilerHost) {
        this._target = target;
    }

    writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) {
        this._target.writeFile(fileName, data, writeByteOrderMark, onError);
    }

    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError: (message: string) => void): ts.SourceFile {
        return this._target.getSourceFile(fileName, languageVersion, onError);
    }

    getDefaultLibFileName(options: ts.CompilerOptions): string {
        return this._target.getDefaultLibFileName(options);
    }

    getCurrentDirectory(): string {
        return this._target.getCurrentDirectory();
    }

    getCanonicalFileName(fileName: string): string {
        return this._target.getCanonicalFileName(fileName);
    }

    useCaseSensitiveFileNames(): boolean {
        return this._target.useCaseSensitiveFileNames();
    }

    getNewLine(): string {
        return this._target.getNewLine();
    }

    fileExists(fileName: string): boolean {
        return this._target.fileExists(fileName);
    }

    readFile(fileName: string): string {
        return this._target.readFile(fileName);
    }
}

export = TS_1_6_Adapter;
