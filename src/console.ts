#!/usr/bin/env node

import { rwsShell } from '@rws-framework/console';
import chalk from 'chalk';
import path from 'path';

import { needsCacheWarming } from './inc/cache';
import { getParams } from './inc/params';
import { buildCLI } from './inc/build';

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
            await buildCLI(entries, appRoot, runspaceDir, buildDir, tscExecDir, tsPaths, isDev, hasRebuild);    
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
