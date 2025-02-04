const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const { rwsPath } = require('@rws-framework/console');
const { webpackInceptionExternals  } = require('./inception_externals');

const appRootPath = process.cwd();
const rootPackageNodeModules = path.resolve(rwsPath.findRootWorkspacePath(), 'node_modules');
const thisPackage = path.resolve(__dirname, '..');
const WEBPACK_PLUGINS = [new webpack.optimize.ModuleConcatenationPlugin()];

const modules_setup = [rootPackageNodeModules];


function configureWebpack(entries, buildDir, runspaceDir, paths = {}, isDev = false){
  const vPath = path.join(runspaceDir, 'build');

    const cfgExport = {
        context: runspaceDir,
        entry: entries.main,
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
                    transpileOnly: false,                    
                    configFile: false,
                    compilerOptions: {                      
                        outDir: runspaceDir,                        
                        baseUrl: path.resolve(),
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
          topLevelAwait: true, // Enable top-level await if needed
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
              'source-map-support': 'commonjs source-map-support'
          }
        ],
    }
      
    cfgExport.plugins.push(
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true
        })
    );

    return cfgExport;
}

module.exports = { configureWebpack }