'use strict';

const gulp = require('gulp');
const typescript = require('typescript');
const tsc = require('../../');
const util = require('../util');

gulp.task('default', cb => {
    let project = tsc.project({
        typescript: typescript,
        target: 'es5',
        rootDir: './src',
        outDir: './tmp'
    }, './src/**/*.ts');
    project.watch(result => {
        result.emit()
                .pipe(gulp.dest('./tmp'))
                .pipe(util.log('compile'));
    });
});
