interface Entries {
    [key: string]: string;
}
interface TsPaths {
    [key: string]: string[];
}
export declare function buildCLI(entries: Entries, appRoot: string, runspaceDir: string, buildDir: string, outFileName: string, cliExecDir: string, tsPaths?: TsPaths, isDev?: boolean, extraNodeModules?: string[], hasRebuild?: boolean, isVerbose?: boolean, dynamicImports?: boolean, dirnameFilenameReplace?: boolean): Promise<void>;
export {};
