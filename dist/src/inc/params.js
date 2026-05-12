"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedOptions = void 0;
exports.getParams = getParams;
const path_1 = __importDefault(require("path"));
const console_1 = require("@rws-framework/console");
exports.allowedOptions = {
    VERBOSE: 'verbose',
    RELOAD: 'reload'
};
function getParams() {
    const argv = [...process.argv].splice(2);
    // Parse parameters with quoted string support
    const { params: parsedParams, options } = parseParametersWithQuotes(argv);
    const hasAllowedOption = (option) => options.some(opt => opt.startsWith(`--${option}`));
    const appRoot = console_1.rwsPath.findRootWorkspacePath();
    const rwsCliConfigDir = path_1.default.resolve(appRoot, 'node_modules', '.rws', 'cli');
    const tscExecDir = path_1.default.resolve(__dirname, '..');
    const isVerbose = hasAllowedOption(exports.allowedOptions.VERBOSE);
    parsedParams.push(tscExecDir);
    const getParamString = () => {
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
        allowedOptions: exports.allowedOptions,
        getParamString,
        hasAllowedOption
    };
}
/**
 * Parse command line parameters with support for quoted strings
 */
function parseParametersWithQuotes(argv) {
    const params = [];
    const options = [];
    let i = 0;
    while (i < argv.length) {
        const arg = argv[i];
        if (arg.startsWith('--') || arg.startsWith('-')) {
            // Handle options
            options.push(arg);
        }
        else {
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
                }
                else {
                    // No closing quote found, treat as regular parameter without opening quote
                    params.push(arg.slice(1)); // Remove opening quote
                }
            }
            else {
                // Regular parameter without quotes
                params.push(arg);
            }
        }
        i++;
    }
    return { params, options };
}
