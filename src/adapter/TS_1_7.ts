/// <reference path="../d/typescript-1.7.d.ts" />

import ts = TS_1_7;
import _compiler = require('../compiler');
import _util = require('../util');
import _lang = require('../lang');

class TS_1_7_Adapter implements _compiler.Compiler {
    static VERSION = '~1.7.2';

    constructor(private _ts: typeof ts) {}

    compile(options: any, fileNames: string[], result: _compiler.Result) {
        let parseConfigResult = this._ts.parseJsonConfigFileContent({
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

        function write(fileName: string, data: string) {
            result._create(options.rootDir, fileName, data);
        }
    }

    private _reportDiagnostics(diagnostics: ts.Diagnostic[], result: _compiler.Result) {
        for (let diagnostic of diagnostics) {
            this._reportDiagnostic(diagnostic, result);
        }
    }

    private _reportDiagnostic(diagnostic: ts.Diagnostic, result: _compiler.Result) {
        let category = {
            [this._ts.DiagnosticCategory.Warning]: _compiler.DiagnosticCategory.Warning,
            [this._ts.DiagnosticCategory.Error]: _compiler.DiagnosticCategory.Error,
            [this._ts.DiagnosticCategory.Message]: _compiler.DiagnosticCategory.Message,
        };
        let d = empty();
        if (diagnostic.file) {
            let p = this._ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            d.fileName = diagnostic.file.fileName;
            d.start = diagnostic.start;
            d.length = diagnostic.length;
            d.line = p.line;
            d.character = p.character;
        }
        d.category = category[diagnostic.category];
        d.code = diagnostic.code;
        if (_lang.isString(diagnostic.messageText)) {
            d.message = <string>diagnostic.messageText;
        }
        else {
            message(d, <ts.DiagnosticMessageChain>diagnostic.messageText);

        }
        result.diagnostics.push(d);

        function message(d: _compiler.Diagnostic, next: ts.DiagnosticMessageChain) {
            d.message = next.messageText;
            next = next.next;
            while (next) {
                let t = empty();
                t.category = category[next.category];
                t.code = next.code;
                t.message = next.messageText;
                d.next = t;
                d = t;
                next = next.next;
            }
        }

        function empty(): _compiler.Diagnostic {
            return {
                fileName: null,
                start: null,
                length: null,
                line: null,
                character: null,
                category: null,
                code: null,
                message: null,
                next: null
            };
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

export = TS_1_7_Adapter;
