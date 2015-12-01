"use strict";

import * as _ from 'lodash';
import * as _glob from 'glob';
import * as _minimatch from 'minimatch';
import * as _path from 'path';
import * as _stream from 'stream';
import * as _gu from 'gulp-util';

export class PluginError extends _gu.PluginError {
    constructor(message, options?: PluginErrorOptions) {
        super('gulp-typescript-compiler', message, options);
    }

    toString() {
        let header = `${_gu.colors.red(this.name)} in plugin '${_gu.colors.cyan(this.plugin)}'`;
        let body = `Message:\n${this.message.split('\n').map(pad).join('\n')}`;
        return `${header}\n${body}`;

        function pad(line) {
            return '  ' + line;
        }
    }
}

/**
 * The trick is to detect whether this is the first stream in a chain of pipes,
 * or an intermediate link. The first stream will not receive the end event,
 * therefore it must produce output immediately. An intermediate link will
 * receive the end event, and only then it must produce any output to append
 * files to the ones that have already been passed through.
 */
export class PassThroughStream extends _stream.Duplex {
    private _files: _gu.File[];
    private _piped: boolean;

    constructor(files: _gu.File[] = [], prepend: boolean = false) {
        super({ objectMode: true });
        this._files = [].concat(files);
        this._piped = false;
        if (prepend === null) {
            // Explicitly disable pass-through.
        }
        else {
            this.on('pipe', source => {
                this._piped = true;
            });
            this.on('unpipe', source => {
                this._piped = false;
            });
        }
        if (prepend) {
            this._dump();
        }
    }

    _read() {
        if (!this._piped) {
            this._dump();
            this.push(null);
        }
    }

    _write(file: _gu.File, encoding, callback: Function) {
        this.push(file);
        callback();
    }

    end() {
        this._dump();
        this.push(null);
    }

    private _dump() {
        let files = this._files;
        this._files = [];
        for (let file of files) {
            this.push(file);
        }
    }
}

export interface Env {
    cwd: string;
    resolve(path: string): string;
    relative(path: string): string;
    glob(globs: string[]): string[];
}

export function newEnv(cwd: string = process.cwd()): Env {
    return Object.freeze({
        cwd, resolve, relative, glob
    });

    function resolve(path: string): string {
        return _path.normalize(_path.resolve(cwd, path));
    }

    function relative(path: string): string {
        return _path.relative(cwd, resolve(path));
    }

    function glob(globs: string[]): string[] {
        let fileNames: string[] = [];

        let groups = [] as { positive: string; negative: string[]; }[];
        let last = null as { positive: string; negative: string[]; };

        globs.forEach(glob => {
            if (glob.startsWith('!')) {
                if (last == null) {
                    throw new PluginError('Globs cannot start with a negative pattern');
                }
                last.negative.push(resolve(glob.substring(1)));
            }
            else {
                groups.push(last = {
                    positive: resolve(glob),
                    negative: []
                });
            }
        });

        if (last == null) {
            throw new PluginError('Globs are empty');
        }

        let options = { cwd };

        groups.forEach(group => {
            let found = _glob.sync(group.positive, options);
            if (found.length > 0) {
                found.forEach(fileName => {
                    if (!group.negative.some(negative => _minimatch(fileName, negative))) {
                        fileNames.push(fileName);
                    }
                });
            }
            else if (!_glob.hasMagic(group.positive, options)) {
                throw new PluginError(`File not found with singular glob: ${group.positive}`);
            }
        });

        return fileNames.filter(unique);

        function unique<T>(value: T, index: number, array: T[]): boolean {
            return array.indexOf(value) === index;
        }
    }
}

export function hasExt(fileName: string, extList: string[]) {
    for (let ext of extList) {
        if (fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
            return true;
        }
    }
    return false;
}

export function findExt(fileName: string, extList: string[]): { basename: string; ext: string; } {
    for (let ext of extList) {
        if (fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
            return {
                basename: fileName.substring(0, fileName.length - ext.length - 1),
                ext: ext
            }
        }
    }
    return {
        basename: fileName,
        ext: null
    }
}

export const enum Character {
    TAB = 0x09, // \t
    LF = 0x0A, // \n
    CR = 0x0D, // \r
    LINE_SEPARATOR = 0x2028,
    PARAGRAPH_SEPARATOR = 0x2029,
}
