"use strict";
const _gu = require('gulp-util');
(function (DiagnosticCategory) {
    DiagnosticCategory[DiagnosticCategory["Warning"] = 0] = "Warning";
    DiagnosticCategory[DiagnosticCategory["Error"] = 1] = "Error";
    DiagnosticCategory[DiagnosticCategory["Message"] = 2] = "Message";
})(exports.DiagnosticCategory || (exports.DiagnosticCategory = {}));
var DiagnosticCategory = exports.DiagnosticCategory;
function newFormatter(env, pretty = true, tabWidth = 4) {
    return function format(diagnostic) {
        const categoryName = {
            [DiagnosticCategory.Warning]: _gu.colors.yellow('warning'),
            [DiagnosticCategory.Error]: _gu.colors.red('error'),
            [DiagnosticCategory.Message]: _gu.colors.blue('message'),
        };
        let output = '';
        if (diagnostic.file) {
            const { file, start, length } = diagnostic;
            if (pretty) {
                contents(file, start, length);
            }
            const fileName = env.relative(file.fileName);
            const position = file.getPosition(start);
            output += `${fileName}(${position.line + 1},${position.character + 1}): `;
        }
        output += `${categoryName[diagnostic.category]} TS${diagnostic.code}: ${diagnostic.message}`;
        let level = 1;
        let next = diagnostic.next;
        while (next) {
            output += '\n';
            for (let i = 0; i < level; i++) {
                output += '  ';
            }
            output += next.message;
            level++;
            next = next.next;
        }
        return output;
        function contents(file, start, length) {
            const MAX_LINES = 5;
            const CONTEXT_LINES = 2;
            const { line: firstLine, character: firstLineChar } = file.getPosition(start);
            const { line: lastLine, character: lastLineChar } = file.getPosition(start + length);
            output += '\n';
            for (let n = firstLine; n <= lastLine; n++) {
                if (lastLine - firstLine >= MAX_LINES) {
                    if (n >= firstLine + CONTEXT_LINES && n <= lastLine - CONTEXT_LINES) {
                        if (n == firstLine + CONTEXT_LINES) {
                            output += gutter('...') + '\n';
                        }
                        continue;
                    }
                }
                let line = file.getLine(n);
                let expanded = expand(line);
                let begin = 0;
                let end = expanded.length;
                if (n == firstLine) {
                    begin = textColumn(line, firstLineChar);
                }
                if (n == lastLine) {
                    end = textColumn(line, lastLineChar);
                }
                output += gutter(n + 1) + ' ' + _gu.colors.italic(expanded) + '\n';
                output += gutter() + ' ' + repeat(' ', begin) + _gu.colors.red(repeat('~', end - begin)) + '\n';
            }
            output += '\n';
            function gutter(s = '') {
                s = String(s);
                while (s.length < 6) {
                    s = ' ' + s;
                }
                return _gu.colors.bgBlack.white(s);
            }
            function repeat(s, n) {
                let r = '';
                while (n-- > 0) {
                    r += s;
                }
                return r;
            }
            function expand(line) {
                let result = '';
                let column = 0;
                for (let n = 0; n < line.length; n++) {
                    if (line.charCodeAt(n) == 9 /* TAB */) {
                        let end = (Math.floor(column / tabWidth) + 1) * tabWidth;
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
                let column = 0;
                for (let n = 0; n < character; n++) {
                    if (line.charCodeAt(n) == 9 /* TAB */) {
                        let end = (Math.floor(column / tabWidth) + 1) * tabWidth;
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
    };
}
exports.newFormatter = newFormatter;
