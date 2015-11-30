import * as _ from 'lodash';
import * as _ev from 'events';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {loadAdapter} from './adapter/factory';
import {FileCache, NullCache, WatchingCache} from './cache';
import {TextFile} from './textfile';
import {Diagnostic, DiagnosticFormatter, newFormatter} from './diagnostic';
import {Result} from './result';
import {PluginError, PassThroughStream, Env, hasExt, findExt, Character} from './util';

export interface Adapter {
    parseOptions(env: Env, options: any, fileNames: string[]): {
        options: any;
        fileNames: string[];
        diagnostics: Diagnostic[];
    };
    compile(options: any, fileNames: string[], cache: FileCache): Result;
}

export interface Project {
    env: Env;
    options: any;
    fileNames: string[];
    compile(): Result;
    watch(callback: (result: Result) => void);
}

export function newProject(env: Env, ts: any, _options: any, _fileNames: string[]): Project {
    const formatter = newFormatter(env);
    const adapter = loadAdapter(ts);
    let cache: FileCache = null;

    let result = adapter.parseOptions(env, _options, _fileNames);

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
        let result = adapter.compile(options, fileNames, new NullCache());
        result.formatter = formatter;
        result.reportDiagnostics();
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
            let result = adapter.compile(options, fileNames, cache);
            result.formatter = formatter;
            result.reportDiagnostics();
            _gu.log('TypeScript compiler: Compilation complete. Watching for file changes.');
            return result;
        }
    }
}
