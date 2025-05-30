interface Entries {
    [key: string]: string;
}
interface TsPaths {
    [key: string]: string[];
}
export declare function buildCLI(entries: Entries, appRoot: string, runspaceDir: string, buildDir: string, cliExecDir: string, tsPaths?: TsPaths, isDev?: boolean, hasRebuild?: boolean, isVerbose?: boolean): Promise<void>;
export {};
