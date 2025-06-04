import path from 'path';
import webpack from 'webpack';

export function createDirnameFilenamePlugin(buildDir: string, runspaceDir: string, entry: string): webpack.WebpackPluginInstance {
    return {
        apply(compiler: webpack.Compiler) {
            compiler.hooks.compilation.tap('DirnameFilenamePlugin', (compilation) => {
                compilation.hooks.processAssets.tap(
                    {
                        name: 'DirnameFilenamePlugin',
                        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                    },
                    (assets) => {
                        Object.keys(assets).forEach((filename) => {
                            if (filename.endsWith('.js')) {
                                const asset = assets[filename];
                                let source = asset.source().toString();
                                
                                // Replace __dirname and __filename with the source directory paths
                                const srcDir = path.resolve(runspaceDir, 'src');
                                const srcFile = path.resolve(runspaceDir, entry); // Default to run.ts for main entry
                                
                                source = source.replace(
                                    /\b__dirname\b/g,
                                    JSON.stringify(srcDir)
                                );
                                
                                source = source.replace(
                                    /\b__filename\b/g,
                                    JSON.stringify(srcFile)
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
