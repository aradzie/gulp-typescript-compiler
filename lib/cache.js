var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ev = require('events');
var _chokidar = require('chokidar');
var _gu = require('gulp-util');
var NullCache = (function (_super) {
    __extends(NullCache, _super);
    function NullCache() {
        _super.apply(this, arguments);
    }
    NullCache.prototype.getCached = function (fileName) { return null; };
    NullCache.prototype.putCached = function (fileName, data) { };
    return NullCache;
})(_ev.EventEmitter);
exports.NullCache = NullCache;
var WatchingCache = (function (_super) {
    __extends(WatchingCache, _super);
    function WatchingCache(env, ext) {
        var _this = this;
        _super.call(this);
        this.map = Object.create(null);
        this.notifyTimeout = null;
        this.watcher = _chokidar.watch(ext.map(function (s) { return ("**/*." + s); }), {
            cwd: env.cwd,
            ignoreInitial: true
        });
        this.watcher
            .on('add', function (path, stats) {
            _gu.log("TypeScript compiler: File " + _gu.colors.magenta(path) + " has been added.");
            _this.evict(env.resolve(path));
        })
            .on('change', function (path, stats) {
            _gu.log("TypeScript compiler: File " + _gu.colors.magenta(path) + " has been changed.");
            _this.evict(env.resolve(path));
        })
            .on('unlink', function (path) {
            _gu.log("TypeScript compiler: File " + _gu.colors.magenta(path) + " has been removed.");
            _this.evict(env.resolve(path));
        });
    }
    WatchingCache.prototype.close = function () {
        this.watcher.close();
    };
    WatchingCache.prototype.getCached = function (fileName) {
        var entry = this.map[fileName];
        if (entry != null) {
            return entry;
        }
        return null;
    };
    WatchingCache.prototype.putCached = function (fileName, data) {
        this.map[fileName] = data;
        this.watcher.add(fileName);
    };
    WatchingCache.prototype.evict = function (fileName) {
        delete this.map[fileName];
        this.notify();
    };
    WatchingCache.prototype.notify = function () {
        var _this = this;
        if (this.notifyTimeout != null) {
            clearTimeout(this.notifyTimeout);
        }
        this.notifyTimeout = setTimeout(function () {
            _this.notifyTimeout = null;
            _this.emit('change');
        }, 250);
    };
    return WatchingCache;
})(_ev.EventEmitter);
exports.WatchingCache = WatchingCache;
