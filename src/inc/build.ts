import webpack from 'webpack';
import { configureWebpack } from './webpack';
import chalk from 'chalk';
import fs from 'fs';

interface Entries {
    [key: string]: string;
}

interface TsPaths {
    [key: string]: string[];
}

export async function buildCLI(
    entries: Entries,
    appRoot: string,
    runspaceDir: string,
    buildDir: string,
    cliExecDir: string,
    tsPaths: TsPaths = {},
    isDev: boolean = false,
    hasRebuild: boolean = false
): Promise<void> {
    const webpackCfg = configureWebpack(entries, buildDir, runspaceDir, tsPaths, isDev);
    console.log(`${chalk.green(`[RWS Transpile CLI]`)} Running transpiler in ${chalk.blueBright(`"${runspaceDir}"`)} ...`);

    webpackCfg.plugins?.push(new webpack.DefinePlugin({
        'process.env.RWS_CLI_EXEC': JSON.stringify(cliExecDir),
        'process.env.RWS_APP_ROOT': JSON.stringify(appRoot),
        'process.env.RWS_APP_RELOADED': JSON.stringify(hasRebuild)
    }));
       
    try {
        await new Promise<void>((resolve, reject) => {
            webpack(webpackCfg).run((err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    } catch (e) {
        const error = e as Error;
        throw new Error(`Webpack build error: ${error.message}\n${error.stack}`);
    }

    console.log(chalk.green('[RWS CLI] CLI client generated'));
}
