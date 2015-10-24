'use strict';

const gulp = require('gulp');
const gu = require('gulp-util');
const tsc = require('./tmp/stage0/main');

gulp.task('compile', cb => {
    let result = tsc({
        module: 'commonjs',
        target: 'es5',
        rootDir: './src',
        declaration: false,
        inlineSourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    return result.emitScripts()
            .pipe(result.emitDeclarations())
            .pipe(result.emitSourceMaps())
            .pipe(gulp.dest('./lib'));
});

gulp.task('default', ['compile']);
