import {Character} from './util';

export interface TextPosition {
    /** Zero-based line index. */
    line: number;
    /** Zero-based character index from the start of the line, tabs not expanded. */
    character: number;
}

export class TextFile {
    private lineMap: number[];

    constructor(public fileName: string, public text: string) {}

    getPosition(offset: number): TextPosition {
        this.initLineMap();
        if (offset < 0 || offset > this.text.length) {
            throw new Error();
        }
        let l = 0, h = this.lineMap.length - 1;
        while (l <= h) {
            let m = Math.floor((l + h) / 2);
            let begin = this.lineMap[m];
            let end = this.lineMap[m + 1];
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

    getLine(line: number): string {
        this.initLineMap();
        if (line < 0 || line >= this.lineMap.length) {
            throw new Error();
        }
        let begin = this.lineMap[line];
        let end = this.lineMap[line + 1];
        while (begin < end) {
            let ch = this.text.charCodeAt(end - 1);
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
        return this.text.substring(begin, end);
    }

    private initLineMap() {
        if (!Array.isArray(this.lineMap)) {
            this.lineMap = [];
            let pos = 0;
            let lineStart = 0;
            while (pos < this.text.length) {
                switch (this.text.charCodeAt(pos++)) {
                    case Character.CR:
                        if (this.text.charCodeAt(pos) === Character.LF) {
                            pos++;
                        }
                    case Character.LF:
                    case Character.LINE_SEPARATOR:
                    case Character.PARAGRAPH_SEPARATOR:
                        this.lineMap.push(lineStart);
                        lineStart = pos;
                        break;
                }
            }
            this.lineMap.push(lineStart);
        }
    }
}
