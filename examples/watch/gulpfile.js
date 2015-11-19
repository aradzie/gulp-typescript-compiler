'use strict';

const gulp = require('gulp');
const typescript = require('typescript');
const tsc = require('../../');
const util = require('../util');

gulp.task('default', cb => {
    let project = tsc.project({
        typescript: typescript,
        target: 'es5',
        module: 'commonjs',
        rootDir: './src',
        outDir: './tmp'
    }, './src/main.ts');
    project.watch(result => {
        result.writeFiles();
    });
});
