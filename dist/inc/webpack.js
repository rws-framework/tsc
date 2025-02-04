"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureWebpack = configureWebpack;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const console_1 = require("@rws-framework/console");
const inception_externals_1 = require("./inception_externals");
const appRootPath = process.cwd();
const rootPackageNodeModules = path_1.default.resolve(console_1.rwsPath.findRootWorkspacePath(), 'node_modules');
const thisPackage = path_1.default.resolve(__dirname, '..');
const WEBPACK_PLUGINS = [
    new webpack_1.default.optimize.ModuleConcatenationPlugin(),
    new webpack_1.default.ProvidePlugin({
        'Reflect': ['reflect-metadata', 'Reflect']
    })
];
const modules_setup = [rootPackageNodeModules];
function configureWebpack(entries, buildDir, runspaceDir, paths = {}, isDev = false) {
    var _a;
    const vPath = path_1.default.join(runspaceDir, 'build');
    const cfgExport = {
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
                ...Object.keys(paths).reduce((acc, key) => ({
                    ...acc,
                    [key.replace('/*', '')]: path_1.default.resolve(runspaceDir, paths[key][0].replace('/*', ''))
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
                        console_1.rwsPath.findPackageDir(path_1.default.resolve(runspaceDir)),
                        path_1.default.resolve(thisPackage),
                        path_1.default.resolve(rootPackageNodeModules, '@rws-framework'),
                        ...Object.values(paths).flat().map(pathPattern => {
                            return path_1.default.resolve(runspaceDir, pathPattern[0].replace('/*', ''));
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
            inception_externals_1.webpackInceptionExternals
        ],
    };
    (_a = cfgExport.plugins) === null || _a === void 0 ? void 0 : _a.push(new webpack_1.default.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true
    }));
    return cfgExport;
}
