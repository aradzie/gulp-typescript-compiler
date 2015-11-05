/// <reference path="../d/typescript-1.6.d.ts" />

import ts = TS_1_6;
import _compiler = require('../compiler');
import _util = require('../util');
import _lang = require('../lang');

class TS_1_6_Adapter implements _compiler.Compiler {
    static VERSION = '~1.6.2';

    constructor(private _ts: typeof ts) {}

    options(): _compiler.Option[] {
        return [
            {
                name: 'charset',
                type: 'string',
            },
            {
                name: 'declaration',
                type: 'boolean',
            },
            {
                name: 'diagnostics',
                type: 'boolean',
            },
            {
                name: 'emitBOM',
                type: 'boolean'
            },
            {
                name: 'emitDecoratorMetadata',
                type: 'boolean',
                experimental: true,
            },
            {
                name: 'experimentalAsyncFunctions',
                type: 'boolean',
            },
            {
                name: 'experimentalDecorators',
                type: 'boolean',
            },
            {
                name: 'help',
                type: 'boolean',
            },
            {
                name: 'init',
                type: 'boolean',
            },
            {
                name: 'inlineSourceMap',
                type: 'boolean',
            },
            {
                name: 'inlineSources',
                type: 'boolean',
            },
            {
                name: 'isolatedModules',
                type: 'boolean',
            },
            {
                name: 'jsx',
                type: {
                    'preserve': this._ts.JsxEmit.Preserve,
                    'react': this._ts.JsxEmit.React,
                },
            },
            {
                name: 'listFiles',
                type: 'boolean',
            },
            {
                name: 'locale',
                type: 'string',
            },
            {
                name: 'mapRoot',
                type: 'string',
                isFilePath: true,
            },
            {
                name: 'module',
                type: {
                    'commonjs': this._ts.ModuleKind.CommonJS,
                    'amd': this._ts.ModuleKind.AMD,
                    'system': this._ts.ModuleKind.System,
                    'umd': this._ts.ModuleKind.UMD,
                },
            },
            {
                name: 'moduleResolution',
                type: {
                    'node': this._ts.ModuleResolutionKind.NodeJs,
                    'classic': this._ts.ModuleResolutionKind.Classic,
                },
            },
            {
                name: 'newLine',
                type: {
                    'crlf': this._ts.NewLineKind.CarriageReturnLineFeed,
                    'lf': this._ts.NewLineKind.LineFeed,
                },
            },
            {
                name: 'noEmit',
                type: 'boolean',
            },
            {
                name: 'noEmitHelpers',
                type: 'boolean',
            },
            {
                name: 'noEmitOnError',
                type: 'boolean',
            },
            {
                name: 'noImplicitAny',
                type: 'boolean',
            },
            {
                name: 'noLib',
                type: 'boolean',
            },
            {
                name: 'noResolve',
                type: 'boolean',
            },
            {
                name: 'outDir',
                type: 'string',
                isFilePath: true,
            },
            {
                name: 'outFile',
                type: 'string',
                isFilePath: true,
            },
            {
                name: 'preserveConstEnums',
                type: 'boolean',
            },
            {
                name: 'removeComments',
                type: 'boolean',
            },
            {
                name: 'rootDir',
                type: 'string',
                isFilePath: true,
            },
            {
                name: 'skipDefaultLibCheck',
                type: 'boolean',
            },
            {
                name: 'sourceMap',
                type: 'boolean',
            },
            {
                name: 'sourceRoot',
                type: 'string',
                isFilePath: true,
            },
            {
                name: 'suppressExcessPropertyErrors',
                type: 'boolean',
                experimental: true
            },
            {
                name: 'suppressImplicitAnyIndexErrors',
                type: 'boolean',
            },
            {
                name: 'stripInternal',
                type: 'boolean',
                experimental: true
            },
            {
                name: 'target',
                type: {
                    'es3': this._ts.ScriptTarget.ES3,
                    'es5': this._ts.ScriptTarget.ES5,
                    'es6': this._ts.ScriptTarget.ES6,
                },
            },
        ];
    }

    compile(options: ts.CompilerOptions, fileNames: string[], result: _compiler.Result) {
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

export = TS_1_6_Adapter;
