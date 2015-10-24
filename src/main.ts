/// <reference path='../typings/tsd.d.ts' />

import _ts = require('typescript');
import _fs = require('fs');
import _path = require('path');
import _stream = require('stream');
import _vinyl = require('vinyl');
import _glob = require('glob');
import _gu = require('gulp-util');
import _util = require('./util');
import _adapter = require('./adapter');
import _options = require('./options');
import _lang = require('./lang');

interface FileGroup {
    script: _gu.File;
    sourceMap: _gu.File;
    declaration: _gu.File;
}

class Plugin {
    _files: _lang.Map<FileGroup> = Object.create(null);
    _scripts: _gu.File[] = [];
    _sourceMaps: _gu.File[] = [];
    _declarations: _gu.File[] = [];

    constructor(public _options: _ts.CompilerOptions, public _fileNames: string[]) {
        let host = _ts.createCompilerHost(_options);
        let program = _ts.createProgram(_fileNames, _options, host);
        let diagnostics = [].concat(
            program.getSyntacticDiagnostics(),
            program.getOptionsDiagnostics(),
            program.getGlobalDiagnostics(),
            program.getSemanticDiagnostics()
        );
        if (diagnostics.length > 0) {
            reportDiagnostics(diagnostics);
        }
        else {
            let result = program.emit(undefined, this._write.bind(this), undefined);
            if (result.diagnostics.length > 0) {
                reportDiagnostics(result.diagnostics);
            }
            else {
                _lang.forEach(this._files, (base, fileGroup) => {
                    fileGroup.script.sourceMap = fileGroup.sourceMap;
                    fileGroup.script.declaration = fileGroup.declaration;
                });
            }
        }
    }

    private _write(fileName: string, data: string): void {
        let file = new _gu.File({
            path: fileName,
            base: this._options.rootDir,
            contents: new Buffer(data)
        });
        let { base, ext } = findExt(fileName.toLowerCase());
        switch (ext) {
            case '.js':
            case '.jsx':
                this._scripts.push(file);
                this._findFileGroup(base).script = file;
                break;
            case '.js.map':
            case '.jsx.map':
                this._sourceMaps.push(file);
                this._findFileGroup(base).sourceMap = file;
                break;
            case '.d.ts':
                this._declarations.push(file);
                this._findFileGroup(base).declaration = file;
                break;
            default:
                throw new Error(`Unknown file type '${fileName}'`);
        }
    }

    private _findFileGroup(base: string): FileGroup {
        let fileGroup = this._files[base];
        if (fileGroup == null) {
            fileGroup = this._files[base] = {
                script: null,
                sourceMap: null,
                declaration: null,
            };
        }
        return fileGroup;
    }

    emit() {
        return new _util.PassThroughStream(
            [].concat(this._scripts, this._sourceMaps, this._declarations)
        );
    }

    emitScripts() {
        return new _util.PassThroughStream(this._scripts);
    }

    emitSourceMaps() {
        return new _util.PassThroughStream(this._sourceMaps);
    }

    emitDeclarations() {
        return new _util.PassThroughStream(this._declarations);
    }

    writeFiles() {
        let files = [].concat(this._scripts, this._sourceMaps, this._declarations);
        for (let file of files) {
            mkdirpSync(_path.dirname(file.path));
            _fs.writeFileSync(file.path, file.contents, { encoding: 'UTF-8' });
        }

        function mkdirpSync(path: string) {
            try {
                var stats = _fs.lstatSync(path);
            }
            catch (ex) { }
            if (!stats || !stats.isDirectory()) {
                mkdirpSync(_path.dirname(path));
                _fs.mkdirSync(path);
            }
        }
    }
}

function plugin(config: Object, globs: string | string[]): Plugin {
    if (!_lang.isObject(config)) {
        throw new _util.PluginError(`The config argument is not an object`);
    }

    if (!_lang.isString(globs)) {
        if (!Array.isArray(globs)) {
            throw new _util.PluginError(`The globs argument is not a string or array of strings`);
        }
    }
    else {
        globs = [<string>globs];
    }

    let fileNames = findFiles(<string[]>globs);

    if (!fileNames.length) {
        throw new _util.PluginError(`The matched file set is empty`);
    }

    let adapter = _options.loadAdapter(config);

    let notifier = new _util.AccumulatingNotifier();

    let options = _options.parseCompilerOptions(config, resolvePath, notifier);

    notifier.fire();

    return new Plugin(options, fileNames);
}

function findFiles(globs: string[]): string[] {
    let fileNames: string[] = [];
    for (let glob of globs) {
        fileNames = fileNames.concat(_glob.sync(glob, { nodir: true }));
    }
    return fileNames.map(resolvePath).filter(unique);

    function unique<T>(value: T, index: number, array: T[]) {
        return array.indexOf(value) === index;
    }
}

function resolvePath(path: string): string {
    return _path.normalize(_path.resolve(process.cwd(), path));
}

function findExt(path: string): { base: string; ext: string; } {
    let suffixes = ['.js', '.jsx', '.js.map', '.jsx.map', '.d.ts'];
    for (let suffix of suffixes) {
        if (path.endsWith(suffix)) {
            return {
                base: path.substring(0, path.length - suffix.length),
                ext: suffix
            }
        }
    }
    return {
        base: path,
        ext: null
    }
}

function reportDiagnostics(diagnostics: _ts.Diagnostic[]) {
    for (let diagnostic of diagnostics) {
        reportDiagnostic(diagnostic);
    }
}

function reportDiagnostic(diagnostic: _ts.Diagnostic) {
    let output = '';

    if (diagnostic.file) {
        let loc = _ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
        output += `${ diagnostic.file.fileName }(${ loc.line + 1 },${ loc.character + 1 }): `;
    }

    let category = _ts.DiagnosticCategory[diagnostic.category].toLowerCase();
    output += `${ category } TS${ diagnostic.code }: ${ flattenDiagnosticMessage(diagnostic.messageText) }\n`;

    console.error(output);
}

function flattenDiagnosticMessage(message: string | _ts.DiagnosticMessageChain): string {
    if (typeof message === 'string') {
        return message;
    }
    else {
        let diagnostic = message;
        let result = '';
        let indent = 0;
        while (diagnostic) {
            if (indent) {
                result += '\n';

                for (let i = 0; i < indent; i++) {
                    result += '  ';
                }
            }
            result += diagnostic.messageText;
            indent++;
            diagnostic = diagnostic.next;
        }
        return result;
    }
}

export = plugin;
