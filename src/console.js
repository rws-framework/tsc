#!/usr/bin/env node

const { rwsShell } = require('@rws-framework/console');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const { needsCacheWarming } = require('./inc/cache');
const { getParams } = require('./inc/params');
const { buildCLI } = require('./inc/build');

let {    
    appRoot,
    rwsCliConfigDir,
    tscExecDir,
    isVerbose,    
    params,
    paramsString
} = getParams();

const verboseLog = console.log;

console.log = (data) => {
    if(isVerbose){
        verboseLog(data);
    }
}

async function transpile({
    runspaceDir, 
    entries = { main: 'src/index.ts' }, 
    buildDir = null, 
    outFileName = 'main.cli.rws.js', 
    tsPaths = {}, 
    isDev = false
}){
       try {        
        if(!buildDir){
            buildDir = path.join(runspaceDir, 'build');
        }                  

        const hasRebuild = params.find(item => item === '--rebuild');
        const doWarmCache = needsCacheWarming(rwsCliConfigDir) || hasRebuild;  

        if(doWarmCache){
            await buildCLI(entries, appRoot, runspaceDir, buildDir, tscExecDir, tsPaths, isDev);    
        }else{
            console.log(chalk.blue('[RWS CLI CACHE] Starting command from built CLI client.'));
        }    

        let startSlice = hasRebuild ? -1 : params.length;
        let endSlice = hasRebuild ? -1 : null ;

        paramsString = [
            ...paramsString().split(' ').slice(0, startSlice), 
            tscExecDir, 
            endSlice ? 
                paramsString().split(' ').at(endSlice) 
            : null
        ].filter((item) => item !== null).join(' ');

        const transpiledBinPath = path.join(buildDir, outFileName);
        await rwsShell.runCommand(`node ${transpiledBinPath}${paramsString}`, runspaceDir);

        return {
            transpiledBinPath
        }

    } catch(e){
        console.log(chalk.redBright('[RWS Transpilation error]'));
        console.error(e);
    } 
}

module.exports = {
    transpile
}