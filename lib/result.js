"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _fs = require('fs');
var _path = require('path');
var _gu = require('gulp-util');
var util_1 = require('./util');
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
            messages.push(this.formatter(diagnostic));
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
