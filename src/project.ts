'use strict';

import * as _ from 'lodash';
import * as _gu from 'gulp-util';
import {Adapter, ParseOptionsResult, CompileResult} from './adapter/api';
import {newAdapter} from './adapter/factory';
import {FileCache, newFileCache} from './cache';
import {Diagnostic, DiagnosticFormatter, newFormatter} from './diagnostic';
import {Result, newResult} from './result';
import {PluginError, Env, log} from './util';

export interface Project {
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
        messages.push(_gu.colors.red('Invalid compiler options'));
        for (let diagnostic of diagnostics) {
            messages.push(formatter(diagnostic));
        }
        log(messages.join('\n'));
        throw new PluginError(`Invalid compiler options`);
    }

    return { compile, watch };

    function compile(): Result {
        const started = Date.now();
        const compileResult = adapter.compile(options, fileNames, cache);
        const finished = Date.now();

        if (options.diagnostics === true) {
            log(`Compilation completed in ${formatTime(finished - started)}.`);
        }

        if (options.listFiles === true) {
            for (let inputFile of compileResult.inputFiles) {
                console.log(inputFile.fileName);
            }
        }

        return newResult(options.rootDir, compileResult, formatter);
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
            log(`File change detected. Starting incremental compilation...`);

            callback(recompile());
        }

        function recompile() {
            const started = Date.now();
            const compileResult = adapter.compile(options, fileNames, cache);
            const finished = Date.now();

            log(`Compilation completed in ${formatTime(finished - started)}. Watching for file changes.`);

            return newResult(options.rootDir, compileResult, formatter);
        }
    }

    function formatTime(time) {
        if (time < 1000) {
            return time + 'ms';
        }
        return (time / 1000) + 's';
    }
}
