'use strict';

import * as _ from 'lodash';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _gu from 'gulp-util';
import {TextFile} from './textfile';
import {Env, hasExt, findExt} from './util';

export function patch<T>(sys: T): T {
    const replace = {
        fileExists(path: string): boolean {
            throw new Error()
        },
        readFile(path: string, encoding?: string): string {
            throw new Error()
        },
        directoryExists(path: string): boolean {
            throw new Error()
        },
        readDirectory(path: string, extension?: string, exclude?: string[]): string[] {
            throw new Error()
        },
    };

    const result = Object.create(Object.getPrototypeOf(sys));

    for (let key of Object.keys(sys)) {
        switch (key) {
            // Delete these properties.
            case 'watchFile':
            case 'watchDirectory':
                break;
            // Replace these properties.
            default:
                if (key in replace) {
                    result[key] = replace[key];
                }
                else {
                    result[key] = sys[key];
                }
                break;
        }
        result[key] = sys[key];
    }

    return result;
}
