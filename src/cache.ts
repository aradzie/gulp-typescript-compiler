import {Env, hasExt, findExt} from './util';
import * as _lang from './lang';
import * as _ev from 'events';
import * as _fs from 'fs';
import * as _chokidar from 'chokidar';
import * as _gu from 'gulp-util';

export interface FileCache extends _ev.EventEmitter {
    getCached(fileName: string): any;

    putCached(fileName: string, data: any);
}

export class NullCache extends _ev.EventEmitter implements FileCache {
    getCached(fileName: string): any { return null; }

    putCached(fileName: string, data: any) {}
}

export class WatchingCache extends _ev.EventEmitter implements FileCache {
    private map: { [fileName: string]: any } = Object.create(null);
    private watcher: _fs.FSWatcher;
    private notifyTimeout: NodeJS.Timer = null;

    constructor(env: Env, ext: string[]) {
        super();

        this.watcher = _chokidar.watch(ext.map(s => `**/*.${s}`), {
            cwd: env.cwd,
            ignoreInitial: true
        });

        this.watcher
            .on('add', (path: string, stats: _fs.Stats) => {
                _gu.log(`TypeScript compiler: File ${_gu.colors.magenta(path)} has been added.`);
                this.evict(env.resolve(path));
            })
            .on('change', (path: string, stats: _fs.Stats) => {
                _gu.log(`TypeScript compiler: File ${_gu.colors.magenta(path)} has been changed.`);
                this.evict(env.resolve(path));
            })
            .on('unlink', (path: string) => {
                _gu.log(`TypeScript compiler: File ${_gu.colors.magenta(path)} has been removed.`);
                this.evict(env.resolve(path));
            });
    }

    close() {
        this.watcher.close();
    }

    getCached(fileName: string): any {
        let entry = this.map[fileName];
        if (entry != null) {
            return entry;
        }
        return null;
    }

    putCached(fileName: string, data: any) {
        this.map[fileName] = data;

        this.watcher.add(fileName);
    }

    private evict(fileName: string) {
        delete this.map[fileName];

        this.notify();
    }

    private notify() {
        if (this.notifyTimeout != null) {
            clearTimeout(this.notifyTimeout);
        }
        this.notifyTimeout = setTimeout(() => {
            this.notifyTimeout = null;

            this.emit('change');
        }, 250);
    }
}
