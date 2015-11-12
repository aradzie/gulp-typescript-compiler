import _fs = require('fs');
import _path = require('path');
import _sm = require('source-map');
import _gu = require('gulp-util');
import _factory = require('./adapter/factory');
import _util = require('./util');
import _lang = require('./lang');

export interface Adapter {
    compile(options: any, fileNames: string[], result: Result);
}

export class Project {
    private _ts: any;
    private _options: any;
    private _fileNames: string[];
    private _adapter: Adapter;

    constructor(ts: any, options: any, fileNames: string[]) {
        this._ts = ts;
        this._options = options;
        this._fileNames = fileNames;
        this._adapter = _factory.load(this._ts);
    }

    compile(): Result {
        let result = new Result();
        this._adapter.compile(this._options, this._fileNames, result);
        return result;
    }

    watch(callback: (result: Result) => void) {
        if (!_lang.isFunction(callback)) {
            throw new _util.PluginError(`The callback argument is not a function`);
        }
        this.compile();
        throw new Error(`Not implemented`);
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
        let { basename, ext } = findExt(path);
        switch (ext) {
            case '.js':
            case '.jsx':
                this.scripts.push(file);
                break;
            case '.js.map':
            case '.jsx.map':
                this.sourceMaps.push(file);
                break;
            case '.d.ts':
                this.declarations.push(file);
                break;
            default:
                throw new Error(`Unknown extension of file '${path}'`);
        }

        function findExt(path: string): { basename: string; ext: string; } {
            let suffixes = ['.js', '.jsx', '.js.map', '.jsx.map', '.d.ts'];
            for (let suffix of suffixes) {
                if (path.toLowerCase().endsWith(suffix)) {
                    return {
                        basename: path.substring(0, path.length - suffix.length),
                        ext: suffix
                    }
                }
            }
            return {
                basename: path,
                ext: null
            }
        }
    }

    emit() {
        return new _util.PassThroughStream(
            [].concat(this.scripts, this.sourceMaps, this.declarations)
        );
    }

    emitScripts() {
        return new _util.PassThroughStream(this.scripts);
    }

    emitSourceMaps() {
        return new _util.PassThroughStream(this.sourceMaps);
    }

    emitDeclarations() {
        return new _util.PassThroughStream(this.declarations);
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
