'use strict';

const _gu = require('gulp-util');
const _path = require('path');
const _stream = require('stream');

class LoggingStream extends _stream.Duplex {
    constructor(message) {
        super({objectMode: true});
        this.message = message;
    }

    _read() {}

    _write(file, encoding, callback) {
        let base = _path.normalize(file.base + _path.sep);
        let relative = _path.normalize(file.relative);
        _gu.log(`${this.message}: {${base}}${relative}`);
        this.push(file);
        callback();
    }

    end() {
        this.push(null);
    }
}

function log(message) {
    return new LoggingStream(message);
}

module.exports.LoggingStream = LoggingStream;
module.exports.log = log;
