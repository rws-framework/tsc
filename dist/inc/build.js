"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCLI = buildCLI;
const webpack_1 = __importDefault(require("webpack"));
const webpack_2 = require("./webpack");
const chalk_1 = __importDefault(require("chalk"));
async function buildCLI(entries, appRoot, runspaceDir, buildDir, cliExecDir, tsPaths = {}, isDev = false, hasRebuild = false) {
    var _a;
    const webpackCfg = (0, webpack_2.configureWebpack)(entries, buildDir, runspaceDir, tsPaths, isDev);
    console.log(`${chalk_1.default.green(`[RWS Transpile CLI]`)} Running transpiler in ${chalk_1.default.blueBright(`"${runspaceDir}"`)} ...`);
    (_a = webpackCfg.plugins) === null || _a === void 0 ? void 0 : _a.push(new webpack_1.default.DefinePlugin({
        'process.env.RWS_CLI_EXEC': JSON.stringify(cliExecDir),
        'process.env.RWS_APP_ROOT': JSON.stringify(appRoot),
        'process.env.RWS_APP_RELOADED': JSON.stringify(hasRebuild)
    }));
    try {
        await new Promise((resolve, reject) => {
            (0, webpack_1.default)(webpackCfg).run((err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    catch (e) {
        const error = e;
        throw new Error(`Webpack build error: ${error.message}\n${error.stack}`);
    }
    console.log(chalk_1.default.green('[RWS CLI] CLI client generated'));
}
