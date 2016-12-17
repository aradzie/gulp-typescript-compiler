import { Character } from "./util";

export interface TextPosition {
    /** Zero-based line index. */
    line: number;
    /** Zero-based character index from the start of the line, tabs not expanded. */
    character: number;
}

export interface TextFile {
    fileName: string;
    text: string;
    getPosition(offset: number): TextPosition;
    getLine(line: number): string;
}

export function newTextFile(fileName: string, text: string) {
    let lineMap: number[] = null;

    return {
        fileName,
        text,
        getPosition,
        getLine,
    };

    function getPosition(offset: number): TextPosition {
        initLineMap();
        if (offset < 0 || offset > text.length) {
            throw new Error();
        }
        let l = 0, h = lineMap.length - 1;
        while (l <= h) {
            let m = Math.floor((l + h) / 2);
            let begin = lineMap[m];
            let end = lineMap[m + 1];
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
        throw new Error(); // Unreachable
    }

    function getLine(line: number): string {
        initLineMap();
        if (line < 0 || line >= lineMap.length) {
            throw new Error();
        }
        let begin = lineMap[line];
        let end = lineMap[line + 1];
        while (begin < end) {
            let ch = text.charCodeAt(end - 1);
            if (ch == Character.LF
                    || ch == Character.CR
                    || ch == Character.LINE_SEPARATOR
                    || ch == Character.PARAGRAPH_SEPARATOR) {
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
            let pos = 0;
            let lineStart = 0;
            while (pos < text.length) {
                switch (text.charCodeAt(pos++)) {
                    case Character.CR:
                        if (text.charCodeAt(pos) === Character.LF) {
                            pos++;
                        }
                    case Character.LF:
                    case Character.LINE_SEPARATOR:
                    case Character.PARAGRAPH_SEPARATOR:
                        lineMap.push(lineStart);
                        lineStart = pos;
                        break;
                }
            }
            lineMap.push(lineStart);
        }
    }
}
