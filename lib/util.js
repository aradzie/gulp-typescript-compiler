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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOlsiUGx1Z2luRXJyb3IiLCJQbHVnaW5FcnJvci5jb25zdHJ1Y3RvciIsIlBsdWdpbkVycm9yLnRvU3RyaW5nIiwiUGx1Z2luRXJyb3IudG9TdHJpbmcucGFkIiwiUGFzc1Rocm91Z2hTdHJlYW0iLCJQYXNzVGhyb3VnaFN0cmVhbS5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxJQUFPLE9BQU8sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUNuQyxJQUFPLEdBQUcsV0FBVyxXQUFXLENBQUMsQ0FBQztBQUdsQztJQUFpQ0EsK0JBQWVBO0lBQzVDQSxxQkFBWUEsT0FBT0EsRUFBRUEsT0FBNEJBO1FBQzdDQyxrQkFBTUEsMEJBQTBCQSxFQUFFQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFBQTtJQUN2REEsQ0FBQ0E7SUFFREQsOEJBQVFBLEdBQVJBO1FBQ0lFLElBQUlBLE1BQU1BLEdBQU1BLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLG9CQUFlQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFHQSxDQUFDQTtRQUN4RkEsSUFBSUEsSUFBSUEsR0FBR0EsZUFBYUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBR0EsQ0FBQ0E7UUFDdkVBLE1BQU1BLENBQUlBLE1BQU1BLFVBQUtBLElBQU1BLENBQUNBO1FBRTVCQSxhQUFhQSxJQUFJQTtZQUNiQyxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDTEQsQ0FBQ0E7SUFDTEYsa0JBQUNBO0FBQURBLENBQUNBLEFBZEQsRUFBaUMsR0FBRyxDQUFDLFdBQVcsRUFjL0M7QUFkWSxtQkFBVyxjQWN2QixDQUFBO0FBRUQ7SUFBdUNJLHFDQUFtQkE7SUFDdERBLDJCQUFZQSxLQUFrQkE7UUFDMUJDLGtCQUFNQSxFQUFFQSxVQUFVQSxFQUFFQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLEdBQUdBLENBQUNBLENBQWFBLFVBQUtBLEVBQWpCQSxpQkFBUUEsRUFBUkEsSUFBaUJBLENBQUNBO2dCQUFsQkEsSUFBSUEsSUFBSUEsR0FBSUEsS0FBS0EsSUFBVEE7Z0JBQ1RBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO2FBQ25CQTtRQUNMQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUNMRCx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFURCxFQUF1QyxPQUFPLENBQUMsV0FBVyxFQVN6RDtBQVRZLHlCQUFpQixvQkFTN0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5pbXBvcnQgX2d1ID0gcmVxdWlyZSgnZ3VscC11dGlsJyk7XG5pbXBvcnQgX2xhbmcgPSByZXF1aXJlKCcuL2xhbmcnKTtcblxuZXhwb3J0IGNsYXNzIFBsdWdpbkVycm9yIGV4dGVuZHMgX2d1LlBsdWdpbkVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBvcHRpb25zPzogUGx1Z2luRXJyb3JPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKCdndWxwLXR5cGVzY3JpcHQtY29tcGlsZXInLCBtZXNzYWdlLCBvcHRpb25zKVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgaGVhZGVyID0gYCR7X2d1LmNvbG9ycy5yZWQodGhpcy5uYW1lKX0gaW4gcGx1Z2luICcke19ndS5jb2xvcnMuY3lhbih0aGlzLnBsdWdpbil9J2A7XG4gICAgICAgIGxldCBib2R5ID0gYE1lc3NhZ2U6XFxuJHt0aGlzLm1lc3NhZ2Uuc3BsaXQoJ1xcbicpLm1hcChwYWQpLmpvaW4oJ1xcbicpfWA7XG4gICAgICAgIHJldHVybiBgJHtoZWFkZXJ9XFxuJHtib2R5fWA7XG5cbiAgICAgICAgZnVuY3Rpb24gcGFkKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhc3NUaHJvdWdoU3RyZWFtIGV4dGVuZHMgX3N0cmVhbS5QYXNzVGhyb3VnaCB7XG4gICAgY29uc3RydWN0b3IoZmlsZXM/OiBfZ3UuRmlsZVtdKSB7XG4gICAgICAgIHN1cGVyKHsgb2JqZWN0TW9kZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZmlsZXMpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19