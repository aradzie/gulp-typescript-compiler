'use strict';

const gulp = require('gulp');
const tsc = require('../../');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const util = require('../util');

gulp.task('default', function (cb) {
    const result = tsc({
        target: 'es5',
        rootDir: './src',
        outDir: './lib',
        declaration: true,
        inlineSourceMap: true,
        inlineSources: true
    }, ['./src/mod1.ts', './src/mod2.ts', './src/mod3.ts']);
    return gulp.src(['./src/mod1.js', './src/mod2.js', './src/mod3.js'])
        .pipe(result.emitScripts())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat('./all.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(result.emitDeclarations())
        .pipe(gulp.dest('./lib'))
        .pipe(util.log('result'));
});
