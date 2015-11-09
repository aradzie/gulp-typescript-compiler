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
var PassThroughStream = (function (_super) {
    __extends(PassThroughStream, _super);
    function PassThroughStream(files) {
        _super.call(this, { objectMode: true });
        if (Array.isArray(files)) {
            for (var _i = 0; _i < files.length; _i++) {
                var file = files[_i];
                this.push(file);
            }
        }
    }
    return PassThroughStream;
})(_stream.PassThrough);
exports.PassThroughStream = PassThroughStream;
