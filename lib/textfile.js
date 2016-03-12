"use strict";
function newTextFile(fileName, text) {
    var lineMap = null;
    return { fileName: fileName, text: text, getPosition: getPosition, getLine: getLine };
    function getPosition(offset) {
        initLineMap();
        if (offset < 0 || offset > text.length) {
            throw new Error();
        }
        var l = 0, h = lineMap.length - 1;
        while (l <= h) {
            var m = Math.floor((l + h) / 2);
            var begin = lineMap[m];
            var end = lineMap[m + 1];
            if (offset < begin) {
                h = m - 1;
                continue;
            }
            if (offset >= end) {
                l = m + 1;
                continue;
            }
            return { line: m, character: offset - begin };
        }
    }
    function getLine(line) {
        initLineMap();
        if (line < 0 || line >= lineMap.length) {
            throw new Error();
        }
        var begin = lineMap[line];
        var end = lineMap[line + 1];
        while (begin < end) {
            var ch = text.charCodeAt(end - 1);
            if (ch == 10 /* LF */
                || ch == 13 /* CR */
                || ch == 8232 /* LINE_SEPARATOR */
                || ch == 8233 /* PARAGRAPH_SEPARATOR */) {
                end--;
            }
            else {
                break;
            }
        }
        return text.substring(begin, end);
    }
    function initLineMap() {
        if (!Array.isArray(lineMap)) {
            lineMap = [];
            var pos = 0;
            var lineStart = 0;
            while (pos < text.length) {
                switch (text.charCodeAt(pos++)) {
                    case 13 /* CR */:
                        if (text.charCodeAt(pos) === 10 /* LF */) {
                            pos++;
                        }
                    case 10 /* LF */:
                    case 8232 /* LINE_SEPARATOR */:
                    case 8233 /* PARAGRAPH_SEPARATOR */:
                        lineMap.push(lineStart);
                        lineStart = pos;
                        break;
                }
            }
            lineMap.push(lineStart);
        }
    }
}
exports.newTextFile = newTextFile;
