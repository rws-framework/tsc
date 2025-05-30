import path from 'path';
import webpack from 'webpack';

export function createDynamicImportPlugin(buildDir: string, runspaceDir: string): webpack.WebpackPluginInstance {
    return {
        apply(compiler: webpack.Compiler) {
            compiler.hooks.compilation.tap('DynamicImportPlugin', (compilation) => {
                compilation.hooks.processAssets.tap(
                    {
                        name: 'DynamicImportPlugin',
                        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                    },
                    (assets) => {
                        Object.keys(assets).forEach((filename) => {
                            if (filename.endsWith('.js')) {
                                const asset = assets[filename];
                                let source = asset.source().toString();
                                
                                // Replace dynamic imports with calls to the helper function
                                source = source.replace(
                                    /await\s+import\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g,
                                    (match, quote, importPath) => {
                                        return `await require('@rws-framework/tsc').dynamicImportTs(${quote}${importPath}${quote}, ${JSON.stringify(path.resolve(runspaceDir, 'src'))}, ${JSON.stringify(buildDir)}, ${JSON.stringify(runspaceDir)})`;
                                    }
                                );
                                
                                compilation.updateAsset(filename, new webpack.sources.RawSource(source));
                            }
                        });
                    }
                );
            });
        }
    };
}
