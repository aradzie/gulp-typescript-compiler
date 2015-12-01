'use strict';

import * as _ from 'lodash';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _gu from 'gulp-util';
import {TextFile} from './textfile';
import {PluginError, Env, hasExt, findExt} from './util';

export interface System {
    fileExists(path: string): boolean;
    readFile(path: string, encoding?: string): string;
    directoryExists(path: string): boolean;
    readDirectory(path: string, extension?: string, exclude?: string[]): string[];
}

/**
 * TODO Make it work with the file cache.
 */
export function overlay<T extends System>(sys: T, files: _gu.File[]): T {
    const fileMap: _.Dictionary<_gu.File> = Object.create(null);

    for (let file of files) {
        if (!Buffer.isBuffer(file.contents)) {
            throw new PluginError(`File contents is not a buffer: ${file.path}`);
        }
        if (file.path in fileMap) {
            throw new PluginError(`File already exists: ${file.path}`);
        }
        fileMap[file.path] = file;
    }

    const result = Object.create(Object.getPrototypeOf(sys));

    for (let key of Object.keys(sys)) {
        switch (key) {
            case 'watchFile':
            case 'watchDirectory':
                break;
            case 'fileExists':
                result[key] = fileExists;
                break;
            case 'readFile':
                result[key] = readFile;
                break;
            default:
                result[key] = sys[key];
                break;
        }
    }

    return result;

    function fileExists(path: string): boolean {
        if (path in fileMap) {
            return true;
        }
        return sys.fileExists(path);
    }

    function readFile(path: string, encoding?: string): string {
        if (path in fileMap) {
            return String(fileMap[path].contents);
        }
        return sys.readFile(path, encoding);
    }
}
