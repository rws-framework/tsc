import { Configuration } from 'webpack';
interface WebpackEntries {
    [key: string]: string;
}
interface TsPaths {
    [key: string]: string[];
}
export declare function configureWebpack(entries: WebpackEntries, buildDir: string, outFileName: string, runspaceDir: string, paths?: TsPaths, isDev?: boolean, extraNodeModules?: string[], dynamicImports?: boolean, dirnameFilenameReplace?: boolean): Configuration;
export {};
