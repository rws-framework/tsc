"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCLI = buildCLI;
const webpack_1 = __importDefault(require("webpack"));
const webpack_2 = require("./webpack");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function buildCLI(entries, appRoot, runspaceDir, buildDir, cliExecDir, tsPaths = {}, isDev = false, hasRebuild = false, isVerbose = false) {
    var _a, _b, _c;
    console.log(chalk_1.default.blue(`[DEBUG] Build directory: ${buildDir}`));
    console.log(chalk_1.default.blue(`[DEBUG] Runspace directory: ${runspaceDir}`));
    console.log(chalk_1.default.blue(`[DEBUG] CLI exec directory: ${cliExecDir}`));
    console.log(chalk_1.default.blue(`[DEBUG] Entry file: ${entries.main}`));
    // Ensure build directory exists
    if (!fs_1.default.existsSync(buildDir)) {
        fs_1.default.mkdirSync(buildDir, { recursive: true });
    }
    // Try webpack
    const webpackCfg = (0, webpack_2.configureWebpack)(entries, buildDir, runspaceDir, tsPaths, isDev);
    console.log(`${chalk_1.default.green(`[RWS Transpile CLI]`)} Running webpack in ${chalk_1.default.blueBright(`"${runspaceDir}"`)} ...`);
    // Add environment variables
    (_a = webpackCfg.plugins) === null || _a === void 0 ? void 0 : _a.push(new webpack_1.default.DefinePlugin({
        'process.env.RWS_CLI_EXEC': JSON.stringify(cliExecDir),
        'process.env.RWS_APP_ROOT': JSON.stringify(appRoot),
        'process.env.RWS_APP_RELOADED': JSON.stringify(hasRebuild)
    }));
    if (isVerbose) {
        console.log(chalk_1.default.blue('[DEBUG] Webpack configuration:'), {
            entry: webpackCfg.entry,
            output: webpackCfg.output,
            resolve: {
                extensions: (_b = webpackCfg.resolve) === null || _b === void 0 ? void 0 : _b.extensions,
                alias: (_c = webpackCfg.resolve) === null || _c === void 0 ? void 0 : _c.alias
            }
        });
    }
    try {
        await new Promise((resolve, reject) => {
            (0, webpack_1.default)(webpackCfg).run((err, stats) => {
                if (err) {
                    console.error(chalk_1.default.red(`[ERROR] Webpack error: ${err.message}`));
                    reject(err);
                    return;
                }
                if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                    console.error(chalk_1.default.red('[ERROR] Webpack build errors:'));
                    const info = stats.toJson();
                    if (info.errors) {
                        info.errors.forEach(error => {
                            console.error(chalk_1.default.red(error.message));
                        });
                    }
                    reject(new Error('Webpack build failed with errors'));
                    return;
                }
                // Log webpack stats
                console.log(chalk_1.default.green('[DEBUG] Webpack build completed'));
                const statsJson = stats === null || stats === void 0 ? void 0 : stats.toJson({
                    assets: true,
                    chunks: false,
                    modules: false
                });
                if (statsJson === null || statsJson === void 0 ? void 0 : statsJson.assets) {
                    console.log(chalk_1.default.green('[DEBUG] Generated assets:'));
                    statsJson.assets.forEach(asset => {
                        console.log(`- ${asset.name} (${asset.size} bytes)`);
                    });
                }
                else {
                    console.log(chalk_1.default.yellow('[DEBUG] No assets were generated by webpack'));
                }
                resolve();
            });
        });
    }
    catch (e) {
        const error = e;
        console.error(chalk_1.default.red(`[ERROR] Webpack build error: ${error.message}`));
        console.error(error.stack);
        throw new Error(`Webpack build error: ${error.message}\n${error.stack}`);
    }
    // Check if webpack created the output file
    const outputFile = path_1.default.join(buildDir, 'main.cli.rws.js');
    if (!fs_1.default.existsSync(outputFile)) {
        console.error(chalk_1.default.red(`[ERROR] Webpack did not create output file: ${outputFile}`));
        // List all files in the build directory
        console.error(chalk_1.default.red(`[ERROR] Files in build directory: ${fs_1.default.readdirSync(buildDir).join(', ') || 'none'}`));
        throw new Error(`Webpack did not create output file: ${outputFile}`);
    }
    console.log(chalk_1.default.green(`[RWS CLI] CLI client generated: ${outputFile}`));
    console.log(chalk_1.default.green(`[RWS CLI] File size: ${fs_1.default.statSync(outputFile).size} bytes`));
}
