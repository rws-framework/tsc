import path from 'path';
import fs from 'fs';

export async function dynamicImportTs(importPath: string, srcDir: string, buildDir: string, runspaceDir: string): Promise<any> {
    const rwsTsc = require('@rws-framework/tsc');
    
    // Resolve the import path relative to source directory
    const fullPath = path.resolve(srcDir, importPath);
    const tsPath = fullPath.endsWith('.ts') ? fullPath : fullPath + '.ts';
    
    // Generate output path in build directory
    const relativePath = path.relative(srcDir, tsPath);
    const outputPath = path.resolve(buildDir, relativePath.replace(/\.ts$/, '.js'));
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Check if we need to transpile (file doesn't exist or source is newer)
    let needsTranspile = !fs.existsSync(outputPath);
    if (!needsTranspile && fs.existsSync(tsPath)) {
        const srcStat = fs.statSync(tsPath);
        const outStat = fs.statSync(outputPath);
        needsTranspile = srcStat.mtime > outStat.mtime;
    }
    
    if (needsTranspile && fs.existsSync(tsPath)) {
        // Transpile the TypeScript file on demand
        await rwsTsc.transpile({
            runspaceDir: runspaceDir,
            entries: {
                [path.basename(outputPath, '.js')]: tsPath
            },
            buildDir: outputDir,
            isDev: true
        });
    }
    
    // Require the transpiled module
    delete require.cache[outputPath];
    return require(outputPath);
}
