"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDirnameFilenamePlugin = createDirnameFilenamePlugin;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
function createDirnameFilenamePlugin(buildDir, runspaceDir) {
    return {
        apply(compiler) {
            compiler.hooks.compilation.tap('DirnameFilenamePlugin', (compilation) => {
                compilation.hooks.processAssets.tap({
                    name: 'DirnameFilenamePlugin',
                    stage: webpack_1.default.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                }, (assets) => {
                    Object.keys(assets).forEach((filename) => {
                        if (filename.endsWith('.js')) {
                            const asset = assets[filename];
                            let source = asset.source().toString();
                            // Replace __dirname and __filename with the source directory paths
                            const srcDir = path_1.default.resolve(runspaceDir, 'src');
                            const srcFile = path_1.default.resolve(runspaceDir, 'src', 'run.ts'); // Default to run.ts for main entry
                            source = source.replace(/\b__dirname\b/g, JSON.stringify(srcDir));
                            source = source.replace(/\b__filename\b/g, JSON.stringify(srcFile));
                            compilation.updateAsset(filename, new webpack_1.default.sources.RawSource(source));
                        }
                    });
                });
            });
        }
    };
}
