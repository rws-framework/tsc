import path from 'path';
import chalk from 'chalk';
import webpack, { Configuration } from 'webpack';
import { rwsPath } from '@rws-framework/console';
import { webpackInceptionExternals } from './inception_externals';
import { createDirnameFilenamePlugin } from './dirname-filename-plugin';
import { createDynamicImportPlugin } from './dynamic-import-plugin';
import fs from 'fs';

const appRootPath: string = process.cwd();
const rootPackageNodeModules: string = path.resolve(rwsPath.findRootWorkspacePath(), 'node_modules');
// Use a more reliable path resolution that works for transpiled files
// This resolves to the actual package directory where this webpack config is located

interface WebpackEntries {
    [key: string]: string;
}

interface TsPaths {
    [key: string]: string[];
}

const emptyModulePath = path.resolve(rootPackageNodeModules, 'empty-module.js');
if (!fs.existsSync(emptyModulePath)) {
    fs.writeFileSync(emptyModulePath, 'module.exports = {};');
}

const WEBPACK_PLUGINS: webpack.WebpackPluginInstance[] = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ProvidePlugin({
        'Reflect': ['reflect-metadata', 'Reflect']
    }),
     // Replace problematic entities paths with empty module
     new webpack.NormalModuleReplacementPlugin(
        /entities[\/\\]lib[\/\\](decode_codepoint|maps[\/\\](entities|legacy|xml)\.json)/,
        emptyModulePath
    ),
    // Ignore all entities modules
    new webpack.IgnorePlugin({
        resourceRegExp: /entities/
    })
];



const modules_setup: string[] = [
    path.resolve(process.cwd(), 'node_modules'),
    rootPackageNodeModules
];

export function configureWebpack(
    entries: WebpackEntries,
    buildDir: string,
    runspaceDir: string,
    paths: TsPaths = {},
    isDev: boolean = false
): Configuration {
    // Ensure build directory exists
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    const vPath: string = path.join(runspaceDir, 'build');
        
    const entryObject = { main: entries.main };

    const clientWebpackCfg = path.resolve(rootPackageNodeModules, '@rws-framework/client/builder/webpack/rws.webpack.config.js');
    const serverWebpackCfg = path.resolve(rootPackageNodeModules, '@rws-framework/server/rws.webpack.config.js');
    const cliWebpackCfg = path.resolve(rootPackageNodeModules, '@rws-framework/server/cli.rws.webpack.config.js');

    const cfgExport: Configuration = {
        context: runspaceDir,
        entry: entryObject,
        mode: isDev ? 'development' : 'production',
        target: 'node',
        devtool: isDev ? 'source-map' : false,
        node: {
            __dirname: false,
            __filename: false
        },
        output: {
            path: buildDir,
            filename: 'main.cli.rws.js',
            sourceMapFilename: '[file].map',
            chunkFilename: "[name].chunk.js",
            libraryTarget: 'commonjs2',
            clean: false
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: [
                path.resolve(runspaceDir, 'node_modules'),
                ...modules_setup
            ],
            alias: {    
                '@rws-client-webpack': fs.existsSync(clientWebpackCfg) ? clientWebpackCfg : false,            
                '@rws-server-webpack': fs.existsSync(serverWebpackCfg) ? serverWebpackCfg : false,
                '@rws-server-cli-webpack': fs.existsSync(cliWebpackCfg) ? cliWebpackCfg : false,
                '@V': vPath,
                ...Object.keys(paths).reduce((acc: { [key: string]: string }, key: string) => ({
                    ...acc,
                    [key.replace('/*', '')]: path.resolve(runspaceDir, paths[key][0].replace('/*', ''))
                }), {})
            },
            fallback: {
                "kerberos": false,
                "mongodb-client-encryption": false,
                "entities": false,
                "entities/lib/decode_codepoint": false,
                "entities/lib/maps/entities.json": false,
                "entities/lib/maps/legacy.json": false,
                "entities/lib/maps/xml.json": false            
            }
        },
        module: {
            rules: [
                {
                    test: /\.(ts)$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                allowTsInNodeModules: true,
                                transpileOnly: true,
                                configFile: path.resolve(runspaceDir, 'tsconfig.json'),
                                compilerOptions: {
                                    outDir: buildDir,
                                    baseUrl: '.',
                                    experimentalDecorators: true,
                                    emitDecoratorMetadata: true,
                                    emitDeclarationOnly: false,
                                    target: "ES2018",
                                    module: "commonjs",
                                    moduleResolution: "node",
                                    strict: true,
                                    skipLibCheck: true,
                                    esModuleInterop: true,
                                    resolveJsonModule: true,
                                    strictNullChecks: false,
                                    allowSyntheticDefaultImports: true,
                                    sourceMap: true,
                                    declaration: true,
                                    preserveWatchOutput: true,
                                    allowJs: true,
                                    paths
                                }
                            }
                        }
                    ],
                    include: [
                        path.resolve(runspaceDir, 'src'),
                        path.resolve(runspaceDir),
                        rwsPath.findPackageDir(path.resolve(runspaceDir)),             
                        ...Object.values(paths).flat().map(pathPattern => {
                            const pathValue = typeof pathPattern === 'string' ? pathPattern : pathPattern[0];
                            return path.resolve(runspaceDir, pathValue.replace('/*', ''));
                        })
                    ],
                    exclude: [
                        /node_modules\/(?!(@rws-framework)\/).*/,
                        /\.d\.ts$/
                    ]
                },
                {
                    test: /\.node$/,
                    use: 'node-loader',
                }
            ],
        },
        plugins: [
            ...WEBPACK_PLUGINS,
            createDirnameFilenamePlugin(buildDir, runspaceDir),
            createDynamicImportPlugin(buildDir, runspaceDir),
        ],
        optimization: {
            minimize: false
        },
        experiments: {
            topLevelAwait: true,
        },
        externals: [
            webpackInceptionExternals,
            {
                '@nestjs/common': 'commonjs @nestjs/common',
                '@nestjs/core': 'commonjs @nestjs/core',
                '@nestjs/config': 'commonjs @nestjs/config',
                '@anthropic-ai/sdk': 'commonjs @anthropic-ai/sdk',
                '@zip.js/zip.js': 'commonjs @zip.js/zip.js',
                'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
                'uuid': 'commonjs uuid',
                'source-map-support': 'commonjs source-map-support',
                '@parcel/css': 'commonjs @parcel/css',
                'lightningcss': 'commonjs lightningcss',
                '@swc/css': 'commonjs @swc/css',
                '@swc/core': 'commonjs @swc/core',
                'css-minimizer-webpack-plugin': 'commonjs css-minimizer-webpack-plugin',
                'terser-webpack-plugin': 'commonjs terser-webpack-plugin',
                'entities': 'commonjs entities'
            }
        ],
    };

    // console.log(cfgExport.resolve.alias);
    // console.log(cfgExport.module.rules[0]);

    cfgExport.plugins?.push(
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true
        })
    );

    return cfgExport;
}
