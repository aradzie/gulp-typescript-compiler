import * as _ from "lodash";
import * as _fs from "fs";

export interface FileCache {
    getCached(fileName: string): any;

    putCached(fileName: string, data: any);

    watch(cb: () => void): boolean;
}

export function newFileCache(): FileCache {
    const cachedFiles: _.Dictionary<CachedFile> = Object.create(null);
    let watchCallback: Function = null;
    let notifyTimeout: NodeJS.Timer = null;

    return {
        getCached,
        putCached,
        watch,
    };

    function getCached(fileName: string): any {
        let file = cachedFiles[fileName];
        if (file != null) {
            if (isFreshFile(file)) {
                return file.data;
            }
            evictFile(file);
        }
        return null;
    }

    function putCached(fileName: string, data: any) {
        let file = cachedFiles[fileName];
        if (file != null) {
            evictFile(file);
        }
        watchFile(file = cachedFiles[fileName] = {
            fileName,
            data,
            stats: _fs.statSync(fileName),
            watcher: null,
        });
    }

    function watch(cb: () => void): boolean {
        if (watchCallback != null) {
            return false;
        }
        watchCallback = cb;
        for (const fileName in Object.keys(cachedFiles)) {
            watchFile(cachedFiles[fileName]);
        }
        return true;
    }

    function watchFile(file: CachedFile) {
        unwatchFile(file);
        if (watchCallback != null) {
            file.watcher = _fs.watch(file.fileName, (event: string, fileName: string) => {
                evictFile(file);
                notify();
            });
        }
    }

    function unwatchFile(file: CachedFile) {
        if (file.watcher != null) {
            file.watcher.close();
            file.watcher = null;
        }
    }

    function evictFile(file: CachedFile) {
        if (file != null) {
            unwatchFile(file);
            delete cachedFiles[file.fileName];
        }
    }

    function isFreshFile(file: CachedFile) {
        const oldStats = file.stats;
        let newStats;
        try {
            newStats = _fs.statSync(file.fileName);
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

interface CachedFile {
    fileName: string;
    data: any;
    stats: _fs.Stats;
    watcher: _fs.FSWatcher;
}
