'use strict';

const gulp = require('gulp');
const typescript = require('typescript');
const tsc = require('../../');
const util = require('../util');

gulp.task('default', cb => {
    let project = tsc({
        typescript: typescript,
        target: 'es5',
        module: 'commonjs',
        rootDir: './src',
        outFile: './lib/internal.js',
        declaration: true,
        sourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    let result = project.compile();
    return result.emitScripts()
            .pipe(result.emitDeclarations())
            .pipe(result.emitSourceMaps())
            .pipe(gulp.dest('./lib'))
            .pipe(util.log('compile'));
});
