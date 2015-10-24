# A TypeScript compiler plugin for the Gulp build system

## Basic Usage

A a minimal `gulpfile.js` to compile TypeScript:

```javascript
'use strict';

const gulp = require('gulp');
const tsc = require('gulp-typescript-compiler');

gulp.task('default', cb => {
    let result = tsc({
        typescript: require('typescript'),
        module: 'commonjs',
        target: 'es5',
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
            .pipe(gulp.dest('./lib'));
});
```
