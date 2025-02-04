import path from 'path';
import chalk from 'chalk';
import webpack, { Configuration } from 'webpack';
import { rwsPath } from '@rws-framework/console';
import { webpackInceptionExternals } from './inception_externals';

const appRootPath: string = process.cwd();
const rootPackageNodeModules: string = path.resolve(rwsPath.findRootWorkspacePath(), 'node_modules');
const thisPackage: string = path.resolve(__dirname, '..');

interface WebpackEntries {
    [key: string]: string;
}

interface TsPaths {
    [key: string]: string[];
}

const WEBPACK_PLUGINS: webpack.WebpackPluginInstance[] = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.ProvidePlugin({
        'Reflect': ['reflect-metadata', 'Reflect']
    })
];

const modules_setup: string[] = [rootPackageNodeModules];

export function configureWebpack(
    entries: WebpackEntries,
    buildDir: string,
    runspaceDir: string,
    paths: TsPaths = {},
    isDev: boolean = false
): Configuration {
    const vPath: string = path.join(runspaceDir, 'build');

    const cfgExport: Configuration = {
        context: runspaceDir,
        entry: ['reflect-metadata', entries.main],
        mode: isDev ? 'development' : 'production',
        target: 'node',
        devtool: isDev ? 'source-map' : false,
        output: {
            path: buildDir,
            filename: '[name].cli.rws.js',
            sourceMapFilename: '[file].map',
            chunkFilename: "[name].chunk.js",
            libraryTarget: 'commonjs2',
            clean: false
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: modules_setup,
            alias: {
                '@V': vPath,
                ...Object.keys(paths).reduce((acc: { [key: string]: string }, key: string) => ({
                    ...acc,
                    [key.replace('/*', '')]: path.resolve(runspaceDir, paths[key][0].replace('/*', ''))
                }), {})
            },
            fallback: {
                "kerberos": false,
                "mongodb-client-encryption": false
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
                                configFile: false,
                                compilerOptions: {
                                    outDir: runspaceDir,
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
                        rwsPath.findPackageDir(path.resolve(runspaceDir)),
                        path.resolve(thisPackage),
                        path.resolve(rootPackageNodeModules, '@rws-framework'),
                        ...Object.values(paths).flat().map(pathPattern => {
                            return path.resolve(runspaceDir, pathPattern[0].replace('/*', ''));
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
        ],
        optimization: {
            minimize: false
        },
        experiments: {
            topLevelAwait: true,
        },
        externals: [
            webpackInceptionExternals
        ],
    };

    cfgExport.plugins?.push(
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true
        })
    );

    return cfgExport;
}
