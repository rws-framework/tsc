#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpile = transpile;
const console_1 = require("@rws-framework/console");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const params_1 = require("./inc/params");
const build_1 = require("./inc/build");
// Detect if this is being called as a CLI
const isCliCall = require.main === module;
const { appRoot, rwsCliConfigDir, tscExecDir, isVerbose, params, allowedOptions, getParamString, hasAllowedOption } = (0, params_1.getParams)();
const verboseLog = console.log;
console.log = (data) => {
    if (isVerbose) {
        verboseLog(data);
    }
};
async function transpile({ runspaceDir, entries = { main: 'src/index.ts' }, buildDir = null, outFileName = 'main.js', tsPaths = {}, isDev = false }) {
    try {
        if (!buildDir) {
            buildDir = path_1.default.join(runspaceDir, 'build');
        }
        const hasRebuild = hasAllowedOption(allowedOptions.RELOAD);
        const doWarmCache = true; //needsCacheWarming(rwsCliConfigDir) || hasRebuild;  
        if (doWarmCache) {
            await (0, build_1.buildCLI)(entries, appRoot, runspaceDir, buildDir, outFileName, tscExecDir, tsPaths, isDev, hasRebuild, isVerbose);
        }
        else {
            console.log(chalk_1.default.blue('[RWS CLI CACHE] Starting command from built CLI client.'));
        }
        const transpiledBinPath = path_1.default.join(buildDir, outFileName);
        await console_1.rwsShell.runCommand(`node ${transpiledBinPath}${getParamString()}`, runspaceDir);
        return {
            transpiledBinPath
        };
    }
    catch (e) {
        console.log(chalk_1.default.redBright('[RWS Transpilation error]'));
        console.error(e);
    }
}
// CLI Command Handler
if (isCliCall) {
    handleCliCall();
}
async function handleCliCall() {
    try {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.log(chalk_1.default.yellow('Usage: rws-tsc [command] [options]'));
            console.log('Commands:');
            console.log('  transpile <runspaceDir> [options]  - Transpile TypeScript files');
            console.log('  help                               - Show this help message');
            return;
        }
        const command = args[0];
        switch (command) {
            case 'transpile':
                await handleTranspileCommand(args.slice(1));
                break;
            case 'help':
            case '--help':
            case '-h':
                showHelp();
                break;
            default:
                console.log(chalk_1.default.red(`Unknown command: ${command}`));
                console.log('Use "rws-tsc help" for available commands.');
                process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('CLI Error:'), error);
        process.exit(1);
    }
}
async function handleTranspileCommand(args) {
    var _a;
    if (args.length === 0) {
        console.log(chalk_1.default.red('Error: runspaceDir is required'));
        console.log('Usage: rws-tsc transpile <runspaceDir> [options]');
        process.exit(1);
    }
    const runspaceDir = path_1.default.resolve(args[0]);
    const options = {
        runspaceDir,
        entries: { main: 'src/index.ts' },
        isDev: true
    };
    // Parse additional options
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--entry' && i + 1 < args.length) {
            const entryPath = args[++i];
            options.entries = { main: entryPath };
        }
        else if (arg === '--build-dir' && i + 1 < args.length) {
            options.buildDir = path_1.default.resolve(args[++i]);
        }
        else if (arg === '--out-file' && i + 1 < args.length) {
            options.outFileName = args[++i];
        }
        else if (arg === '--prod') {
            options.isDev = false;
        }
    }
    console.log(chalk_1.default.blue('Starting transpilation...'));
    console.log(chalk_1.default.gray(`Runspace: ${runspaceDir}`));
    console.log(chalk_1.default.gray(`Entry: ${(_a = options.entries) === null || _a === void 0 ? void 0 : _a.main}`));
    const result = await transpile(options);
    if (result) {
        console.log(chalk_1.default.green('✓ Transpilation completed successfully'));
        console.log(chalk_1.default.gray(`Output: ${result.transpiledBinPath}`));
    }
    else {
        console.log(chalk_1.default.red('✗ Transpilation failed'));
        process.exit(1);
    }
}
function showHelp() {
    console.log(chalk_1.default.bold('RWS TypeScript Compiler'));
    console.log('');
    console.log('Usage: rws-tsc [command] [options]');
    console.log('');
    console.log('Commands:');
    console.log('  transpile <runspaceDir>    Transpile TypeScript files');
    console.log('  help                       Show this help message');
    console.log('');
    console.log('Transpile Options:');
    console.log('  --entry <path>            Entry file path (default: src/index.ts)');
    console.log('  --build-dir <path>        Build output directory');
    console.log('  --out-file <name>         Output filename (default: main.cli.rws.js)');
    console.log('  --prod                    Production mode (default: development)');
    console.log('');
    console.log('Examples:');
    console.log('  rws-tsc transpile ./my-project');
    console.log('  rws-tsc transpile ./my-project --entry src/main.ts --prod');
    console.log('  rws-tsc transpile ./my-project --build-dir ./dist --out-file app.js');
}
