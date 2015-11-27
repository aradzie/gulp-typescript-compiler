var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('lodash');
var _ev = require('events');
var _fs = require('fs');
var _path = require('path');
var _gu = require('gulp-util');
var factory_1 = require('./adapter/factory');
var cache_1 = require('./cache');
var util_1 = require('./util');
var Project = (function (_super) {
    __extends(Project, _super);
    function Project(env, ts, options, fileNames) {
        _super.call(this);
        this.env = env;
        this.ts = ts;
        this.options = null;
        this.fileNames = null;
        this.cache = null;
        this.formatter = new DiagnosticFormatter(env);
        this.adapter = factory_1.loadAdapter(this.ts);
        var result = this.adapter.parseOptions(this.env, options, fileNames);
        if (result.diagnostics.length) {
            var messages = [];
            for (var _i = 0, _a = result.diagnostics; _i < _a.length; _i++) {
                var diagnostic = _a[_i];
                messages.push(this.formatter.format(diagnostic));
            }
            _gu.log('TypeScript compiler:\n' + messages.join('\n'));
            throw new util_1.PluginError("Invalid configuration");
        }
        this.options = result.options;
        this.fileNames = result.fileNames;
    }
    Project.prototype.compile = function () {
        var result = this.adapter.compile(this.options, this.fileNames, new cache_1.NullCache());
        result.formatter = this.formatter;
        result.reportDiagnostics();
        if (this.options.listFiles === true) {
            for (var _i = 0, _a = result.inputFiles; _i < _a.length; _i++) {
                var inputFile = _a[_i];
                console.log(inputFile.fileName);
            }
        }
        if (this.options.diagnostics === true) {
        }
        return result;
    };
    Project.prototype.watch = function (callback) {
        var _this = this;
        if (!_.isFunction(callback)) {
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
        result.formatter = this.formatter;
        result.reportDiagnostics();
        _gu.log('TypeScript compiler: Compilation complete. Watching for file changes.');
        return result;
    };
    return Project;
})(_ev.EventEmitter);
exports.Project = Project;
var TextFile = (function () {
    function TextFile(fileName, text) {
        this.fileName = fileName;
        this.text = text;
    }
    TextFile.prototype.getPosition = function (offset) {
        this.initLineMap();
        if (offset < 0 || offset > this.text.length) {
            throw new Error();
        }
        var l = 0, h = this.lineMap.length - 1;
        while (l <= h) {
            var m = Math.floor((l + h) / 2);
            var begin = this.lineMap[m];
            var end = this.lineMap[m + 1];
            if (offset < begin) {
                h = m - 1;
                continue;
            }
            if (offset >= end) {
                l = m + 1;
                continue;
            }
            return { line: m, character: offset - begin };
        }
    };
    TextFile.prototype.getLine = function (line) {
        this.initLineMap();
        if (line < 0 || line >= this.lineMap.length) {
            throw new Error();
        }
        var begin = this.lineMap[line];
        var end = this.lineMap[line + 1];
        while (begin < end) {
            var ch = this.text.charCodeAt(end - 1);
            if (ch == 10 /* LF */
                || ch == 13 /* CR */
                || ch == 8232 /* LINE_SEPARATOR */
                || ch == 8233 /* PARAGRAPH_SEPARATOR */) {
                end--;
            }
            else {
                break;
            }
        }
        return this.text.substring(begin, end);
    };
    TextFile.prototype.initLineMap = function () {
        if (!Array.isArray(this.lineMap)) {
            this.lineMap = [];
            var pos = 0;
            var lineStart = 0;
            while (pos < this.text.length) {
                switch (this.text.charCodeAt(pos++)) {
                    case 13 /* CR */:
                        if (this.text.charCodeAt(pos) === 10 /* LF */) {
                            pos++;
                        }
                    case 10 /* LF */:
                    case 8232 /* LINE_SEPARATOR */:
                    case 8233 /* PARAGRAPH_SEPARATOR */:
                        this.lineMap.push(lineStart);
                        lineStart = pos;
                        break;
                }
            }
            this.lineMap.push(lineStart);
        }
    };
    return TextFile;
})();
exports.TextFile = TextFile;
var OutputFile = (function (_super) {
    __extends(OutputFile, _super);
    function OutputFile(options) {
        _super.call(this, options);
        this.sourceMap = null;
    }
    return OutputFile;
})(_gu.File);
exports.OutputFile = OutputFile;
var Result = (function () {
    function Result() {
        this.formatter = null;
        this.inputFiles = [];
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
            var diagnostic = _a[_i];
            messages.push(this.formatter.format(diagnostic));
        }
        if (messages.length) {
            _gu.log(messages.join('\n'));
        }
    };
    Result.prototype._create = function (base, path, data) {
        var file = new OutputFile({
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
        this.file = null;
        this.start = null;
        this.length = null;
    }
    return Diagnostic;
})(DiagnosticChain);
exports.Diagnostic = Diagnostic;
var DiagnosticFormatter = (function () {
    function DiagnosticFormatter(env, pretty, tabWidth) {
        if (pretty === void 0) { pretty = true; }
        if (tabWidth === void 0) { tabWidth = 4; }
        this.env = env;
        this.pretty = pretty;
        this.tabWidth = tabWidth;
    }
    DiagnosticFormatter.prototype.format = function (diagnostic) {
        var colors = _gu.colors;
        var tabWidth = this.tabWidth;
        var categoryName = (_a = {},
            _a[DiagnosticCategory.Warning] = colors.yellow('warning'),
            _a[DiagnosticCategory.Error] = colors.red('error'),
            _a[DiagnosticCategory.Message] = colors.blue('message'),
            _a
        );
        var output = '';
        if (diagnostic.file) {
            var file = diagnostic.file, start = diagnostic.start, length_1 = diagnostic.length;
            if (this.pretty) {
                contents(file, start, length_1);
            }
            var fileName = this.env.relative(file.fileName);
            var position = file.getPosition(start);
            output += fileName + "(" + (position.line + 1) + "," + (position.character + 1) + "): ";
        }
        output += categoryName[diagnostic.category] + " TS" + diagnostic.code + ": " + diagnostic.message;
        var level = 1;
        var next = diagnostic.next;
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
        function contents(file, start, length) {
            var MAX_LINES = 5;
            var CONTEXT_LINES = 2;
            var _a = file.getPosition(start), firstLine = _a.line, firstLineChar = _a.character;
            var _b = file.getPosition(start + length), lastLine = _b.line, lastLineChar = _b.character;
            output += '\n';
            for (var n = firstLine; n <= lastLine; n++) {
                if (lastLine - firstLine >= MAX_LINES) {
                    if (n >= firstLine + CONTEXT_LINES && n <= lastLine - CONTEXT_LINES) {
                        if (n == firstLine + CONTEXT_LINES) {
                            output += gutter('...') + '\n';
                        }
                        continue;
                    }
                }
                var line = file.getLine(n);
                var expanded = expand(line);
                var begin = 0;
                var end = expanded.length;
                if (n == firstLine) {
                    begin = textColumn(line, firstLineChar);
                }
                if (n == lastLine) {
                    end = textColumn(line, lastLineChar);
                }
                output += gutter(n + 1) + ' ' + colors.italic(expanded) + '\n';
                output += gutter() + ' ' + repeat(' ', begin) + colors.red(repeat('~', end - begin)) + '\n';
            }
            output += '\n';
            function gutter(s) {
                if (s === void 0) { s = ''; }
                s = String(s);
                while (s.length < 6) {
                    s = ' ' + s;
                }
                return colors.bgBlack.white(s);
            }
            function repeat(s, n) {
                var r = '';
                while (n-- > 0) {
                    r += s;
                }
                return r;
            }
            function expand(line) {
                var result = '';
                var column = 0;
                for (var n = 0; n < line.length; n++) {
                    if (line.charCodeAt(n) == 9 /* TAB */) {
                        var end = (Math.floor(column / tabWidth) + 1) * tabWidth;
                        while (column < end) {
                            result += ' ';
                            column++;
                        }
                    }
                    else {
                        result += line.charAt(n);
                        column++;
                    }
                }
                return result;
            }
            function textColumn(line, character) {
                var column = 0;
                for (var n = 0; n < character; n++) {
                    if (line.charCodeAt(n) == 9 /* TAB */) {
                        var end = (Math.floor(column / tabWidth) + 1) * tabWidth;
                        while (column < end) {
                            column++;
                        }
                    }
                    else {
                        column++;
                    }
                }
                return column;
            }
        }
        var _a;
    };
    return DiagnosticFormatter;
})();
exports.DiagnosticFormatter = DiagnosticFormatter;
