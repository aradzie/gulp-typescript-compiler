import { Diagnostic } from "../diagnostic";
import { TextFile } from "../textfile";
import { FileCache } from "../cache";

export interface ParseOptionsResult {
    options: any;
    fileNames: string[];
    diagnostics: Diagnostic[];
}

export interface CompileResult {
    inputFiles: TextFile[];
    outputFiles: TextFile[];
    diagnostics: Diagnostic[];
    emitSkipped: boolean;
}

export interface Adapter {
    parseOptions(options: any, fileNames: string[]): ParseOptionsResult;
    compile(options: any, fileNames: string[], cache: FileCache): CompileResult;
}
