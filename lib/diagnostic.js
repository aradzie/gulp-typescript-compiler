'use strict';
var _gu = require('gulp-util');
(function (DiagnosticCategory) {
    DiagnosticCategory[DiagnosticCategory["Warning"] = 0] = "Warning";
    DiagnosticCategory[DiagnosticCategory["Error"] = 1] = "Error";
    DiagnosticCategory[DiagnosticCategory["Message"] = 2] = "Message";
})(exports.DiagnosticCategory || (exports.DiagnosticCategory = {}));
var DiagnosticCategory = exports.DiagnosticCategory;
function newFormatter(env, pretty, tabWidth) {
    if (pretty === void 0) { pretty = true; }
    if (tabWidth === void 0) { tabWidth = 4; }
    return function format(diagnostic) {
        var colors = _gu.colors;
        var categoryName = (_a = {},
            _a[DiagnosticCategory.Warning] = colors.yellow('warning'),
            _a[DiagnosticCategory.Error] = colors.red('error'),
            _a[DiagnosticCategory.Message] = colors.blue('message'),
            _a
        );
        var output = '';
        if (diagnostic.file) {
            var file = diagnostic.file, start = diagnostic.start, length_1 = diagnostic.length;
            if (pretty) {
                contents(file, start, length_1);
            }
            var fileName = env.relative(file.fileName);
            var position = file.getPosition(start);
            output += fileName + "(" + (position.line + 1) + "," + (position.character + 1) + "): ";
        }
        output += categoryName[diagnostic.category] + " TS" + diagnostic.code + ": " + diagnostic.message;
        var level = 1;
        var next = diagnostic.next;
        while (next) {
            output += '\n';
            for (var i = 0; i < level; i++) {
                output += '  ';
            }
            output += next.message;
            level++;
            next = next.next;
        }
        return output;
        function contents(file, start, length) {
            var MAX_LINES = 5;
            var CONTEXT_LINES = 2;
            var _a = file.getPosition(start), firstLine = _a.line, firstLineChar = _a.character;
            var _b = file.getPosition(start + length), lastLine = _b.line, lastLineChar = _b.character;
            output += '\n';
            for (var n = firstLine; n <= lastLine; n++) {
                if (lastLine - firstLine >= MAX_LINES) {
                    if (n >= firstLine + CONTEXT_LINES && n <= lastLine - CONTEXT_LINES) {
                        if (n == firstLine + CONTEXT_LINES) {
                            output += gutter('...') + '\n';
                        }
                        continue;
                    }
                }
                var line = file.getLine(n);
                var expanded = expand(line);
                var begin = 0;
                var end = expanded.length;
                if (n == firstLine) {
                    begin = textColumn(line, firstLineChar);
                }
                if (n == lastLine) {
                    end = textColumn(line, lastLineChar);
                }
                output += gutter(n + 1) + ' ' + colors.italic(expanded) + '\n';
                output += gutter() + ' ' + repeat(' ', begin) + colors.red(repeat('~', end - begin)) + '\n';
            }
            output += '\n';
            function gutter(s) {
                if (s === void 0) { s = ''; }
                s = String(s);
                while (s.length < 6) {
                    s = ' ' + s;
                }
                return colors.bgBlack.white(s);
            }
            function repeat(s, n) {
                var r = '';
                while (n-- > 0) {
                    r += s;
                }
                return r;
            }
            function expand(line) {
                var result = '';
                var column = 0;
                for (var n = 0; n < line.length; n++) {
                    if (line.charCodeAt(n) == 9 /* TAB */) {
                        var end = (Math.floor(column / tabWidth) + 1) * tabWidth;
                        while (column < end) {
                            result += ' ';
                            column++;
                        }
                    }
                    else {
                        result += line.charAt(n);
                        column++;
                    }
                }
                return result;
            }
            function textColumn(line, character) {
                var column = 0;
                for (var n = 0; n < character; n++) {
                    if (line.charCodeAt(n) == 9 /* TAB */) {
                        var end = (Math.floor(column / tabWidth) + 1) * tabWidth;
                        while (column < end) {
                            column++;
                        }
                    }
                    else {
                        column++;
                    }
                }
                return column;
            }
        }
        var _a;
    };
}
exports.newFormatter = newFormatter;
