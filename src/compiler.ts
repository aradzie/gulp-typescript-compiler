import * as _ from 'lodash';
import * as _ev from 'events';
import * as _fs from 'fs';
import * as _path from 'path';
import * as _sm from 'source-map';
import * as _gu from 'gulp-util';
import {FileCache, NullCache, WatchingCache} from './cache';
import loadAdapter from './adapter/factory';
import {PluginError, PassThroughStream, Env, hasExt, findExt} from './util';

export interface Adapter {
    parseOptions(env: Env, options: any, fileNames: string[]): {
        options: any;
        fileNames: string[];
        diagnostics: Diagnostic[];
    };
    compile(options: any, fileNames: string[], cache: FileCache): Result;
}

export class Project extends _ev.EventEmitter {
    private formatter: DiagnosticFormatter;
    private adapter: Adapter;
    private options: any = null;
    private fileNames: string[] = null;
    private cache: FileCache = null;

    constructor(private env: Env, private ts: any, options: any, fileNames: string[]) {
        super();

        this.formatter = new DiagnosticFormatter(env);

        this.adapter = loadAdapter(this.ts);

        let result = this.adapter.parseOptions(this.env, options, fileNames);

        if (result.diagnostics.length) {
            let messages = [];

            for (let diagnostic of result.diagnostics) {
                messages.push(this.formatter.format(diagnostic));
            }

            _gu.log('TypeScript compiler:\n' + messages.join('\n'));

            throw new PluginError(`Invalid configuration`);
        }

        this.options = result.options;
        this.fileNames = result.fileNames;
    }

    compile(): Result {
        let result = this.adapter.compile(this.options, this.fileNames, new NullCache());
        result.formatter = this.formatter;
        result.reportDiagnostics();
        if (this.options.listFiles === true) {
            for (let inputFile of result.inputFiles) {
                console.log(inputFile.fileName);
            }
        }
        if (this.options.diagnostics === true) {
            // ???
        }
        return result;
    }

    watch(callback: (result: Result) => void) {
        if (!_.isFunction(callback)) {
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
        result.formatter = this.formatter;
        result.reportDiagnostics();
        _gu.log('TypeScript compiler: Compilation complete. Watching for file changes.');
        return result;
    }
}

export interface TextPosition {
    /** Zero-based line index. */
    line: number;
    /** Zero-based character index from the start of the line, tabs not expanded. */
    character: number;
}

export class TextFile {
    private lineMap: number[];

    constructor(public fileName: string, public text: string) {}

    getPosition(offset: number): TextPosition {
        this._initLineMap();
        if (offset < 0 || offset > this.text.length) {
            throw new Error();
        }
        let l = 0, h = this.lineMap.length - 1;
        while (l <= h) {
            let m = Math.floor((l + h) / 2);
            let begin = this.lineMap[m];
            let end = this.lineMap[m + 1];
            if (offset < begin) {
                h = m - 1;
                continue;
            }
            if (offset >= end) {
                l = m + 1;
                continue;
            }
            return { line: m, character: offset - begin };
        }
    }

    getLine(line: number): string {
        this._initLineMap();
        if (line < 0 || line >= this.lineMap.length) {
            throw new Error();
        }
        let begin = this.lineMap[line];
        let end = this.lineMap[line + 1];
        while (begin < end) {
            let ch = this.text.charCodeAt(end - 1);
            if (ch == Character.LF
                || ch == Character.CR
                || ch == Character.LINE_SEPARATOR
                || ch == Character.PARAGRAPH_SEPARATOR) {
                end--;
            }
            else {
                break;
            }
        }
        return this.text.substring(begin, end);
    }

    private _initLineMap() {
        if (!Array.isArray(this.lineMap)) {
            this.lineMap = [];
            let pos = 0;
            let lineStart = 0;
            while (pos < this.text.length) {
                switch (this.text.charCodeAt(pos++)) {
                    case Character.CR:
                        if (this.text.charCodeAt(pos) === Character.LF) {
                            pos++;
                        }
                    case Character.LF:
                    case Character.LINE_SEPARATOR:
                    case Character.PARAGRAPH_SEPARATOR:
                        this.lineMap.push(lineStart);
                        lineStart = pos;
                        break;
                }
            }
            this.lineMap.push(lineStart);
        }
    }
}

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
            messages.push(this.formatter.format(diagnostic));
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
    file: TextFile = null;
    start: number = null;
    length: number = null;

    constructor(category: DiagnosticCategory,
                code: number,
                message: string,
                next: DiagnosticChain = null) {
        super(category, code, message, next);
    }
}

export class DiagnosticFormatter {
    constructor(private env: Env,
                private pretty: boolean = true,
                private tabWidth: number = 4) {}

    format(diagnostic: Diagnostic): string {
        const colors = _gu.colors;
        const tabWidth = this.tabWidth;
        const categoryName = {
            [DiagnosticCategory.Warning]: colors.yellow('warning'),
            [DiagnosticCategory.Error]: colors.red('error'),
            [DiagnosticCategory.Message]: colors.blue('message'),
        };
        let output = '';
        if (diagnostic.file) {
            const { file, start, length } = diagnostic;
            if (this.pretty) {
                contents(file, start, length);
            }
            const fileName = this.env.relative(file.fileName);
            const position = file.getPosition(start);
            output += `${fileName}(${position.line + 1},${position.character + 1}): `;
        }
        output += `${categoryName[diagnostic.category]} TS${diagnostic.code}: ${diagnostic.message}`;
        let level = 1;
        let next = diagnostic.next;
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

        function contents(file: TextFile, start: number, length: number) {
            const { line: firstLine, character: firstLineChar } = file.getPosition(start);
            const { line: lastLine, character: lastLineChar } = file.getPosition(start + length);
            output += '\n';
            for (let n = firstLine; n <= lastLine; n++) {
                if (lastLine - firstLine >= 5) {
                    if (n >= firstLine + 2 && n <= lastLine - 2) {
                        if (n == firstLine + 2) {
                            output += gutter('...') + '\n';
                        }
                        continue;
                    }
                }
                let line = file.getLine(n);
                let expanded = expand(line);
                let begin = 0;
                let end = expanded.length;
                if (n == firstLine) {
                    begin = textColumn(line, firstLineChar);
                }
                if (n == lastLine) {
                    end = textColumn(line, lastLineChar);
                }
                output += gutter(n + 1) + ' ' + colors.italic(expanded) + '\n';
                output += gutter('') + ' ' + repeat(' ', begin) + colors.red(repeat('~', end - begin)) + '\n';
            }
            output += '\n';

            function gutter(s) {
                s = String(s);
                while (s.length < 6) {
                    s = ' ' + s;
                }
                return colors.bgBlack.white(s);
            }

            function repeat(s: string, n: number) {
                let r = '';
                while (n-- > 0) {
                    r += s;
                }
                return r;
            }

            function expand(line: string): string {
                let result = '';
                let column = 0;
                for (let n = 0; n < line.length; n++) {
                    if (line.charCodeAt(n) == Character.TAB) {
                        let end = (Math.floor(column / tabWidth) + 1) * tabWidth;
                        while (column < end) {
                            result += ' ';
                            column++;
                        }
                    }
                    else {
                        result += line.charAt(n);
                        column++;
                    }
                }
                return result;
            }

            function textColumn(line: string, character: number): number {
                let column = 0;
                for (let n = 0; n < character; n++) {
                    if (line.charCodeAt(n) == Character.TAB) {
                        let end = (Math.floor(column / tabWidth) + 1) * tabWidth;
                        while (column < end) {
                            column++;
                        }
                    }
                    else {
                        column++;
                    }
                }
                return column;
            }
        }
    }
}

const enum Character {
    TAB = 0x09, // \t
    LF = 0x0A, // \n
    CR = 0x0D, // \r
    LINE_SEPARATOR = 0x2028,
    PARAGRAPH_SEPARATOR = 0x2029,
}
