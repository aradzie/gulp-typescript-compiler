# A TypeScript compiler plugin for the Gulp build system

## Basic Usage

A simple example of how to compile and write files synchronously:

```javascript
const gulp = require('gulp');
const tsc = require('gulp-typescript-compiler');

gulp.task('compile', cb => {
    // Compile *.ts files and report errors, if any.
    let result = tsc({
        target: 'es5',
        rootDir: './src',
        outFile: './lib/app.js',
        declaration: true,
        sourceMap: true
    }, './src/main.ts');
    // Write result files synchronously.
    result.writeFiles();
    // Notify gulp that this task has been completed.
    cb();
});
```

A simple example of how to compile and emit vinyl file objects:

```javascript
const gulp = require('gulp');
const tsc = require('gulp-typescript-compiler');

gulp.task('compile', cb => {
    // Compile *.ts files and report errors, if any.
    let result = tsc({
        target: 'es5',
        rootDir: './src',
        outFile: './lib/app.js',
        declaration: true,
        sourceMap: true
    }, './src/main.ts');
    // Emit vinyl file objects.
    return result.emitScripts() // Stream of *.js files.
            .pipe(result.emitDeclarations()) // Stream of *.d.ts files.
            .pipe(result.emitSourceMaps()) // Stream of *.js.map files.
            .pipe(gulp.dest('./lib'));
});
```

## Plugin API

### function tsc(config: any, globs: string | string[]): Result

This function compiles TypeScript files with names matching the specified globs using the specified compiler options.

### class Result

The result object is returned by the compiler function whether compilation has succeeded or not. It contains compiler messages, if any, and all the generated files.

* **emitSkipped: boolean**
  `true` if compiler did not generate anything, `false` otherwise. Consult compiler options `noEmit` and `noEmitOnError` for more details.
* **diagnostics: Diagnostic[]**
  An array of compiler diagnostics, such as syntax or semantic errors, etc.
* **scripts: File[]**
  An array of [Vinyl](https://github.com/gulpjs/vinyl-fs)  file objects for the `*.js` and `*.jsx` files generated by compiler.
* **sourceMaps: File[]**
  An array of [Vinyl](https://github.com/gulpjs/vinyl-fs)  file objects for the `*.js.map` and `*.jsx.map` files generated by compiler.
* **declarations: File[]**
  An array of [Vinyl](https://github.com/gulpjs/vinyl-fs)  file objects for the `*.d.ts` files generated by compiler.
* **emit(): PassThroughStream**
  Returns a pass-through stream that appends all the generated files.
* **emitScripts(): PassThroughStream**
  Returns a pass-through stream that appends the generated `*.js` and `*.jsx` files.
* **emitSourceMaps(): PassThroughStream**
 Returns a pass-through stream that appends the generated `*.js.map` and `*.jsx.map` files.
* **emitDeclarations(): PassThroughStream**
  Returns a pass-through stream that appends the generated `*.d.ts` files.
* **writeFiles()**
  Write all generated files synchronously.

### enum DiagnosticCategory

Diagnostic severity level.

* **Warning = 0**
  Compiler warning.
* **Error = 1**
  Compiler error.
* **Message = 2**
  Compiler message.

### class Diagnostic

Compiler message about syntax, semantic or any other error.

* **fileName: string**
  Name of the file where error occurred.
* **start: number**
  Text span start position, zero-based.
* **length: number**
  Text span length.
* **category: DiagnosticCategory**
  Diagnostic severity.
* **code: number**
  Diagnostic code.
* **message: number**
  Diagnostic message.

### class PassThroughStream

Extends node duplex stream, passes through any input file, appends files generated 
by the compiler plugin.

Example:

```javascript
gulp.task('compile', cb => {
    // Requires gulp-concat plugin.
    let result = tsc({...}, './src/ts/main.ts');
    return gulp.src('./src/js/prelude.js') // Start with already existing JS files.
        .pipe(result.emitScripts()) // Append JS files generated by the compiler.
        .pipe(concat('./bundle.js')) // Concatenate everything to a single file.
        .pipe(gulp.dest('./lib')); // Write result to disk.
});
```

## Recipes

### Custom TypeScript Version

By default the plugin depends on the most recent stable version of TypeScript. You can, however,
provide your own version of TypeScript in the `typescript` property of the config object.

First, install your own version of the compiler:

```shell
npm install typescript@next --save-dev
```

Then, configure plugin properly in your `gulpfile.js`:

```javascript
gulp.task('compile', cb => {
    let result = tsc({
        typescript: require('typescript'), // Custom version of TypeScript.
        outFile: './lib/app.js',
    }, './src/app.ts');
});
```

### Compile and Browserify

First compile TypeScript project to a temporary directory, then bundle with Browserify.

```javascript
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const tsc = require('gulp-typescript-compiler');
const browserify = require('browserify');

gulp.task('typescript', cb => {
    // Compile TypeScript files.
    let result = tsc({
        target: 'es5',
        module: 'commonjs',
        rootDir: './src',
        outDir: './tmp',
        inlineSourceMap: true,
        inlineSources: true
    }, './src/main.ts');
    // Write temporary files as Browserify does not understand Vinyl files.
    result.writeFiles();
    // Init Browserify to read from the temporary directory. 
    let b = browserify({
        entries: './main.js',
        basedir: './tmp',
        debug: true
    });
    // Bundle, convert result to Vinyl file object, then pass to Gulp.
    return b.bundle()
            .pipe(source('./bundle.js'))
            .pipe(buffer())
            .pipe(gulp.dest('./lib'));
});
```
