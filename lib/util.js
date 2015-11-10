var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
})(_gu.PluginError);
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
        this.on('pipe', function (source) {
            _this._piped = true;
        });
        this.on('unpipe', function (source) {
            _this._piped = true;
        });
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
        for (var _i = 0; _i < files.length; _i++) {
            var file = files[_i];
            this.push(file);
        }
    };
    return PassThroughStream;
})(_stream.Duplex);
exports.PassThroughStream = PassThroughStream;
