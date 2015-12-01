"use strict";

import {TextFile} from './textfile';
import {Env, Character} from './util';
import * as _gu from 'gulp-util';

export enum DiagnosticCategory {
    Warning = 0,
    Error = 1,
    Message = 2,
}

export interface DiagnosticChain {
    category: DiagnosticCategory;
    code: number;
    message: string;
    next: DiagnosticChain;
}

export interface Diagnostic extends DiagnosticChain {
    file: TextFile;
    start: number;
    length: number;
}

export interface DiagnosticFormatter {
    (diagnostic: Diagnostic): string;
}

export function newFormatter(env: Env,
                             pretty: boolean = true,
                             tabWidth: number = 4): DiagnosticFormatter {
    return function format(diagnostic: Diagnostic): string {
        const colors = _gu.colors;
        const categoryName = {
            [DiagnosticCategory.Warning]: colors.yellow('warning'),
            [DiagnosticCategory.Error]: colors.red('error'),
            [DiagnosticCategory.Message]: colors.blue('message'),
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

        function contents(file: TextFile, start: number, length: number) {
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
                output += gutter(n + 1) + ' ' + colors.italic(expanded) + '\n';
                output += gutter() + ' ' + repeat(' ', begin) + colors.red(repeat('~', end - begin)) + '\n';
            }
            output += '\n';

            function gutter(s: any = '') {
                s = String(s);
                while (s.length < 6) {
                    s = ' ' + s;
                }
                return colors.bgBlack.white(s);
            }

            function repeat(s: string, n: number) {
                let r = '';
                while (n-- > 0) {
                    r += s;
                }
                return r;
            }

            function expand(line: string): string {
                let result = '';
                let column = 0;
                for (let n = 0; n < line.length; n++) {
                    if (line.charCodeAt(n) == Character.TAB) {
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

            function textColumn(line: string, character: number): number {
                let column = 0;
                for (let n = 0; n < character; n++) {
                    if (line.charCodeAt(n) == Character.TAB) {
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
    }
}
