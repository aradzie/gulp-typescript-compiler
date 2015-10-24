'use strict';

const gulp = require('gulp');
const gu = require('gulp-util');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const typescript = require('typescript');
const tsc = require('../../');

gulp.task('typescript', function (cb) {
    let result = tsc({
        typescript: typescript,
        module: 'commonjs',
        target: 'es5',
        rootDir: './src',
        outFile: './lib/internal.js',
        declaration: false,
        inlineSourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    return result.emitScripts()
            .pipe(result.emitDeclarations())
            .pipe(result.emitSourceMaps())
            .pipe(gulp.dest('./lib'));
});

gulp.task('browserify', ['typescript'], function (cb) {
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

gulp.task('minify', ['browserify'], function (cb) {
    return gulp.src(['./lib/internal.js', './lib/bundle.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('./all.js'))
            .pipe(uglify({}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./lib'));
});

gulp.task('default', ['minify']);

function log(message) {
    let stream = new require('stream').Transform({objectMode: true});
    stream._transform = (file, encoding, callback) => {
        gu.log(`${message}: path:`, file.path);
        gu.log(`${message}: base:`, file.base);
        gu.log(`${message}: cwd: `, file.cwd);
        callback(null, file);
    };
    return stream;
}
