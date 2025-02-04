const webpack = require('webpack');
const { configureWebpack } = require('./webpack');
const chalk = require('chalk');
const fs = require('fs');
// const { getCachedPath } = require('./cache');

async function buildCLI(entries, appRoot, runspaceDir, buildDir, cliExecDir, tsPaths = {}, isDev = false, hasRebuild = false){
    const webpackCfg = configureWebpack(entries, buildDir, runspaceDir, tsPaths, isDev);
        console.log(`${chalk.green(`[RWS Transpile CLI]`)} Running transpiler in ${chalk.blueBright(`"${runspaceDir}"`)} ...`);

        // const cacheTypes = ['paths', 'checksum'];

        // for(const type of cacheTypes){
        //     if(fs.existsSync(getCachedPath(type, rwsCliConfigDir))){
        //         fs.unlinkSync(getCachedPath(type, rwsCliConfigDir));
        //     }
        // }              

        webpackCfg.plugins.push(new webpack.DefinePlugin({
            'process.env.RWS_CLI_EXEC': JSON.stringify(cliExecDir),
            'process.env.RWS_APP_ROOT': JSON.stringify(appRoot),
            'process.env.RWS_APP_RELOADED': JSON.stringify(hasRebuild)
        })) 
       
        try {
            await  new Promise((resolve) => {
                webpack(webpackCfg).run((webpackBuildData) => {
                    resolve();
                });
            });
        } catch (e) {
            throw new Error(`Webpack build error: ${e.message}\n${e.stack}`)
        }

        console.log(chalk.green('[RWS CLI] CLI client generated'));
}

module.exports = { buildCLI }