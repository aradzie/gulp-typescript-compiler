import * as _ev from 'events';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {FileCache, NullCache, WatchingCache} from './cache';
import loadAdapter from './adapter/factory';
import {PluginError, PassThroughStream, Env, hasExt, findExt} from './util';
import * as _lang from './lang';

export interface Adapter {
    parseOptions(env: Env, options: any, fileNames: string[]): {
        options: any;
        fileNames: string[];
        diagnostics: Diagnostic[];
    };
    compile(options: any, fileNames: string[], cache: FileCache): Result;
}

export class Project extends _ev.EventEmitter {
    private adapter: Adapter;
    private options: any = null;
    private fileNames: string[] = null;
    private cache: FileCache = null;

    constructor(private env: Env, private ts: any, options: any, fileNames: string[]) {
        super();

        this.adapter = loadAdapter(this.ts);

        let result = this.adapter.parseOptions(this.env, options, fileNames);

        if (result.diagnostics.length) {
            let messages = [];

            for (let d of result.diagnostics) {
                messages.push(Diagnostic.format(d));
            }

            _gu.log('TypeScript compiler:\n' + messages.join('\n'));

            throw new PluginError(`Invalid configuration`);
        }

        this.options = result.options;
        this.fileNames = result.fileNames;
    }

    compile(): Result {
        let result = this.adapter.compile(this.options, this.fileNames, new NullCache());
        result.reportDiagnostics();
        return result;
    }

    watch(callback: (result: Result) => void) {
        if (!_lang.isFunction(callback)) {
            throw new PluginError(`The callback argument is not a function`);
        }

        if (this.cache != null) {
            throw new PluginError(`Already watching`);
        }

        this.cache = new WatchingCache(this.env, ['ts', 'tsx', 'd.ts']);

        this.cache.on('change', () => {
            _gu.log('TypeScript compiler: File change detected. Starting incremental compilation...');
            callback(this._recompile());
        });

        callback(this._recompile());
    }

    private _recompile() {
        let result = this.adapter.compile(this.options, this.fileNames, this.cache);
        result.reportDiagnostics();
        _gu.log('TypeScript compiler: Compilation complete. Watching for file changes.');
        return result;
    }
}

export class File extends _gu.File {
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
    fileList: string[] = [];
    emitSkipped: boolean = false;
    diagnostics: Diagnostic[] = [];
    scripts: File[] = [];
    sourceMaps: File[] = [];
    declarations: File[] = [];

    reportDiagnostics() {
        let messages = [];

        if (this.emitSkipped) {
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit skipped'));
        }
        else if (this.diagnostics.length) {
            messages.push('TypeScript compiler: ' + _gu.colors.red('emit completed with errors'));
        }

        for (let d of this.diagnostics) {
            messages.push(Diagnostic.format(d));
        }

        if (messages.length) {
            _gu.log(messages.join('\n'));
        }
    }

    _create(base: string, path: string, data: string): void {
        let file = new File({
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

export enum DiagnosticCategory {
    Warning = 0,
    Error = 1,
    Message = 2,
}

export class DiagnosticChain {
    constructor(public category: DiagnosticCategory,
                public code: number,
                public message: string,
                public next: DiagnosticChain = null) {}

    toString() {
        return this.message;
    }
}

export class Diagnostic extends DiagnosticChain {
    fileName: string = null;
    start: number = null;
    length: number = null;
    line: number = null;
    character: number = null;

    constructor(category: DiagnosticCategory,
                code: number,
                message: string,
                next: DiagnosticChain = null) {
        super(category, code, message, next);
    }

    toString() {
        return Diagnostic.format(this);
    }

    static format(d: Diagnostic): string {
        let cn = {
            [DiagnosticCategory.Warning]: 'warning',
            [DiagnosticCategory.Error]: 'error',
            [DiagnosticCategory.Message]: 'message',
        };
        let output = '';
        if (d.fileName) {
            output += `${_path.relative(process.cwd(), d.fileName)}(${d.line + 1},${d.character + 1}): `;
        }
        output += `${cn[d.category]} TS${d.code}: ${d.message}`;
        let level = 1;
        let next = d.next;
        while (next) {
            output += '\n';
            for (let i = 0; i < level; i++) {
                output += '  ';
            }
            output += next.message;
            level++;
            next = next.next;
        }
        return output;
    }
}
