'use strict';
var _fs = require('fs');
/**
 * TODO Make it work with VFS.
 */
function newFileCache() {
    var cachedFiles = Object.create(null);
    var watchCallback = null;
    var notifyTimeout = null;
    return { getCached: getCached, putCached: putCached, watch: watch };
    function getCached(fileName) {
        var file = cachedFiles[fileName];
        if (file != null) {
            if (isFreshFile(file)) {
                return file.data;
            }
            evictFile(file);
        }
        return null;
    }
    function putCached(fileName, data) {
        var file = cachedFiles[fileName];
        if (file != null) {
            evictFile(file);
        }
        watchFile(file = cachedFiles[fileName] = {
            fileName: fileName,
            data: data,
            stats: _fs.statSync(fileName),
            watcher: null
        });
    }
    function watch(cb) {
        if (watchCallback != null) {
            return false;
        }
        watchCallback = cb;
        for (var fileName in Object.keys(cachedFiles)) {
            watchFile(cachedFiles[fileName]);
        }
        return true;
    }
    function watchFile(file) {
        unwatchFile(file);
        if (watchCallback != null) {
            file.watcher = _fs.watch(file.fileName, function (event, fileName) {
                evictFile(file);
                notify();
            });
        }
    }
    function unwatchFile(file) {
        if (file.watcher != null) {
            file.watcher.close();
            file.watcher = null;
        }
    }
    function evictFile(file) {
        if (file != null) {
            unwatchFile(file);
            delete cachedFiles[file.fileName];
        }
    }
    function isFreshFile(file) {
        var oldStats = file.stats;
        try {
            var newStats = _fs.statSync(file.fileName);
        }
        catch (ex) {
            return false;
        }
        return newStats.isFile()
            && oldStats.size == newStats.size
            && oldStats.mtime.getTime() == newStats.mtime.getTime();
    }
    function notify() {
        if (notifyTimeout != null) {
            clearTimeout(notifyTimeout);
        }
        notifyTimeout = setTimeout(onTimeout, 250);
        function onTimeout() {
            notifyTimeout = null;
            if (watchCallback != null) {
                watchCallback();
            }
        }
    }
}
exports.newFileCache = newFileCache;
