var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ev = require('events');
var _fs = require('fs');
var _path = require('path');
var _gu = require('gulp-util');
var cache_1 = require('./cache');
var factory_1 = require('./adapter/factory');
var util_1 = require('./util');
var _lang = require('./lang');
var Project = (function (_super) {
    __extends(Project, _super);
    function Project(env, ts, options, fileNames) {
        _super.call(this);
        this.env = env;
        this.ts = ts;
        this.options = null;
        this.fileNames = null;
        this.cache = null;
        this.adapter = factory_1.default(this.ts);
        var result = this.adapter.parseOptions(this.env, options, fileNames);
        if (result.diagnostics.length) {
            var messages = [];
            for (var _i = 0, _a = result.diagnostics; _i < _a.length; _i++) {
                var d = _a[_i];
                messages.push(Diagnostic.format(d));
            }
            _gu.log('TypeScript compiler:\n' + messages.join('\n'));
            throw new util_1.PluginError("Invalid configuration");
        }
        this.options = result.options;
        this.fileNames = result.fileNames;
    }
    Project.prototype.compile = function () {
        var result = this.adapter.compile(this.options, this.fileNames, new cache_1.NullCache());
        result.reportDiagnostics();
        return result;
    };
    Project.prototype.watch = function (callback) {
        var _this = this;
        if (!_lang.isFunction(callback)) {
            throw new util_1.PluginError("The callback argument is not a function");
        }
        if (this.cache != null) {
            throw new util_1.PluginError("Already watching");
        }
        this.cache = new cache_1.WatchingCache(this.env, ['ts', 'tsx', 'd.ts']);
        this.cache.on('change', function () {
            _gu.log('TypeScript compiler: File change detected. Starting incremental compilation...');
            callback(_this._recompile());
        });
        callback(this._recompile());
    };
    Project.prototype._recompile = function () {
        var result = this.adapter.compile(this.options, this.fileNames, this.cache);
        result.reportDiagnostics();
        _gu.log('TypeScript compiler: Compilation complete. Watching for file changes.');
        return result;
    };
    return Project;
})(_ev.EventEmitter);
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
        this.fileList = [];
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
        var _a = util_1.findExt(path, ['js', 'jsx', 'js.map', 'jsx.map', 'd.ts']), basename = _a.basename, ext = _a.ext;
        switch (ext) {
            case 'js':
            case 'jsx':
                this.scripts.push(file);
                break;
            case 'js.map':
            case 'jsx.map':
                this.sourceMaps.push(file);
                break;
            case 'd.ts':
                this.declarations.push(file);
                break;
            default:
                throw new Error("Unknown extension of file '" + path + "'");
        }
    };
    Result.prototype.emit = function () {
        return new util_1.PassThroughStream([].concat(this.scripts, this.sourceMaps, this.declarations));
    };
    Result.prototype.emitScripts = function () {
        return new util_1.PassThroughStream(this.scripts);
    };
    Result.prototype.emitSourceMaps = function () {
        return new util_1.PassThroughStream(this.sourceMaps);
    };
    Result.prototype.emitDeclarations = function () {
        return new util_1.PassThroughStream(this.declarations);
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
