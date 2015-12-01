'use strict';
var util_1 = require('./util');
function overlay(sys, files) {
    var fileMap = Object.create(null);
    for (var _i = 0; _i < files.length; _i++) {
        var file = files[_i];
        if (!Buffer.isBuffer(file.contents)) {
            throw new util_1.PluginError("File contents is not a buffer: " + file.path);
        }
        if (file.path in fileMap) {
            throw new util_1.PluginError("File already exists: " + file.path);
        }
        fileMap[file.path] = file;
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
        if (path in fileMap) {
            return true;
        }
        return sys.fileExists(path);
    }
    function readFile(path, encoding) {
        if (path in fileMap) {
            return String(fileMap[path].contents);
        }
        return sys.readFile(path, encoding);
    }
}
exports.overlay = overlay;
