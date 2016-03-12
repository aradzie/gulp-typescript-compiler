"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _glob = require('glob');
var _minimatch = require('minimatch');
var _path = require('path');
var _stream = require('stream');
var _gu = require('gulp-util');
var PluginError = (function (_super) {
    __extends(PluginError, _super);
    function PluginError(message, options) {
        _super.call(this, 'gulp-typescript-compiler', message, options);
    }
    PluginError.prototype.toString = function () {
        var header = _gu.colors.red(this.name) + " in plugin '" + _gu.colors.cyan(this.plugin) + "'";
        var body = "Message:\n" + this.message.split('\n').map(pad).join('\n');
        return header + "\n" + body;
        function pad(line) {
            return '  ' + line;
        }
    };
    return PluginError;
}(_gu.PluginError));
exports.PluginError = PluginError;
/**
 * The trick is to detect whether this is the first stream in a chain of pipes,
 * or an intermediate link. The first stream will not receive the end event,
 * therefore it must produce output immediately. An intermediate link will
 * receive the end event, and only then it must produce any output to append
 * files to the ones that have already been passed through.
 */
var PassThroughStream = (function (_super) {
    __extends(PassThroughStream, _super);
    function PassThroughStream(files, prepend) {
        var _this = this;
        if (files === void 0) { files = []; }
        if (prepend === void 0) { prepend = false; }
        _super.call(this, { objectMode: true });
        this._files = [].concat(files);
        this._piped = false;
        if (prepend === null) {
        }
        else {
            this.on('pipe', function (source) {
                _this._piped = true;
            });
            this.on('unpipe', function (source) {
                _this._piped = false;
            });
        }
        if (prepend) {
            this._dump();
        }
    }
    PassThroughStream.prototype._read = function () {
        if (!this._piped) {
            this._dump();
            this.push(null);
        }
    };
    PassThroughStream.prototype._write = function (file, encoding, callback) {
        this.push(file);
        callback();
    };
    PassThroughStream.prototype.end = function () {
        this._dump();
        this.push(null);
    };
    PassThroughStream.prototype._dump = function () {
        var files = this._files;
        this._files = [];
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            this.push(file);
        }
    };
    return PassThroughStream;
}(_stream.Duplex));
exports.PassThroughStream = PassThroughStream;
function newEnv(cwd) {
    if (cwd === void 0) { cwd = process.cwd(); }
    return { cwd: cwd, resolve: resolve, relative: relative, glob: glob };
    function resolve(path) {
        return _path.normalize(_path.resolve(cwd, path));
    }
    function relative(path) {
        return _path.relative(cwd, resolve(path));
    }
    function glob(globs) {
        var fileNames = [];
        var groups = [];
        var last = null;
        globs.forEach(function (glob) {
            if (glob.startsWith('!')) {
                if (last == null) {
                    throw new PluginError('Globs cannot start with a negative pattern');
                }
                last.negative.push(resolve(glob.substring(1)));
            }
            else {
                groups.push(last = {
                    positive: resolve(glob),
                    negative: []
                });
            }
        });
        if (last == null) {
            throw new PluginError('Globs are empty');
        }
        var options = { cwd: cwd };
        groups.forEach(function (group) {
            var found = _glob.sync(group.positive, options);
            if (found.length > 0) {
                found.forEach(function (fileName) {
                    if (!group.negative.some(function (negative) { return _minimatch(fileName, negative); })) {
                        fileNames.push(fileName);
                    }
                });
            }
            else if (!_glob.hasMagic(group.positive, options)) {
                throw new PluginError("File not found with singular glob: " + group.positive);
            }
        });
        return fileNames.filter(unique);
        function unique(value, index, array) {
            return array.indexOf(value) === index;
        }
    }
}
exports.newEnv = newEnv;
function hasExt(fileName, extList) {
    for (var _i = 0, extList_1 = extList; _i < extList_1.length; _i++) {
        var ext = extList_1[_i];
        if (fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
            return true;
        }
    }
    return false;
}
exports.hasExt = hasExt;
function findExt(fileName, extList) {
    for (var _i = 0, extList_2 = extList; _i < extList_2.length; _i++) {
        var ext = extList_2[_i];
        if (fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
            return {
                basename: fileName.substring(0, fileName.length - ext.length - 1),
                ext: ext
            };
        }
    }
    return {
        basename: fileName,
        ext: null
    };
}
exports.findExt = findExt;
function log(message) {
    _gu.log("TypeScript compiler: " + message);
}
exports.log = log;
