'use strict';

import * as _ from 'lodash';
import * as _stream from 'stream';
import * as _gu from 'gulp-util';
import {Adapter, ParseOptionsResult, CompileResult} from './adapter/api';
import {newAdapter} from './adapter/factory';
import {FileCache, newFileCache} from './cache';
import {Diagnostic, DiagnosticFormatter, newFormatter} from './diagnostic';
import {Result, newResult} from './result';
import {patch} from './vfs';
import {PluginError, Env, log} from './util';

export interface Project {
    options: any;
    fileNames: string[];
    compile(): Result;
    watch(callback: (result: Result) => void);
    stream();
}

export function newProject(env: Env, ts: any, _options: any, _fileNames: string[]): Project {
    const sys = ts.sys;
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

    return { options, fileNames, compile, watch, stream };

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

        return newResult(options, fileNames, compileResult, formatter);
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

            return newResult(options, fileNames, compileResult, formatter);
        }
    }

    function stream() {
        const fileList: _gu.File[] = [];

        return new class CompileStream extends _stream.Duplex {
            constructor() {
                super({ objectMode: true });
            }

            _write(file: _gu.File, encoding: string, cb: Function) {
                console.log('write', file.path);
                if (file.isNull()) {
                    cb();
                    return;
                }
                if (file.isStream()) {
                    cb(new PluginError(`Streaming not supported`));
                    return;
                }
                fileList.push(file);
                cb();
            }

            _read() {}

            end(chunk?, encoding?, cb?) {
                console.log('end');
                ts.sys = patch(sys, fileList);
                try {
                    const result = compile();
                    if (!result.emitSkipped) {
                        for (let file of result.scripts) {
                            this.push(file);
                        }
                        for (let file of result.sourceMaps) {
                            this.push(file);
                        }
                        for (let file of result.declarations) {
                            this.push(file);
                        }
                    }
                    this.push(null);
                }
                finally {
                    ts.sys = sys;
                }
            }
        }
    }

    function formatTime(time) {
        if (time < 1000) {
            return time + 'ms';
        }
        return (time / 1000) + 's';
    }
}
