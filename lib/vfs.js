'use strict';
var util_1 = require('./util');
/**
 * TODO Make it work with the file cache.
 */
function overlay(sys, files, only) {
    if (only === void 0) { only = false; }
    var fileMap = Object.create(null);
    for (var _i = 0; _i < files.length; _i++) {
        var file = files[_i];
        if (!Buffer.isBuffer(file.contents)) {
            throw new util_1.PluginError("File contents is not a buffer: " + file.path);
        }
        var path = canonicalPath(file.path);
        if (fileMap[path] != null) {
            throw new util_1.PluginError("File already exists: " + file.path);
        }
        fileMap[path] = file;
    }
    var result = Object.create(Object.getPrototypeOf(sys));
    for (var _a = 0, _b = Object.keys(sys); _a < _b.length; _a++) {
        var key = _b[_a];
        switch (key) {
            case 'watchFile':
            case 'watchDirectory':
                break;
            case 'fileExists':
                result[key] = fileExists;
                break;
            case 'readFile':
                result[key] = readFile;
                break;
            default:
                result[key] = sys[key];
                break;
        }
    }
    return result;
    function fileExists(path) {
        var file = fileMap[canonicalPath(path)];
        if (file != null) {
            return true;
        }
        if (only) {
            return false;
        }
        return sys.fileExists(path);
    }
    function readFile(path, encoding) {
        var file = fileMap[canonicalPath(path)];
        if (file != null) {
            return String(file.contents);
        }
        if (only) {
            return undefined;
        }
        return sys.readFile(path, encoding);
    }
    function canonicalPath(path) {
        if (sys.useCaseSensitiveFileNames) {
            return path.toLowerCase();
        }
        return path;
    }
}
exports.overlay = overlay;
