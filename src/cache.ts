import {Env, hasExt, findExt} from './util';
import * as _lang from './lang';
import * as _ev from 'events';
import * as _fs from 'fs';

interface CachedFile {
    watcher: _fs.FSWatcher;
    data: any;
}

export interface FileCache extends _ev.EventEmitter {
    clear();
    getCached(fileName: string): any;
    putCached(fileName: string, data: any);
}

export class NullCache extends _ev.EventEmitter implements FileCache {
    clear() { this.emit('clear'); }

    getCached(fileName: string): any { return null; }

    putCached(fileName: string, data: any) {}
}

export class WatchingCache extends _ev.EventEmitter implements FileCache {
    private map: { [fileName: string]: CachedFile } = Object.create(null);
    private watcher: _fs.FSWatcher;

    constructor(private env: Env, private ext: string[]) {
        super();

        this.watcher = _fs.watch(env.cwd, { recursive: true }, (event, relativeFileName) => {
            let fileName = this.env.resolve(relativeFileName);

            if (hasExt(fileName, ext)) {
                this.evict(fileName);

                this.emit('change', fileName);
            }
        });
    }

    clear() {
        for (let fileName of Object.keys(this.map)) {
            this.evict(fileName);
        }

        this.emit('clear');
    }

    getCached(fileName: string): any {
        let entry = this.map[fileName];
        if (entry != null && entry.watcher != null) {
            return entry.data;
        }
        return null;
    }

    putCached(fileName: string, data: any) {
        this.evict(fileName);

        let entry = {
            watcher: null,
            data: data
        };

        this.map[fileName] = entry;

        entry.watcher = _fs.watch(fileName, {}, (event, relativeFileName) => {
            this.evict(fileName);

            this.emit('change', fileName);
        });
    }

    private evict(fileName: string) {
        let entry = this.map[fileName];
        if (entry != null) {
            if (entry.watcher != null) {
                entry.watcher.close();
                entry.watcher = null;
            }
            delete this.map[fileName];
        }
    }
}
