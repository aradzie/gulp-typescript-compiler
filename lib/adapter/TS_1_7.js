/// <reference path="../d/typescript-1.7.d.ts" />
var compiler_1 = require('../compiler');
var _lang = require('../lang');
var TS_1_7_Adapter = (function () {
    function TS_1_7_Adapter(_ts) {
        this._ts = _ts;
    }
    TS_1_7_Adapter.prototype.parseOptions = function (env, options, fileNames) {
        var result = this._ts.parseJsonConfigFileContent({
            'compilerOptions': options,
            'files': fileNames
        }, null, env.cwd);
        return {
            options: result.options,
            fileNames: result.fileNames,
            diagnostics: this.mapDiagnostics(result.errors)
        };
    };
    TS_1_7_Adapter.prototype.compile = function (options, fileNames, cache) {
        return this.compileImpl(options, fileNames, cache);
    };
    TS_1_7_Adapter.prototype.compileImpl = function (options, fileNames, cache) {
        var result = new compiler_1.Result();
        var host = new CompilerHost(this._ts.createCompilerHost(options), cache);
        var program = this._ts.createProgram(fileNames, options, host);
        var diagnostics = [];
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getOptionsDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getGlobalDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getSyntacticDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getSemanticDiagnostics()));
        diagnostics = diagnostics.concat(this.mapDiagnostics(program.getDeclarationDiagnostics()));
        if (!options.noEmit) {
            var emitResult = program.emit(undefined, write, undefined);
            result.emitSkipped = emitResult.emitSkipped;
            diagnostics = diagnostics.concat(this.mapDiagnostics(emitResult.diagnostics));
        }
        for (var _i = 0; _i < diagnostics.length; _i++) {
            var diagnostic = diagnostics[_i];
            result.diagnostics.push(diagnostic);
        }
        for (var _a = 0, _b = program.getSourceFiles(); _a < _b.length; _a++) {
            var file = _b[_a];
            result.fileList.push(file.fileName);
        }
        if (options.listFiles) {
            for (var _c = 0, _d = result.fileList; _c < _d.length; _c++) {
                var fileName = _d[_c];
                console.log(fileName);
            }
        }
        if (options.diagnostics) {
        }
        return result;
        function write(fileName, data, writeByteOrderMark) {
            if (writeByteOrderMark) {
                data = '\uFEFF' + data;
            }
            result._create(options.rootDir, fileName, data);
        }
    };
    TS_1_7_Adapter.prototype.mapDiagnostics = function (diagnostics) {
        var result = [];
        for (var _i = 0; _i < diagnostics.length; _i++) {
            var tsd = diagnostics[_i];
            result.push(this.mapDiagnostic(tsd));
        }
        return result;
    };
    TS_1_7_Adapter.prototype.mapDiagnostic = function (tsd) {
        var cm = (_a = {},
            _a[this._ts.DiagnosticCategory.Warning] = compiler_1.DiagnosticCategory.Warning,
            _a[this._ts.DiagnosticCategory.Error] = compiler_1.DiagnosticCategory.Error,
            _a[this._ts.DiagnosticCategory.Message] = compiler_1.DiagnosticCategory.Message,
            _a
        );
        var cd = diagnostic(tsd);
        if (tsd.file) {
            var p = this._ts.getLineAndCharacterOfPosition(tsd.file, tsd.start);
            cd.fileName = tsd.file.fileName;
            cd.start = tsd.start;
            cd.length = tsd.length;
            cd.line = p.line;
            cd.character = p.character;
        }
        return cd;
        function diagnostic(tsd) {
            if (_lang.isString(tsd.messageText)) {
                return new compiler_1.Diagnostic(cm[tsd.category], tsd.code, tsd.messageText);
            }
            else {
                var tsc = tsd.messageText;
                return new compiler_1.Diagnostic(cm[tsd.category], tsd.code, tsc.messageText, chain(tsc.next));
            }
        }
        function chain(tsc) {
            if (tsc) {
                return new compiler_1.DiagnosticChain(cm[tsc.category], tsc.code, tsc.messageText, chain(tsc.next));
            }
            else {
                return null;
            }
        }
        var _a;
    };
    TS_1_7_Adapter.VERSION = '~1.7.2';
    return TS_1_7_Adapter;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TS_1_7_Adapter;
var CompilerHost = (function () {
    function CompilerHost(target, cache) {
        this.target = target;
        this.cache = cache;
    }
    CompilerHost.prototype.getSourceFile = function (fileName, languageVersion, onError) {
        var sourceFile = this.cache.getCached(fileName);
        if (sourceFile == null) {
            this.cache.putCached(fileName, sourceFile = this.target.getSourceFile(fileName, languageVersion, onError));
        }
        return sourceFile;
    };
    CompilerHost.prototype.getDefaultLibFileName = function (options) {
        return this.target.getDefaultLibFileName(options);
    };
    CompilerHost.prototype.getCurrentDirectory = function () {
        return this.target.getCurrentDirectory();
    };
    CompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return this.target.getCanonicalFileName(fileName);
    };
    CompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return this.target.useCaseSensitiveFileNames();
    };
    CompilerHost.prototype.getNewLine = function () {
        return this.target.getNewLine();
    };
    CompilerHost.prototype.fileExists = function (fileName) {
        return this.target.fileExists(fileName);
    };
    CompilerHost.prototype.readFile = function (fileName) {
        return this.target.readFile(fileName);
    };
    CompilerHost.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError) {
        this.target.writeFile(fileName, data, writeByteOrderMark, onError);
    };
    return CompilerHost;
})();
