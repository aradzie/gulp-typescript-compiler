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

/**
 * The trick is to detect whether this is the first stream in a chain of pipes,
 * or an intermediate link. The first stream will not receive the end event,
 * therefore it must produce output immediately. An intermediate link will
 * receive the end event, and only then it must produce any output to append
 * files to the ones that have already been passed through.
 */
export class PassThroughStream extends _stream.Duplex {
    private _files: _gu.File[];
    private _piped: boolean;

    constructor(files: _gu.File[] = [], prepend: boolean = false) {
        super({ objectMode: true });
        this._files = [].concat(files);
        this._piped = false;
        this.on('pipe', source => {
            this._piped = true;
        });
        this.on('unpipe', source => {
            this._piped = true;
        });
        if (prepend) {
            this._dump();
        }
    }

    _read() {
        if (!this._piped) {
            this._dump();
            this.push(null);
        }
    }

    _write(file: _gu.File, encoding, callback: Function) {
        this.push(file);
        callback();
    }

    end() {
        this._dump();
        this.push(null);
    }

    _dump() {
        let files = this._files;
        this._files = [];
        for (let file of files) {
            this.push(file);
        }
    }
}
