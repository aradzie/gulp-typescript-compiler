"use strict";
const _glob = require("glob");
const _minimatch = require("minimatch");
const _path = require("path");
const _stream = require("stream");
const _gu = require("gulp-util");
class PluginError extends _gu.PluginError {
    constructor(message, options) {
        super("gulp-typescript-compiler", message, options);
    }
    toString() {
        const header = `${_gu.colors.red(this.name)} in plugin "${_gu.colors.cyan(this.plugin)}"`;
        const body = `Message:\n${this.message.split("\n").map(pad).join("\n")}`;
        return `${header}\n${body}`;
        function pad(line) {
            return "  " + line;
        }
    }
}
exports.PluginError = PluginError;
/**
 * The trick is to detect whether this is the first stream in a chain of pipes,
 * or an intermediate link. The first stream will not receive the end event,
 * therefore it must produce output immediately. An intermediate link will
 * receive the end event, and only then it must produce any output to append
 * files to the ones that have already been passed through.
 */
class PassThroughStream extends _stream.Duplex {
    constructor(files = [], prepend = false) {
        super({ objectMode: true });
        this._files = [].concat(files);
        this._piped = false;
        if (prepend === null) {
        }
        else {
            this.on("pipe", source => {
                this._piped = true;
            });
            this.on("unpipe", source => {
                this._piped = false;
            });
        }
        if (prepend) {
            this._dump();
        }
    }
    _read() {
        if (!this._piped) {
            this._dump();
            this.push(null);
        }
    }
    _write(file, encoding, callback) {
        this.push(file);
        callback();
    }
    end() {
        this._dump();
        this.push(null);
    }
    _dump() {
        const files = this._files;
        this._files = [];
        for (const file of files) {
            this.push(file);
        }
    }
}
exports.PassThroughStream = PassThroughStream;
function newEnv(cwd = process.cwd()) {
    return {
        cwd,
        resolve,
        relative,
        glob,
    };
    function resolve(path) {
        return _path.normalize(_path.resolve(cwd, path));
    }
    function relative(path) {
        return _path.relative(cwd, resolve(path));
    }
    function glob(globs) {
        const fileNames = [];
        let groups = [];
        let last = null;
        globs.forEach(glob => {
            if (glob.startsWith("!")) {
                if (last == null) {
                    throw new PluginError("Globs cannot start with a negative pattern");
                }
                last.negative.push(resolve(glob.substring(1)));
            }
            else {
                groups.push(last = {
                    positive: resolve(glob),
                    negative: [],
                });
            }
        });
        if (last == null) {
            throw new PluginError("Globs are empty");
        }
        let options = { cwd };
        groups.forEach(group => {
            const found = _glob.sync(group.positive, options);
            if (found.length > 0) {
                found.forEach(fileName => {
                    if (!group.negative.some(negative => _minimatch(fileName, negative))) {
                        fileNames.push(fileName);
                    }
                });
            }
            else if (!_glob.hasMagic(group.positive, options)) {
                throw new PluginError(`File not found with singular glob: ${group.positive}`);
            }
        });
        return fileNames.filter(unique);
        function unique(value, index, array) {
            return array.indexOf(value) === index;
        }
    }
}
exports.newEnv = newEnv;
function hasExt(fileName, extList) {
    for (const ext of extList) {
        if (fileName.toLowerCase().endsWith("." + ext.toLowerCase())) {
            return true;
        }
    }
    return false;
}
exports.hasExt = hasExt;
function findExt(fileName, extList) {
    for (const ext of extList) {
        if (fileName.toLowerCase().endsWith("." + ext.toLowerCase())) {
            return {
                basename: fileName.substring(0, fileName.length - ext.length - 1),
                ext: ext,
            };
        }
    }
    return {
        basename: fileName,
        ext: null,
    };
}
exports.findExt = findExt;
function log(message) {
    _gu.log(`TypeScript compiler: ${message}`);
}
exports.log = log;
