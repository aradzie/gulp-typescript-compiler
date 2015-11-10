/// <reference path="../d/typescript-1.6.d.ts" />
var _compiler = require('../compiler');
var _lang = require('../lang');
var TS_1_6_Adapter = (function () {
    function TS_1_6_Adapter(_ts) {
        this._ts = _ts;
    }
    TS_1_6_Adapter.prototype.compile = function (options, fileNames, result) {
        var parseConfigResult = this._ts.parseConfigFile({
            'compilerOptions': options,
            'files': fileNames
        }, null, process.cwd());
        if (parseConfigResult.errors.length > 0) {
            this._reportDiagnostics(parseConfigResult.errors, result);
        }
        else {
            this._compileImpl(parseConfigResult.options, parseConfigResult.fileNames, result);
        }
    };
    TS_1_6_Adapter.prototype._compileImpl = function (options, fileNames, result) {
        var host = this._ts.createCompilerHost(options);
        var program = this._ts.createProgram(fileNames, options, new CompilerHost(host));
        this._reportDiagnostics(program.getOptionsDiagnostics(), result);
        this._reportDiagnostics(program.getGlobalDiagnostics(), result);
        this._reportDiagnostics(program.getSyntacticDiagnostics(), result);
        this._reportDiagnostics(program.getSemanticDiagnostics(), result);
        this._reportDiagnostics(program.getDeclarationDiagnostics(), result);
        if (!options.noEmit) {
            var emitResult = program.emit(undefined, write, undefined);
            result.emitSkipped = emitResult.emitSkipped;
            this._reportDiagnostics(emitResult.diagnostics, result);
            // The 'sourceMaps' is an internal property, not exposed in the definition file.
            var sourceMaps = emitResult['sourceMaps'];
        }
        function write(fileName, data) {
            result._create(options.rootDir, fileName, data);
        }
    };
    TS_1_6_Adapter.prototype._reportDiagnostics = function (diagnostics, result) {
        for (var _i = 0; _i < diagnostics.length; _i++) {
            var tsd = diagnostics[_i];
            result.diagnostics.push(this._mapDiagnostic(tsd));
        }
    };
    TS_1_6_Adapter.prototype._mapDiagnostic = function (tsd) {
        var cm = (_a = {},
            _a[this._ts.DiagnosticCategory.Warning] = _compiler.DiagnosticCategory.Warning,
            _a[this._ts.DiagnosticCategory.Error] = _compiler.DiagnosticCategory.Error,
            _a[this._ts.DiagnosticCategory.Message] = _compiler.DiagnosticCategory.Message,
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
                return new _compiler.Diagnostic(cm[tsd.category], tsd.code, tsd.messageText);
            }
            else {
                var tsc = tsd.messageText;
                return new _compiler.Diagnostic(cm[tsd.category], tsd.code, tsc.messageText, chain(tsc.next));
            }
        }
        function chain(tsc) {
            if (tsc) {
                return new _compiler.DiagnosticChain(cm[tsc.category], tsc.code, tsc.messageText, chain(tsc.next));
            }
            else {
                return null;
            }
        }
        var _a;
    };
    TS_1_6_Adapter.VERSION = '~1.6.2';
    return TS_1_6_Adapter;
})();
var CompilerHost = (function () {
    function CompilerHost(target) {
        this._target = target;
    }
    CompilerHost.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError) {
        this._target.writeFile(fileName, data, writeByteOrderMark, onError);
    };
    CompilerHost.prototype.getSourceFile = function (fileName, languageVersion, onError) {
        return this._target.getSourceFile(fileName, languageVersion, onError);
    };
    CompilerHost.prototype.getDefaultLibFileName = function (options) {
        return this._target.getDefaultLibFileName(options);
    };
    CompilerHost.prototype.getCurrentDirectory = function () {
        return this._target.getCurrentDirectory();
    };
    CompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return this._target.getCanonicalFileName(fileName);
    };
    CompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return this._target.useCaseSensitiveFileNames();
    };
    CompilerHost.prototype.getNewLine = function () {
        return this._target.getNewLine();
    };
    CompilerHost.prototype.fileExists = function (fileName) {
        return this._target.fileExists(fileName);
    };
    CompilerHost.prototype.readFile = function (fileName) {
        return this._target.readFile(fileName);
    };
    return CompilerHost;
})();
module.exports = TS_1_6_Adapter;
