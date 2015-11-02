'use strict';

const gulp = require('gulp');
const typescript = require('typescript');
const tsc = require('../../');
const util = require('../util');

gulp.task('default', cb => {
    let result = tsc({
        typescript: typescript,
        target: 'es5',
        module: 'commonjs',
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
            .pipe(util.log('compile'));
});

