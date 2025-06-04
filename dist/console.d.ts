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
    dynamicImports?: boolean;
}
interface TranspileResult {
    transpiledBinPath: string;
}
export declare function transpile({ runspaceDir, entries, buildDir, outFileName, tsPaths, isDev, dynamicImports }: TranspileOptions): Promise<TranspileResult | void>;
export {};
