'use strict';

const gulp = require('gulp');
const gu = require('gulp-util');
const typescript = require('typescript');
const tsc = require('../../');

gulp.task('default', cb => {
    let result = tsc({
        typescript: typescript,
        module: 'commonjs',
        target: 'es5',
        jsx: 'preserve',
        rootDir: './src',
        outFile: './lib/internal.js',
        declaration: true,
        inlineSourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    return result.emitScripts()
            .pipe(result.emitDeclarations())
            .pipe(result.emitSourceMaps())
            .pipe(gulp.dest('./lib'))
            .pipe(log('output'));
});

function log(message) {
    let stream = new require('stream').Transform({objectMode: true});
    stream._transform = (file, encoding, callback) => {
        gu.log(`${message}:`, {
            path: file.path,
            base: file.base,
            relative: file.relative
        });
        callback(null, file);
    };
    return stream;
}
