'use strict';

const gulp = require('gulp');
const tsc = require('./tmp/stage0/main');

gulp.task('compile', cb => {
    let result = tsc({
        target: 'es5',
        module: 'commonjs',
        rootDir: './src',
        outDir: './lib'
    }, './src/main.ts');
    result.writeFiles();
    cb();
});

gulp.task('default', ['compile']);
