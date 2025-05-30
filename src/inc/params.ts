import path from 'path';
import { rwsPath } from '@rws-framework/console';

export interface AllowedOptions {
    VERBOSE: string;
    RELOAD: string;
}

export const allowedOptions: AllowedOptions = {
    VERBOSE: 'verbose',
    RELOAD: 'reload'
};

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

export function getParams(): ParamsResult {
    const argv: string[] = [...process.argv].splice(2);
    const params: string[] = argv.filter(item => !item.startsWith('--'));
    const options: string[] = argv.filter(item => item.startsWith('--'));
    const hasAllowedOption = (option: string): boolean => 
        options.includes(`--${option}`);

    const appRoot: string = rwsPath.findRootWorkspacePath();    
    const rwsCliConfigDir: string = path.resolve(appRoot, 'node_modules', '.rws', 'cli');    
    const tscExecDir: string = path.resolve(__dirname, '..');
    const isVerbose: boolean = hasAllowedOption(allowedOptions.VERBOSE);

    params.push(tscExecDir);

    const getParamString = (): string => 
        params.length ? (' ' + params.join(' ')) + (options.length ? (' ' + options.join(' ')) : '') : '';

    return {
        appRoot,
        rwsCliConfigDir,
        tscExecDir,
        isVerbose,
        params,
        options,
        allowedOptions,
        getParamString,
        hasAllowedOption
    };
}
