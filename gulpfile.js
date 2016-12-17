'use strict';

const gulp = require('gulp');
const tsc = require('./tmp/stage0/main');

const main = tsc.project({
    target: 'es6',
    module: 'commonjs',
    rootDir: './src',
    outDir: './lib',
    alwaysStrict: true,
    noImplicitAny: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
}, './src/main.ts');

const test = tsc.project({
    target: 'es6',
    module: 'commonjs',
    rootDir: './src',
    outDir: './tmp/test',
    alwaysStrict: true,
    noImplicitAny: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
}, './src/test.ts');

gulp.task('main', cb => {
    main.compile().writeFiles();
    cb();
});

gulp.task('test', cb => {
    test.compile().writeFiles();
    cb();
});

gulp.task('default', ['main', 'test']);

gulp.task('watch', cb => {
    main.watch(result => {
        result.writeFiles();
    });
    test.watch(result => {
        result.writeFiles();
    });
});
