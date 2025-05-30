#!/usr/bin/env node

import { rwsShell } from '@rws-framework/console';
import chalk from 'chalk';
import path from 'path';

import { needsCacheWarming } from './inc/cache';
import { getParams } from './inc/params';
import { buildCLI } from './inc/build';

// Detect if this is being called as a CLI
const isCliCall = require.main === module;

interface TranspileOptions {
    runspaceDir: string;
    entries?: { [key: string]: string };
    buildDir?: string | null;
    outFileName?: string;
    tsPaths?: { [key: string]: string[] };
    isDev?: boolean;
}

interface TranspileResult {
    transpiledBinPath: string;
}

const {    
    appRoot,
    rwsCliConfigDir,
    tscExecDir,
    isVerbose,    
    params,    
    allowedOptions,
    getParamString,
    hasAllowedOption
} = getParams();

const verboseLog = console.log;

console.log = (data: any) => {
    if (isVerbose) {
        verboseLog(data);
    }
};

export async function transpile({
    runspaceDir, 
    entries = { main: 'src/index.ts' }, 
    buildDir = null, 
    outFileName = 'main.cli.rws.js', 
    tsPaths = {}, 
    isDev = false
}: TranspileOptions): Promise<TranspileResult | void> {
    try {        
        if (!buildDir) {
            buildDir = path.join(runspaceDir, 'build');
        }                  

        const hasRebuild = hasAllowedOption(allowedOptions.RELOAD);
        const doWarmCache = true; //needsCacheWarming(rwsCliConfigDir) || hasRebuild;  

        if (doWarmCache) {
            await buildCLI(entries, appRoot, runspaceDir, buildDir, tscExecDir, tsPaths, isDev, hasRebuild, isVerbose);    
        } else {
            console.log(chalk.blue('[RWS CLI CACHE] Starting command from built CLI client.'));
        }

        const transpiledBinPath = path.join(buildDir, outFileName);
        await rwsShell.runCommand(`node ${transpiledBinPath}${getParamString()}`, runspaceDir);

        return {
            transpiledBinPath
        };

    } catch(e) {
        console.log(chalk.redBright('[RWS Transpilation error]'));
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
            console.log(chalk.yellow('Usage: rws-tsc [command] [options]'));
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
                console.log(chalk.red(`Unknown command: ${command}`));
                console.log('Use "rws-tsc help" for available commands.');
                process.exit(1);
        }
    } catch (error) {
        console.error(chalk.red('CLI Error:'), error);
        process.exit(1);
    }
}

async function handleTranspileCommand(args: string[]) {
    if (args.length === 0) {
        console.log(chalk.red('Error: runspaceDir is required'));
        console.log('Usage: rws-tsc transpile <runspaceDir> [options]');
        process.exit(1);
    }

    const runspaceDir = path.resolve(args[0]);
    const options: TranspileOptions = {
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
        } else if (arg === '--build-dir' && i + 1 < args.length) {
            options.buildDir = path.resolve(args[++i]);
        } else if (arg === '--out-file' && i + 1 < args.length) {
            options.outFileName = args[++i];
        } else if (arg === '--prod') {
            options.isDev = false;
        }
    }

    console.log(chalk.blue('Starting transpilation...'));
    console.log(chalk.gray(`Runspace: ${runspaceDir}`));
    console.log(chalk.gray(`Entry: ${options.entries?.main}`));
    
    const result = await transpile(options);
    
    if (result) {
        console.log(chalk.green('✓ Transpilation completed successfully'));
        console.log(chalk.gray(`Output: ${result.transpiledBinPath}`));
    } else {
        console.log(chalk.red('✗ Transpilation failed'));
        process.exit(1);
    }
}

function showHelp() {
    console.log(chalk.bold('RWS TypeScript Compiler'));
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
