'use strict';

const gulp = require('gulp');
const typescript = require('typescript');
const tsc = require('../../');
const util = require('../util');

gulp.task('default', cb => {
    let result = tsc({
        typescript: typescript,
        target: 'es5',
        rootDir: './src',
        outDir: './lib',
        declaration: true,
        sourceMap: true,
        inlineSources: true
    }, ['./src/foo.ts', './src/bar.ts', './src/baz.ts']);
    return result.emitScripts()
            .pipe(result.emitDeclarations())
            .pipe(result.emitSourceMaps())
            .pipe(gulp.dest('./lib'))
            .pipe(util.log('compile'));
});
