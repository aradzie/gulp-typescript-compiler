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

gulp.task('bundle', cb => {
    let project = tsc({
        typescript: typescript,
        target: 'es5',
        module: 'commonjs',
        rootDir: './src',
        outFile: './lib/internal.js',
        outDir: './lib',
        inlineSourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    let result = project.compile();
    result.writeFiles();
    let b = browserify({
        entries: './main.js',
        basedir: './lib',
        debug: true
    });
    return b.bundle()
            .pipe(source('./bundle.js'))
            .pipe(buffer())
            .pipe(gulp.dest('./lib'));
});

gulp.task('minify', ['bundle'], cb => {
    return gulp.src(['./lib/internal.js', './lib/bundle.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('./all.js'))
            .pipe(uglify({}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./lib'));
});

gulp.task('default', ['minify']);
