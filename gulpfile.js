'use strict';

const gulp = require('gulp');
const tsc = require('./tmp/stage0/main');

let main = tsc.project({
    target: 'es5',
    module: 'commonjs',
    rootDir: './src',
    outDir: './lib'
}, './src/main.ts');

let test = tsc.project({
    target: 'es5',
    module: 'commonjs',
    rootDir: './src',
    outDir: './tmp/test'
}, './src/test.ts');

gulp.task('compile', cb => {
    main.compile().writeFiles();
    cb();
});

gulp.task('test', cb => {
    test.compile().writeFiles();
    cb();
});

gulp.task('default', ['compile', 'test']);
