/// <reference path="../typings/tsd.d.ts" />

import * as test from 'tape';
import * as _stream from 'stream';
import * as _gu from 'gulp-util';
import * as plugin from './main';
import {TextFile, newTextFile} from './textfile';
import * as _util from './util';

test('Glob', t => {
    t.plan(7);
    let env = _util.newEnv();
    t.throws(() => {
        env.glob([]);
    }, /Globs are empty/);
    t.throws(() => {
        env.glob(['!**/*.ts']);
    }, /Globs cannot start with a negative pattern/);
    t.throws(() => {
        env.glob(['./unknown.ts']);
    }, /File not found with singular glob/);
    t.deepEqual(env.glob(['tests/a.ts', 'tests/b.ts']).map(env.relative),
        ['tests/a.ts', 'tests/b.ts']);
    t.deepEqual(env.glob(['./tests/**/*.ts']).map(env.relative),
        ['tests/a.ts', 'tests/b.ts', 'tests/semanticerror.ts']);
    t.deepEqual(env.glob(['./tests/**/*.ts', '!tests/semanticerror.ts']).map(env.relative),
        ['tests/a.ts', 'tests/b.ts']);
    t.deepEqual(env.glob(['tests/**/*.ts', '!./tests/?.ts']).map(env.relative),
        ['tests/semanticerror.ts']);
});

test('Output of empty PassThroughStream', t => {
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

test('Output of non-empty PassThroughStream', t => {
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

test('Piping into empty PassThroughStream', t => {
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

test('Piping into non-empty PassThroughStream', t => {
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

test('Compiler does not accept illegal arguments', t => {
    t.plan(6);
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
    }, /Globs are empty/);
    t.throws(() => {
        plugin({}, ['./unknown.ts']);
    }, /File not found with singular glob/);
    t.throws(() => {
        plugin({}, ['./unknown/**/*.ts']);
    }, /The matched file set is empty/);
});

test('Compiler does not accept illegal config objects', t => {
    t.plan(3);
    t.throws(() => {
        plugin({ unknown: 'property' }, './tests/a.ts');
    }, /Invalid compiler options/);
    t.throws(() => {
        plugin({ noEmit: 'yes' }, './tests/a.ts');
    }, /Invalid compiler options/);
    t.throws(() => {
        plugin({ module: 'unknown' }, './tests/a.ts');
    }, /Invalid compiler options/);
});

test('Compiler does not accept unsupported TypeScript versions', t => {
    t.plan(1);
    t.throws(() => {
        plugin({ typescript: { version: '1.5.0' } }, './tests/a.ts');
    }, /The provided TypeScript module version \'1\.5\.0\' is not supported/);
});

test('Compiler produces valid result', t => {
    t.plan(5);
    let result = plugin({}, './tests/a.ts');
    t.false(result.emitSkipped);
    t.equal(result.diagnostics.length, 0);
    t.equal(result.scripts.length, 1);
    t.equal(result.sourceMaps.length, 0);
    t.equal(result.declarations.length, 0);
});

test('Compiler regards the noEmit option', t => {
    t.plan(5);
    let result = plugin({ noEmit: true }, './tests/a.ts');
    t.true(result.emitSkipped);
    t.equal(result.diagnostics.length, 0);
    t.equal(result.scripts.length, 0);
    t.equal(result.sourceMaps.length, 0);
    t.equal(result.declarations.length, 0);
});

test('Compiler regards the noEmitOnError option', t => {
    t.plan(5);
    let result = plugin({ noEmitOnError: true }, './tests/semanticerror.ts');
    t.true(result.emitSkipped);
    t.equal(result.diagnostics.length, 1);
    t.equal(result.scripts.length, 0);
    t.equal(result.sourceMaps.length, 0);
    t.equal(result.declarations.length, 0);
});

test('TextFile', t => {
    let f = newTextFile('file.ts', '');
    t.equal(f.getLine(0), '');
    t.throws(() => { f.getLine(1); }, '');
    t.deepEqual(f.getPosition(0), { line: 0, character: 0 });
    t.throws(() => { f.getPosition(1); }, '');
    f = newTextFile('file.ts', 'x');
    t.equal(f.getLine(0), 'x');
    t.throws(() => { f.getLine(1); }, '');
    t.deepEqual(f.getPosition(0), { line: 0, character: 0 });
    t.deepEqual(f.getPosition(1), { line: 0, character: 1 });
    t.throws(() => { f.getPosition(2); }, '');
    f = newTextFile('file.ts', 'x\n');
    t.equal(f.getLine(0), 'x');
    t.deepEqual(f.getPosition(0), { line: 0, character: 0 });
    t.deepEqual(f.getPosition(1), { line: 0, character: 1 });
    f = newTextFile('file.ts', 'x\r\ny\r\n');
    t.equal(f.getLine(0), 'x');
    t.equal(f.getLine(1), 'y');
    t.deepEqual(f.getPosition(0), { line: 0, character: 0 });
    t.deepEqual(f.getPosition(1), { line: 0, character: 1 });
    t.deepEqual(f.getPosition(2), { line: 0, character: 2 });
    t.deepEqual(f.getPosition(3), { line: 1, character: 0 });
    t.deepEqual(f.getPosition(4), { line: 1, character: 1 });
    t.deepEqual(f.getPosition(5), { line: 1, character: 2 });
    t.deepEqual(f.getPosition(6), { line: 2, character: 0 });
    f = newTextFile('file.ts', '\n\n');
    t.equal(f.getLine(0), '');
    t.equal(f.getLine(1), '');
    t.equal(f.getLine(2), '');
    t.deepEqual(f.getPosition(0), { line: 0, character: 0 });
    t.deepEqual(f.getPosition(1), { line: 1, character: 0 });
    t.deepEqual(f.getPosition(2), { line: 2, character: 0 });
    t.end();
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
