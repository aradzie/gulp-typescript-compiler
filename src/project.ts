"use strict";

import * as _ from 'lodash';
import * as _ev from 'events';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {Adapter, ParseOptionsResult, CompileResult} from './adapter/api';
import {newAdapter} from './adapter/factory';
import {FileCache, newFileCache} from './cache';
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
    const cache = newFileCache();
    const formatter = newFormatter(env);
    const adapter = newAdapter(env, ts);

    const { options, fileNames, diagnostics } = adapter.parseOptions(_options, _fileNames);

    if (diagnostics.length) {
        let messages = [];

        for (let diagnostic of diagnostics) {
            messages.push(formatter(diagnostic));
        }

        _gu.log('TypeScript compiler:\n' + messages.join('\n'));

        throw new PluginError(`Invalid configuration`);
    }

    return { env, options, fileNames, compile, watch };

    function compile(): Result {
        const result = newResult(env, options, fileNames,
            adapter.compile(options, fileNames, cache), formatter);

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

        if (!cache.watch(onChange)) {
            throw new PluginError(`Already watching`);
        }

        callback(recompile());

        function onChange() {
            _gu.log(`TypeScript compiler: File change detected. Starting incremental compilation...`);
            callback(recompile());
        }

        function recompile() {
            const started = Date.now();
            const result = newResult(env, options, fileNames,
                adapter.compile(options, fileNames, cache), formatter);
            const finished = Date.now();
            _gu.log(`TypeScript compiler: Compilation completed in ${formatTime(finished - started)}. Watching for file changes.`);
            return result;
        }
    }

    function formatTime(time) {
        if (time < 1000) {
            return time + 'ms';
        }
        return (time / 1000) + 's';
    }
}
