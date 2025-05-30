export interface AllowedOptions {
    VERBOSE: string;
    RELOAD: string;
}
export declare const allowedOptions: AllowedOptions;
export interface ParamsResult {
    appRoot: string;
    rwsCliConfigDir: string;
    tscExecDir: string;
    isVerbose: boolean;
    params: string[];
    options: string[];
    allowedOptions: AllowedOptions;
    getParamString: () => string;
    hasAllowedOption: (option: string) => boolean;
}
export declare function getParams(): ParamsResult;
