"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDynamicImportPlugin = createDynamicImportPlugin;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
function createDynamicImportPlugin(buildDir, runspaceDir) {
    return {
        apply(compiler) {
            compiler.hooks.compilation.tap('DynamicImportPlugin', (compilation) => {
                compilation.hooks.processAssets.tap({
                    name: 'DynamicImportPlugin',
                    stage: webpack_1.default.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                }, (assets) => {
                    Object.keys(assets).forEach((filename) => {
                        if (filename.endsWith('.js')) {
                            const asset = assets[filename];
                            let source = asset.source().toString();
                            // Replace dynamic imports with calls to the helper function
                            source = source.replace(/await\s+import\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g, (match, quote, importPath) => {
                                return `await require('@rws-framework/tsc').dynamicImportTs(${quote}${importPath}${quote}, ${JSON.stringify(path_1.default.resolve(runspaceDir, 'src'))}, ${JSON.stringify(buildDir)}, ${JSON.stringify(runspaceDir)})`;
                            });
                            compilation.updateAsset(filename, new webpack_1.default.sources.RawSource(source));
                        }
                    });
                });
            });
        }
    };
}
