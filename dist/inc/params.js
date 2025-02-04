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
    const params = argv.filter(item => !item.startsWith('--'));
    const options = argv.filter(item => item.startsWith('--'));
    const hasAllowedOption = (option) => options.includes(`--${option}`);
    const appRoot = console_1.rwsPath.findRootWorkspacePath();
    const rwsCliConfigDir = path_1.default.resolve(appRoot, 'node_modules', '.rws', 'cli');
    const tscExecDir = path_1.default.resolve(__dirname, '..');
    const isVerbose = hasAllowedOption(exports.allowedOptions.VERBOSE);
    params.push(tscExecDir);
    const getParamString = () => params.length ? (' ' + params.join(' ')) + (options.length ? (' ' + options.join(' ')) : '') : '';
    return {
        appRoot,
        rwsCliConfigDir,
        tscExecDir,
        isVerbose,
        params,
        options,
        allowedOptions: exports.allowedOptions,
        getParamString,
        hasAllowedOption
    };
}
