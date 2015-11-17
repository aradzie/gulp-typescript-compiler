var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _fs = require('fs');
var _path = require('path');
var _gu = require('gulp-util');
var _factory = require('./adapter/factory');
var _util = require('./util');
var _lang = require('./lang');
var Project = (function () {
    function Project(ts, options, fileNames) {
        this._ts = ts;
        this._options = options;
        this._fileNames = fileNames;
        this._adapter = _factory.load(this._ts);
    }
    Project.prototype.compile = function () {
        var result = new Result();
        this._adapter.compile(this._options, this._fileNames, result);
        return result;
    };
    Project.prototype.watch = function (callback) {
        if (!_lang.isFunction(callback)) {
            throw new _util.PluginError("The callback argument is not a function");
        }
        this.compile();
        throw new Error("Not implemented");
    };
    return Project;
})();
exports.Project = Project;
var File = (function (_super) {
    __extends(File, _super);
    function File(options) {
        _super.call(this, options);
        this.sourceMap = null;
    }
    return File;
})(_gu.File);
exports.File = File;
var Result = (function () {
    function Result() {
        this.emitSkipped = false;
        this.diagnostics = [];
        this.scripts = [];
        this.sourceMaps = [];
        this.declarations = [];
    }
    Result.prototype.reportDiagnostics = function () {
        var messages = [];
        if (this.emitSkipped) {
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit skipped'));
        }
        else if (this.diagnostics.length) {
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit completed with errors'));
        }
        for (var _i = 0, _a = this.diagnostics; _i < _a.length; _i++) {
            var d = _a[_i];
            messages.push(Diagnostic.format(d));
        }
        if (messages.length) {
            _gu.log(messages.join('\n'));
        }
    };
    Result.prototype._create = function (base, path, data) {
        var file = new File({
            base: base,
            path: path,
            contents: new Buffer(data)
        });
        var _a = findExt(path), basename = _a.basename, ext = _a.ext;
        switch (ext) {
            case '.js':
            case '.jsx':
                this.scripts.push(file);
                break;
            case '.js.map':
            case '.jsx.map':
                this.sourceMaps.push(file);
                break;
            case '.d.ts':
                this.declarations.push(file);
                break;
            default:
                throw new Error("Unknown extension of file '" + path + "'");
        }
        function findExt(path) {
            var suffixes = ['.js', '.jsx', '.js.map', '.jsx.map', '.d.ts'];
            for (var _i = 0; _i < suffixes.length; _i++) {
                var suffix = suffixes[_i];
                if (path.toLowerCase().endsWith(suffix)) {
                    return {
                        basename: path.substring(0, path.length - suffix.length),
                        ext: suffix
                    };
                }
            }
            return {
                basename: path,
                ext: null
            };
        }
    };
    Result.prototype.emit = function () {
        return new _util.PassThroughStream([].concat(this.scripts, this.sourceMaps, this.declarations));
    };
    Result.prototype.emitScripts = function () {
        return new _util.PassThroughStream(this.scripts);
    };
    Result.prototype.emitSourceMaps = function () {
        return new _util.PassThroughStream(this.sourceMaps);
    };
    Result.prototype.emitDeclarations = function () {
        return new _util.PassThroughStream(this.declarations);
    };
    Result.prototype.writeFiles = function () {
        var files = [].concat(this.scripts, this.sourceMaps, this.declarations);
        for (var _i = 0; _i < files.length; _i++) {
            var file = files[_i];
            mkdirpSync(_path.dirname(file.path));
            _fs.writeFileSync(file.path, file.contents, { encoding: 'UTF-8' });
        }
        function mkdirpSync(path) {
            try {
                var stats = _fs.lstatSync(path);
            }
            catch (ex) { }
            if (!stats || !stats.isDirectory()) {
                mkdirpSync(_path.dirname(path));
                _fs.mkdirSync(path);
            }
        }
    };
    return Result;
})();
exports.Result = Result;
(function (DiagnosticCategory) {
    DiagnosticCategory[DiagnosticCategory["Warning"] = 0] = "Warning";
    DiagnosticCategory[DiagnosticCategory["Error"] = 1] = "Error";
    DiagnosticCategory[DiagnosticCategory["Message"] = 2] = "Message";
})(exports.DiagnosticCategory || (exports.DiagnosticCategory = {}));
var DiagnosticCategory = exports.DiagnosticCategory;
var DiagnosticChain = (function () {
    function DiagnosticChain(category, code, message, next) {
        if (next === void 0) { next = null; }
        this.category = category;
        this.code = code;
        this.message = message;
        this.next = next;
    }
    DiagnosticChain.prototype.toString = function () {
        return this.message;
    };
    return DiagnosticChain;
})();
exports.DiagnosticChain = DiagnosticChain;
var Diagnostic = (function (_super) {
    __extends(Diagnostic, _super);
    function Diagnostic(category, code, message, next) {
        if (next === void 0) { next = null; }
        _super.call(this, category, code, message, next);
        this.fileName = null;
        this.start = null;
        this.length = null;
        this.line = null;
        this.character = null;
    }
    Diagnostic.prototype.toString = function () {
        return Diagnostic.format(this);
    };
    Diagnostic.format = function (d) {
        var cn = (_a = {},
            _a[DiagnosticCategory.Warning] = 'warning',
            _a[DiagnosticCategory.Error] = 'error',
            _a[DiagnosticCategory.Message] = 'message',
            _a
        );
        var output = '';
        if (d.fileName) {
            output += _path.relative(process.cwd(), d.fileName) + "(" + (d.line + 1) + "," + (d.character + 1) + "): ";
        }
        output += cn[d.category] + " TS" + d.code + ": " + d.message;
        var level = 1;
        var next = d.next;
        while (next) {
            output += '\n';
            for (var i = 0; i < level; i++) {
                output += '  ';
            }
            output += next.message;
            level++;
            next = next.next;
        }
        return output;
        var _a;
    };
    return Diagnostic;
})(DiagnosticChain);
exports.Diagnostic = Diagnostic;
