# Use Cases

The plugin must allow the following use cases:

* Support custom TypeScript compiler version.
* Configure plugin using inline options.
* Configure by reading a project file 'tsconfig.json'.
* Support incremental compilation, watch for changes and re-compile.
* Write files to disk synchronously.
* Emit compiled Vinyl file objects from result to `gulp.dest`.
* ??? Pipe source Vinyl file objects from `gulp.src` to compiler.

## Configure Compiler

```javascript
// Use case: create a project from tsconfig.file and a custom typescript version.
const project = tsc.project('path to tsconfig.json', require('typescript'));

// Use case: create a project using inline options and a custom typescript version.
const project = tsc.project({/*inline config*/}, [/*globs*/], require('typescript'));
```

## Compile Sources

```javascript
// Use case: compile project and return result.
const result = project.compile()

// Use case: incrementally compile project.
project.watch(function (result) {
    // This callback will receive the result of compilation.
});
```

## Write Files

```javascript
// Use case: write all files to disk synchronously.
result.writeFiles();

// Use case: emit Vinyl file objects.
result.emit(/*{emit config}*/).pipe(gulp.dest('./lib'));

// Use case: emit Vinyl file objects separately.
result.emitScripts(/*{emit config}*/)
    .pipe(result.emitDeclarations(/*{emit config}*/))
    .pipe(result.emitSourceMaps(/*{emit config}*/))
    .pipe(gulp.dest('./lib'));
```

# Example minimal gulpfile.js

```
// Compile using tsconfig.json file.
gulp.task('compile', cb => {
    tsc.project('./tsconfig.json')
        .compile()
        .writeFiles();
    cb();
});

// Compile using inline options.
gulp.task('compile', cb => {
    tsc.project({outDir: './lib'}, ['./src/main.ts'])
        .compile()
        .writeFiles();
    cb();
});
```

# Notes on Incremental Builds

## Native TypeScript

The `tsc` compiler has `--watch` flags. If present, the app will start watching for file changes
to recompile. 

## Native Gulp

Gulp API has method to watch files to changes and call user callback:

```javascript
gulp.watch(glob, options, function callback(event) {
   console.log(event.path, event.type);
});
```

## The gulp-watch Plugin

[Homepage](https://www.npmjs.com/package/gulp-watch)

### watch(glob, options, callback);

Creates a watcher that will spy on files that are matched by glob which can be a glob string or array of glob strings.

Returns a pass through stream that will emit vinyl files (with additional event property) that corresponds to event on file-system.

## The gulp-cached Plugin

[Homepage](https://github.com/contra/gulp-cached)  

This keeps an in-memory cache of files (and their contents) that have passed through it. 
If a file has already passed through on the last run it will not be passed downstream. 
This means you only process what you need and save time + resources.

Example:

```javascript
const cache = require('gulp-cached');

gulp.task('lint', function() {
  return gulp.src('files/*.js')
    .pipe(cache('linting'))
    .pipe(jshint())
    .pipe(jshint.reporter())
});

gulp.task('watch', function() {
  gulp.watch('files/*.js', ['lint']);
});

gulp.task('default', ['watch','lint']);
```

## The gulp-remember Plugin

[Homepage](https://github.com/ahaurw01/gulp-remember)  

## Articles

* [Gulp 4: Incremental builds with gulp.lastRun](http://fettblog.eu/gulp-4-incremental-builds/)
* [Building with Gulp 4: Incremental builds](http://blog.reactandbethankful.com/posts/2015/05/01/building-with-gulp-4-part-4-incremental-builds/)
