#!/usr/bin/env node
interface TranspileOptions {
    runspaceDir: string;
    entries?: {
        [key: string]: string;
    };
    buildDir?: string | null;
    outFileName?: string;
    tsPaths?: {
        [key: string]: string[];
    };
    isDev?: boolean;
    extraNodeModules?: string[];
    dynamicImports?: boolean;
    dirnameFilenameReplace?: boolean;
}
interface TranspileResult {
    transpiledBinPath: string;
}
export declare function transpile({ runspaceDir, entries, buildDir, outFileName, tsPaths, isDev, extraNodeModules, dynamicImports, dirnameFilenameReplace }: TranspileOptions): Promise<TranspileResult | void>;
export {};
