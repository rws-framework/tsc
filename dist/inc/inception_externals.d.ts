import { ExternalItemFunctionData } from 'webpack';
type ExternalsCallback = (err?: Error, result?: string | boolean | string[] | {
    [index: string]: any;
}) => void;
type ExternalsFunction = (data: ExternalItemFunctionData, callback: ExternalsCallback) => void;
declare const webpackRelatedExternals: RegExp[];
declare const nodeBuiltins: string[];
declare const webpackInceptionExternals: ExternalsFunction;
export { webpackInceptionExternals, webpackRelatedExternals, nodeBuiltins };
