var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('./util');
var _ev = require('events');
var _fs = require('fs');
var NullCache = (function (_super) {
    __extends(NullCache, _super);
    function NullCache() {
        _super.apply(this, arguments);
    }
    NullCache.prototype.clear = function () { this.emit('clear'); };
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
        this.env = env;
        this.ext = ext;
        this.map = Object.create(null);
        this.watcher = _fs.watch(env.cwd, { recursive: true }, function (event, relativeFileName) {
            var fileName = _this.env.resolve(relativeFileName);
            if (util_1.hasExt(fileName, ext)) {
                _this.evict(fileName);
                _this.emit('change', fileName);
            }
        });
    }
    WatchingCache.prototype.clear = function () {
        for (var _i = 0, _a = Object.keys(this.map); _i < _a.length; _i++) {
            var fileName = _a[_i];
            this.evict(fileName);
        }
        this.emit('clear');
    };
    WatchingCache.prototype.getCached = function (fileName) {
        var entry = this.map[fileName];
        if (entry != null && entry.watcher != null) {
            return entry.data;
        }
        return null;
    };
    WatchingCache.prototype.putCached = function (fileName, data) {
        var _this = this;
        this.evict(fileName);
        var entry = {
            watcher: null,
            data: data
        };
        this.map[fileName] = entry;
        entry.watcher = _fs.watch(fileName, {}, function (event, relativeFileName) {
            _this.evict(fileName);
            _this.emit('change', fileName);
        });
    };
    WatchingCache.prototype.evict = function (fileName) {
        var entry = this.map[fileName];
        if (entry != null) {
            if (entry.watcher != null) {
                entry.watcher.close();
                entry.watcher = null;
            }
            delete this.map[fileName];
        }
    };
    return WatchingCache;
})(_ev.EventEmitter);
exports.WatchingCache = WatchingCache;
