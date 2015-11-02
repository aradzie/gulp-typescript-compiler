'use strict';

const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const typescript = require('typescript');
const tsc = require('../../');
const util = require('../util');

gulp.task('typescript', cb => {
    let result = tsc({
        typescript: typescript,
        target: 'es5',
        module: 'commonjs',
        rootDir: './src',
        outFile: './lib/internal.js',
        declaration: false,
        inlineSourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    return result.emitScripts()
            .pipe(result.emitDeclarations())
            .pipe(result.emitSourceMaps())
            .pipe(gulp.dest('./lib'))
            .pipe(util.log('compile'));
});

gulp.task('browserify', ['typescript'], cb => {
    let b = browserify({
        entries: './main.js',
        basedir: './lib',
        debug: true
    });
    return b.bundle()
            .pipe(source('./bundle.js'))
            .pipe(buffer())
            .pipe(gulp.dest('./lib'))
            .pipe(util.log('browserify'));
});

gulp.task('minify', ['browserify'], cb => {
    return gulp.src(['./lib/internal.js', './lib/bundle.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('./all.js'))
            .pipe(uglify({}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./lib'))
            .pipe(util.log('minify'));
});

gulp.task('default', ['minify']);
