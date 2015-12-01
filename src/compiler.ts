"use strict";

import * as _ from 'lodash';
import * as _ev from 'events';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {Adapter, ParseOptionsResult, CompileResult} from './adapter/api';
import {loadAdapter} from './adapter/factory';
import {FileCache, NullCache, WatchingCache} from './cache';
import {TextFile} from './textfile';
import {Diagnostic, DiagnosticFormatter, newFormatter} from './diagnostic';
import {Result, newResult} from './result';
import {PluginError, Env} from './util';

export interface Project {
    env: Env;
    options: any;
    fileNames: string[];
    compile(): Result;
    watch(callback: (result: Result) => void);
}

export function newProject(env: Env, ts: any, _options: any, _fileNames: string[]): Project {
    const formatter = newFormatter(env);
    const adapter = loadAdapter(env, ts);
    let cache: FileCache = null;

    let result = adapter.parseOptions(_options, _fileNames);

    if (result.diagnostics.length) {
        let messages = [];

        for (let diagnostic of result.diagnostics) {
            messages.push(formatter(diagnostic));
        }

        _gu.log('TypeScript compiler:\n' + messages.join('\n'));

        throw new PluginError(`Invalid configuration`);
    }

    let { options, fileNames } = result;

    return { env, options, fileNames, compile, watch };

    function compile(): Result {
        let result = newResult(env, options, fileNames,
            adapter.compile(options, fileNames, new NullCache()), formatter);
        if (options.listFiles === true) {
            for (let inputFile of result.inputFiles) {
                console.log(inputFile.fileName);
            }
        }
        if (options.diagnostics === true) {
            // ???
        }
        return result;
    }

    function watch(callback: (result: Result) => void) {
        if (!_.isFunction(callback)) {
            throw new PluginError(`The callback argument is not a function`);
        }

        if (cache != null) {
            throw new PluginError(`Already watching`);
        }

        cache = new WatchingCache(env, ['ts', 'tsx', 'd.ts']);

        cache.on('change', () => {
            _gu.log('TypeScript compiler: File change detected. Starting incremental compilation...');
            callback(recompile());
        });

        callback(recompile());

        function recompile() {
            let result = newResult(env, options, fileNames,
                adapter.compile(options, fileNames, cache), formatter);
            _gu.log('TypeScript compiler: Compilation complete. Watching for file changes.');
            return result;
        }
    }
}
