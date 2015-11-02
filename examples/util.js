'use strict';

const _gu = require('gulp-util');
const _path = require('path');
const _stream = require('stream');

function log(message) {
    let stream = new _stream.Transform({objectMode: true});
    stream._transform = (file, encoding, callback) => {
        let base = _path.resolve(process.cwd(), file.base);
        let path = _path.resolve(base, file.path);
        let relative = _path.relative(base, path);
        _gu.log(`${message}: {${base}/}${relative}`);
        callback(null, file);
    };
    return stream;
}

module.exports.log = log;
