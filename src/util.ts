import _stream = require('stream');
import _gu = require('gulp-util');
import _lang = require('./lang');

export class PluginError extends _gu.PluginError {
    constructor(message, options?: PluginErrorOptions) {
        super('gulp-typescript-compiler', message, options)
    }

    toString() {
        let header = `${_gu.colors.red(this.name)} in plugin '${_gu.colors.cyan(this.plugin)}'`;
        let body = `Message:\n${this.message.split('\n').map(pad).join('\n')}`;
        return `${header}\n${body}`;

        function pad(line) {
            return '  ' + line;
        }
    }
}

export class PassThroughStream extends _stream.Duplex {
    private _files: _gu.File[] = [];
    private _index = 0;

    constructor(files?: _gu.File[]) {
        super({ objectMode: true });
        if (Array.isArray(files)) {
            this._files = files.slice(0, files.length);
        }
    }

    _write(file: _gu.File, encoding: string, cb: (error?) => void) {
        if (!file) {
            cb();
            return;
        }
        if (file.isNull()) {
            cb();
            return;
        }
        if (file.isStream()) {
            cb(new PluginError('Streaming not supported'));
            return;
        }
        this.push(file);
        cb();
    }

    _read() {
        if (this._index < this._files.length) {
            this.push(this._files[this._index++]);
        }
        else {
            this.push(null);
        }
    }
}
