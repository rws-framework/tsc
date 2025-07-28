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
    
    // Parse parameters with quoted string support
    const { params: parsedParams, options } = parseParametersWithQuotes(argv);
    
    const hasAllowedOption = (option: string): boolean => 
        options.some(opt => opt.startsWith(`--${option}`));

    const appRoot: string = rwsPath.findRootWorkspacePath();    
    const rwsCliConfigDir: string = path.resolve(appRoot, 'node_modules', '.rws', 'cli');    
    const tscExecDir: string = path.resolve(__dirname, '..');
    const isVerbose: boolean = hasAllowedOption(allowedOptions.VERBOSE);

    parsedParams.push(tscExecDir);

    const getParamString = (): string => {
        const paramString = parsedParams.map(param => {
            // If parameter contains spaces, wrap it in quotes
            return param.includes(' ') ? `"${param}"` : param;
        }).join(' ');
        
        const optionString = options.join(' ');
        
        return (paramString ? (' ' + paramString) : '') + (optionString ? (' ' + optionString) : '');
    };

    return {
        appRoot,
        rwsCliConfigDir,
        tscExecDir,
        isVerbose,
        params: parsedParams,
        options,
        allowedOptions,
        getParamString,
        hasAllowedOption
    };
}

/**
 * Parse command line parameters with support for quoted strings
 */
function parseParametersWithQuotes(argv: string[]): { params: string[]; options: string[] } {
    const params: string[] = [];
    const options: string[] = [];
    
    let i = 0;
    while (i < argv.length) {
        const arg = argv[i];
        
        if (arg.startsWith('--') || arg.startsWith('-')) {
            // Handle options
            options.push(arg);
        } else {
            // Handle regular parameters with quote support
            if (arg.startsWith('"')) {
                // Start of quoted parameter
                const quotedParts = [arg];
                let foundClosingQuote = arg.endsWith('"') && arg.length > 1;
                let j = i + 1;
                
                if (!foundClosingQuote) {
                    // Look for closing quote in subsequent parameters
                    while (j < argv.length && !foundClosingQuote) {
                        quotedParts.push(argv[j]);
                        if (argv[j].endsWith('"')) {
                            foundClosingQuote = true;
                        }
                        j++;
                    }
                }
                
                if (foundClosingQuote) {
                    // Join all parts and remove surrounding quotes
                    const quotedParam = quotedParts.join(' ');
                    params.push(quotedParam.slice(1, -1)); // Remove first and last quote
                    i = j - 1; // Skip consumed parameters
                } else {
                    // No closing quote found, treat as regular parameter without opening quote
                    params.push(arg.slice(1)); // Remove opening quote
                }
            } else {
                // Regular parameter without quotes
                params.push(arg);
            }
        }
        
        i++;
    }
    
    return { params, options };
}
