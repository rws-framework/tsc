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
const { appRoot, rwsCliConfigDir, tscExecDir, isVerbose, params, allowedOptions, getParamString, hasAllowedOption } = (0, params_1.getParams)();
const verboseLog = console.log;
console.log = (data) => {
    if (isVerbose) {
        verboseLog(data);
    }
};
async function transpile({ runspaceDir, entries = { main: 'src/index.ts' }, buildDir = null, outFileName = 'main.cli.rws.js', tsPaths = {}, isDev = false }) {
    try {
        if (!buildDir) {
            buildDir = path_1.default.join(runspaceDir, 'build');
        }
        const hasRebuild = hasAllowedOption(allowedOptions.RELOAD);
        const doWarmCache = true; //needsCacheWarming(rwsCliConfigDir) || hasRebuild;  
        if (doWarmCache) {
            await (0, build_1.buildCLI)(entries, appRoot, runspaceDir, buildDir, tscExecDir, tsPaths, isDev, hasRebuild);
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
