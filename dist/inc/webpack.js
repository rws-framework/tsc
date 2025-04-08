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
const fs_1 = __importDefault(require("fs"));
const appRootPath = process.cwd();
const rootPackageNodeModules = path_1.default.resolve(console_1.rwsPath.findRootWorkspacePath(), 'node_modules');
const thisPackage = path_1.default.resolve(__dirname, '..');
const emptyModulePath = path_1.default.resolve(rootPackageNodeModules, 'empty-module.js');
if (!fs_1.default.existsSync(emptyModulePath)) {
    fs_1.default.writeFileSync(emptyModulePath, 'module.exports = {};');
}
const WEBPACK_PLUGINS = [
    new webpack_1.default.optimize.ModuleConcatenationPlugin(),
    new webpack_1.default.ProvidePlugin({
        'Reflect': ['reflect-metadata', 'Reflect']
    }),
    // Replace problematic entities paths with empty module
    new webpack_1.default.NormalModuleReplacementPlugin(/entities[\/\\]lib[\/\\](decode_codepoint|maps[\/\\](entities|legacy|xml)\.json)/, emptyModulePath),
    // Ignore all entities modules
    new webpack_1.default.IgnorePlugin({
        resourceRegExp: /entities/
    })
];
const modules_setup = [
    path_1.default.resolve(process.cwd(), 'node_modules'),
    rootPackageNodeModules
];
function configureWebpack(entries, buildDir, runspaceDir, paths = {}, isDev = false) {
    var _a;
    // Ensure build directory exists
    if (!fs_1.default.existsSync(buildDir)) {
        fs_1.default.mkdirSync(buildDir, { recursive: true });
    }
    const vPath = path_1.default.join(runspaceDir, 'build');
    const entryObject = { main: entries.main };
    const clientWebpackCfg = path_1.default.resolve(rootPackageNodeModules, '@rws-framework/client/builder/webpack/rws.webpack.config.js');
    const serverWebpackCfg = path_1.default.resolve(rootPackageNodeModules, '@rws-framework/server/rws.webpack.config.js');
    const cliWebpackCfg = path_1.default.resolve(rootPackageNodeModules, '@rws-framework/server/cli.rws.webpack.config.js');
    const cfgExport = {
        context: runspaceDir,
        entry: entryObject,
        mode: isDev ? 'development' : 'production',
        target: 'node',
        devtool: isDev ? 'source-map' : false,
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
                path_1.default.resolve(runspaceDir, 'node_modules'),
                ...modules_setup
            ],
            alias: {
                '@rws-client-webpack': fs_1.default.existsSync(clientWebpackCfg) ? clientWebpackCfg : false,
                '@rws-server-webpack': fs_1.default.existsSync(serverWebpackCfg) ? serverWebpackCfg : false,
                '@rws-server-cli-webpack': fs_1.default.existsSync(cliWebpackCfg) ? cliWebpackCfg : false,
                '@V': vPath,
                ...Object.keys(paths).reduce((acc, key) => ({
                    ...acc,
                    [key.replace('/*', '')]: path_1.default.resolve(runspaceDir, paths[key][0].replace('/*', ''))
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
                                configFile: path_1.default.resolve(runspaceDir, 'tsconfig.json'),
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
                        path_1.default.resolve(runspaceDir, 'src'),
                        path_1.default.resolve(runspaceDir),
                        console_1.rwsPath.findPackageDir(path_1.default.resolve(runspaceDir)),
                        path_1.default.resolve(thisPackage),
                        ...Object.values(paths).flat().map(pathPattern => {
                            const pathValue = typeof pathPattern === 'string' ? pathPattern : pathPattern[0];
                            return path_1.default.resolve(runspaceDir, pathValue.replace('/*', ''));
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
            inception_externals_1.webpackInceptionExternals,
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
    (_a = cfgExport.plugins) === null || _a === void 0 ? void 0 : _a.push(new webpack_1.default.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true
    }));
    return cfgExport;
}
