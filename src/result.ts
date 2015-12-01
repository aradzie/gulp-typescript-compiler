"use strict";

import * as _ from 'lodash';
import * as _ev from 'events';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {TextFile} from './textfile';
import {Diagnostic, DiagnosticFormatter, newFormatter} from './diagnostic';
import {PluginError, PassThroughStream, Env, hasExt, findExt, Character} from './util';

export class OutputFile extends _gu.File {
    sourceMap: _sm.RawSourceMap = null;

    constructor(options?: {
        cwd?: string;
        base?: string;
        path?: string;
        history?: string[];
        stat?: _fs.Stats;
        contents?: Buffer | NodeJS.ReadWriteStream;
    }) {
        super(options);
    }
}

export class Result {
    formatter: DiagnosticFormatter = null;
    inputFiles: TextFile[] = [];
    emitSkipped: boolean = false;
    diagnostics: Diagnostic[] = [];
    scripts: OutputFile[] = [];
    sourceMaps: OutputFile[] = [];
    declarations: OutputFile[] = [];

    reportDiagnostics() {
        let messages = [];

        if (this.emitSkipped) {
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit skipped'));
        }
        else if (this.diagnostics.length) {
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit completed with errors'));
        }

        for (let diagnostic of this.diagnostics) {
            messages.push(this.formatter(diagnostic));
        }

        if (messages.length) {
            _gu.log(messages.join('\n'));
        }
    }

    _create(base: string, path: string, data: string): void {
        let file = new OutputFile({
            base: base,
            path: path,
            contents: new Buffer(data)
        });
        let { basename, ext } = findExt(path, ['js', 'jsx', 'js.map', 'jsx.map', 'd.ts']);
        switch (ext) {
            case 'js':
            case 'jsx':
                this.scripts.push(file);
                break;
            case 'js.map':
            case 'jsx.map':
                this.sourceMaps.push(file);
                break;
            case 'd.ts':
                this.declarations.push(file);
                break;
            default:
                throw new Error(`Unknown extension of file '${path}'`);
        }
    }

    emit() {
        return new PassThroughStream(
            [].concat(this.scripts, this.sourceMaps, this.declarations)
        );
    }

    emitScripts() {
        return new PassThroughStream(this.scripts);
    }

    emitSourceMaps() {
        return new PassThroughStream(this.sourceMaps);
    }

    emitDeclarations() {
        return new PassThroughStream(this.declarations);
    }

    writeFiles() {
        let files = [].concat(this.scripts, this.sourceMaps, this.declarations);
        for (let file of files) {
            mkdirpSync(_path.dirname(file.path));
            _fs.writeFileSync(file.path, file.contents, { encoding: 'UTF-8' });
        }

        function mkdirpSync(path: string) {
            try {
                var stats = _fs.lstatSync(path);
            }
            catch (ex) {}
            if (!stats || !stats.isDirectory()) {
                mkdirpSync(_path.dirname(path));
                _fs.mkdirSync(path);
            }
        }
    }
}
