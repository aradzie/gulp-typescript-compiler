/// <reference path="../typings/tsd.d.ts" />

import * as test from 'tape';
import * as _stream from 'stream';
import * as _gu from 'gulp-util';
import * as plugin from './main';
import * as _util from './util';
import * as _lang from './lang';

test('Output of empty PassThroughStream', (t) => {
    t.plan(1);
    let output = [];
    let stream = new _util.PassThroughStream();
    stream.on('data', (file: _gu.File) => {
        output.push(file);
    });
    stream.on('end', () => {
        t.equal(output.length, 0);
    });
});

test('Output of non-empty PassThroughStream', (t) => {
    t.plan(1);
    let output = [];
    let stream = new _util.PassThroughStream([file('X'), file('Y'), file('Z')]);
    stream.on('data', (file: _gu.File) => {
        output.push(file);
    });
    stream.on('end', () => {
        t.equal(output.length, 3);
    });
});

test('Piping into empty PassThroughStream', (t) => {
    t.plan(1);
    let output = [];
    let stream = new _util.PassThroughStream();
    stream.on('data', (file: _gu.File) => {
        output.push(file);
    });
    stream.on('end', () => {
        t.equal(output.length, 3);
    });
    readable([file('A'), file('B'), file('C')]).pipe(stream);
});

test('Piping into non-empty PassThroughStream', (t) => {
    t.plan(1);
    let output = [];
    let stream = new _util.PassThroughStream([file('X'), file('Y'), file('Z')]);
    stream.on('data', (file: _gu.File) => {
        output.push(file);
    });
    stream.on('end', () => {
        t.equal(output.length, 6);
    });
    readable([file('A'), file('B'), file('C')]).pipe(stream);
});

test('Compiler does not accept illegal arguments', (t) => {
    t.plan(5);
    t.throws(() => {
        plugin(null, []);
    }, /The config argument is not an object/);
    t.throws(() => {
        plugin({}, null);
    }, /The globs argument is not a string or array of strings/);
    t.throws(() => {
        plugin({}, [null]);
    }, /The globs argument is not a string or array of strings/);
    t.throws(() => {
        plugin({}, []);
    }, /The matched file set is empty/);
    t.throws(() => {
        plugin({}, ['./unknown.ts']);
    }, /The matched file set is empty/);
});

test('Compiler does not accept illegal config objects', (t) => {
    t.plan(3);
    t.throws(() => {
        plugin({ unknown: 'property' }, './tests/a.ts');
    }, /Invalid configuration/);
    t.throws(() => {
        plugin({ noEmit: 'yes' }, './tests/a.ts');
    }, /Invalid configuration/);
    t.throws(() => {
        plugin({ module: 'unknown' }, './tests/a.ts');
    }, /Invalid configuration/);
});

test('Compiler produces valid result', (t) => {
    t.plan(5);
    let result = plugin({}, './tests/a.ts');
    t.false(result.emitSkipped);
    t.equal(result.diagnostics.length, 0);
    t.equal(result.scripts.length, 1);
    t.equal(result.sourceMaps.length, 0);
    t.equal(result.declarations.length, 0);
});

test('Compiler regards the noEmit option', (t) => {
    t.plan(5);
    let result = plugin({ noEmit: true }, './tests/a.ts');
    t.false(result.emitSkipped);
    t.equal(result.diagnostics.length, 0);
    t.equal(result.scripts.length, 0);
    t.equal(result.sourceMaps.length, 0);
    t.equal(result.declarations.length, 0);
});

test('Compiler regards the noEmitOnError option', (t) => {
    t.plan(5);
    let result = plugin({ noEmitOnError: true }, './tests/semanticerror.ts');
    t.true(result.emitSkipped);
    t.equal(result.diagnostics.length, 1);
    t.equal(result.scripts.length, 0);
    t.equal(result.sourceMaps.length, 0);
    t.equal(result.declarations.length, 0);
});

function file(path: string) {
    return new _gu.File({ path: path, contents: new Buffer(`path: ${path}`) });
}

function readable(files: _gu.File[]) {
    let readable = new _stream.Readable({ objectMode: true });
    readable._read = function () {
        for (let file of files) {
            readable.push(file);
        }
        readable.push(null);
    };
    return readable;
}
