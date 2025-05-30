"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicImportTs = dynamicImportTs;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function dynamicImportTs(importPath, srcDir, buildDir, runspaceDir) {
    const rwsTsc = require('@rws-framework/tsc');
    // Resolve the import path relative to source directory
    const fullPath = path_1.default.resolve(srcDir, importPath);
    const tsPath = fullPath.endsWith('.ts') ? fullPath : fullPath + '.ts';
    // Generate output path in build directory
    const relativePath = path_1.default.relative(srcDir, tsPath);
    const outputPath = path_1.default.resolve(buildDir, relativePath.replace(/\.ts$/, '.js'));
    const outputDir = path_1.default.dirname(outputPath);
    // Ensure output directory exists
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    // Check if we need to transpile (file doesn't exist or source is newer)
    let needsTranspile = !fs_1.default.existsSync(outputPath);
    if (!needsTranspile && fs_1.default.existsSync(tsPath)) {
        const srcStat = fs_1.default.statSync(tsPath);
        const outStat = fs_1.default.statSync(outputPath);
        needsTranspile = srcStat.mtime > outStat.mtime;
    }
    if (needsTranspile && fs_1.default.existsSync(tsPath)) {
        // Transpile the TypeScript file on demand
        await rwsTsc.transpile({
            runspaceDir: runspaceDir,
            entries: {
                [path_1.default.basename(outputPath, '.js')]: tsPath
            },
            buildDir: outputDir,
            isDev: true
        });
    }
    // Require the transpiled module
    delete require.cache[outputPath];
    return require(outputPath);
}
