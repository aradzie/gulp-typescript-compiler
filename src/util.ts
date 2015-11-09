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

export class PassThroughStream extends _stream.PassThrough {
    constructor(files?: _gu.File[]) {
        super({ objectMode: true });
        if (Array.isArray(files)) {
            for (let file of files) {
                this.push(file);
            }
        }
    }
}
