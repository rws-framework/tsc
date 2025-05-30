import { Configuration } from 'webpack';
interface WebpackEntries {
    [key: string]: string;
}
interface TsPaths {
    [key: string]: string[];
}
export declare function configureWebpack(entries: WebpackEntries, buildDir: string, runspaceDir: string, paths?: TsPaths, isDev?: boolean): Configuration;
export {};
