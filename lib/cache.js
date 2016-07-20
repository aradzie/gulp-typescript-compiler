"use strict";
const _fs = require('fs');
function newFileCache() {
    const cachedFiles = Object.create(null);
    let watchCallback = null;
    let notifyTimeout = null;
    return { getCached, putCached, watch };
    function getCached(fileName) {
        let file = cachedFiles[fileName];
        if (file != null) {
            if (isFreshFile(file)) {
                return file.data;
            }
            evictFile(file);
        }
        return null;
    }
    function putCached(fileName, data) {
        let file = cachedFiles[fileName];
        if (file != null) {
            evictFile(file);
        }
        watchFile(file = cachedFiles[fileName] = {
            fileName,
            data,
            stats: _fs.statSync(fileName),
            watcher: null
        });
    }
    function watch(cb) {
        if (watchCallback != null) {
            return false;
        }
        watchCallback = cb;
        for (let fileName in Object.keys(cachedFiles)) {
            watchFile(cachedFiles[fileName]);
        }
        return true;
    }
    function watchFile(file) {
        unwatchFile(file);
        if (watchCallback != null) {
            file.watcher = _fs.watch(file.fileName, (event, fileName) => {
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
        const oldStats = file.stats;
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
