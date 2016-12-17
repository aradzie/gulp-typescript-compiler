'use strict';

const gulp = require('gulp');
const typescript = require('typescript');
const tsc = require('../../');
const util = require('../util');

gulp.task('default', cb => {
    const result = tsc({
        typescript: typescript,
        target: 'es5',
        module: 'commonjs',
        rootDir: './src',
        outDir: './lib',
        declaration: true,
        sourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    return result
        .emitScripts()
        .pipe(result.emitDeclarations())
        .pipe(result.emitSourceMaps())
        .pipe(gulp.dest('./lib'))
        .pipe(util.log('compile'));
});
