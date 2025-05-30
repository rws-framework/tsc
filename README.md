# @rws-framework/tsc

A TypeScript compilation and transpilation utility for the RWS (Realtime Web Suite) framework. This package provides advanced TypeScript compilation capabilities with webpack bundling, caching, CLI integration, and enhanced runtime features.

## Overview

`@rws-framework/tsc` is a specialized TypeScript compiler that extends standard TypeScript compilation with webpack bundling, intelligent caching, and seamless integration with the RWS framework ecosystem. It's designed to transpile TypeScript applications into optimized, executable JavaScript bundles for CLI and server environments.

## Features

- **Advanced TypeScript Compilation**: Full TypeScript support with decorators, metadata emission, and modern ES features
- **Webpack Integration**: Sophisticated webpack configuration with optimized bundling for Node.js environments
- **Enhanced Runtime Features**: 
  - Proper `__dirname` and `__filename` handling in transpiled files
  - Dynamic import support with on-demand transpilation
- **Intelligent Caching**: MD5-based cache warming system to avoid unnecessary recompilation
- **CLI Integration**: Comprehensive command-line interface with multiple commands and options
- **Path Mapping**: Support for TypeScript path mapping and module resolution
- **External Dependencies**: Smart handling of external modules and Node.js built-ins
- **Development Mode**: Support for both development and production builds
- **Source Maps**: Optional source map generation for debugging

## Installation

```bash
npm install @rws-framework/tsc
```

## Usage

### CLI Usage

The package provides a comprehensive CLI command `rws-tsc` with multiple commands and options:

```bash
npx rws-tsc [command] [options]
```

#### Available Commands

##### `transpile <runspaceDir> [options]`
Transpile TypeScript files in the specified directory.

```bash
# Basic usage
rws-tsc transpile ./my-project

# With custom entry point
rws-tsc transpile ./my-project --entry src/main.ts

# Production build with custom output
rws-tsc transpile ./my-project --entry src/app.ts --prod --build-dir ./dist --out-file app.js
```

**Options:**
- `--entry <path>`: Entry file path (default: `src/index.ts`)
- `--build-dir <path>`: Build output directory (default: `{runspaceDir}/build`)
- `--out-file <name>`: Output filename (default: `main.cli.rws.js`)
- `--prod`: Production mode - optimized build without source maps (default: development mode)

##### `help`
Show help information and available commands.

```bash
rws-tsc help
# or
rws-tsc --help
# or
rws-tsc -h
```

#### Legacy CLI Options

For backward compatibility, the following global options are still supported:
- `--verbose`: Enable verbose logging output
- `--reload`: Force cache reload and rebuild

### Programmatic API

```typescript
import { transpile, dynamicImportTs } from '@rws-framework/tsc';

const result = await transpile({
    runspaceDir: '/path/to/your/project',
    entries: { main: 'src/index.ts' },
    buildDir: 'build',
    outFileName: 'main.cli.rws.js',
    tsPaths: {
        '@/*': ['src/*'],
        '@utils/*': ['src/utils/*']
    },
    isDev: false
});

console.log('Transpiled binary path:', result.transpiledBinPath);

// Dynamic import helper for runtime transpilation
const module = await dynamicImportTs('./some-file', srcDir, buildDir, runspaceDir);
```

### Configuration Options

#### TranspileOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `runspaceDir` | `string` | **required** | Root directory of the project to transpile |
| `entries` | `object` | `{ main: 'src/index.ts' }` | Entry points for webpack bundling |
| `buildDir` | `string` | `{runspaceDir}/build` | Output directory for compiled files |
| `outFileName` | `string` | `'main.cli.rws.js'` | Name of the output file |
| `tsPaths` | `object` | `{}` | TypeScript path mapping configuration |
| `isDev` | `boolean` | `false` | Enable development mode with source maps |

## Enhanced Runtime Features

### Proper `__dirname` and `__filename` Handling

The package includes custom webpack plugins that ensure `__dirname` and `__filename` in transpiled files point to the source directory structure rather than the execution directory:

```typescript
// In your TypeScript source file (src/utils/helper.ts)
const configPath = path.join(__dirname, '../config.json');
// After transpilation, __dirname will correctly point to the source directory
```

### Dynamic Import Support

The package transforms `await import()` statements to support on-demand TypeScript transpilation:

```typescript
// In your TypeScript source
const module = await import('./dynamic-module');

// Gets transformed to use the helper function for runtime transpilation
const module = await require('@rws-framework/tsc').dynamicImportTs('./dynamic-module', srcDir, buildDir, runspaceDir);
```

## Architecture

### Core Components

#### 1. Transpilation Engine (`console.ts`)
- Main transpilation orchestrator with CLI command handling
- Handles cache warming and build coordination
- Executes the final transpiled binary

#### 2. Build System (`inc/build.ts`)
- Webpack-based compilation pipeline
- Asset generation and optimization
- Error handling and reporting

#### 3. Webpack Configuration (`inc/webpack.ts`)
- Advanced webpack setup for Node.js targets
- Module resolution and aliasing
- External dependency management
- Custom plugin integration

#### 4. Enhanced Runtime Plugins
- **Dirname/Filename Plugin** (`inc/dirname-filename-plugin.ts`): Fixes path resolution
- **Dynamic Import Plugin** (`inc/dynamic-import-plugin.ts`): Enables runtime transpilation
- **Dynamic Import Helper** (`inc/dynamic-import-helper.ts`): On-demand transpilation logic

#### 5. Caching System (`inc/cache.ts`)
- MD5-based file change detection
- Intelligent cache invalidation
- Performance optimization

#### 6. Parameter Management (`inc/params.ts`)
- CLI argument parsing
- Configuration management
- Environment setup

#### 7. External Dependencies (`inc/inception_externals.ts`)
- Smart external module handling
- Webpack-related package exclusion
- Node.js built-in module management

### Compilation Process

1. **Parameter Parsing**: Extract and validate CLI arguments and options
2. **Cache Check**: Determine if recompilation is necessary using MD5 checksums
3. **Webpack Configuration**: Generate optimized webpack configuration with custom plugins
4. **Compilation**: Execute webpack build with TypeScript processing and runtime enhancements
5. **Asset Generation**: Create optimized JavaScript bundles with proper path handling
6. **Execution**: Run the transpiled binary with original parameters

## Advanced Features

### Path Mapping Support

The package supports TypeScript path mapping for module resolution:

```typescript
await transpile({
    runspaceDir: '/project',
    tsPaths: {
        '@components/*': ['src/components/*'],
        '@utils/*': ['src/utils/*'],
        '@types/*': ['src/types/*']
    }
});
```

### External Module Handling

Automatically handles external dependencies:
- Node.js built-in modules (`fs`, `path`, `crypto`, etc.)
- Webpack-related packages
- Framework-specific modules (`@nestjs/*`, etc.)
- MongoDB and database drivers

### Development vs Production

```typescript
// Development mode - includes source maps and debugging info
await transpile({
    runspaceDir: '/project',
    isDev: true
});

// Production mode - optimized for performance
await transpile({
    runspaceDir: '/project',
    isDev: false
});
```

## Integration with RWS Framework

This package is designed to work seamlessly with the RWS framework ecosystem:

- **@rws-framework/console**: CLI utilities and shell operations
- **@rws-framework/client**: Client-side webpack configurations
- **@rws-framework/server**: Server-side webpack configurations

## Performance Optimizations

- **Intelligent Caching**: Avoids unnecessary recompilation using file checksums
- **Module Concatenation**: Webpack optimization for smaller bundles
- **External Dependencies**: Proper externalization of Node.js modules
- **Tree Shaking**: Dead code elimination in production builds
- **Source Map Control**: Optional source maps for development
- **On-demand Transpilation**: Dynamic imports only transpile when needed

## Error Handling

The package provides comprehensive error handling:
- Webpack compilation errors with detailed messages
- File system operation errors
- TypeScript compilation errors
- Runtime execution errors
- CLI command validation and help

## Requirements

- Node.js 14+ 
- TypeScript 5.0+
- Webpack 5+
- RWS Framework ecosystem

## License

ISC

## Contributing

This package is part of the RWS framework ecosystem. For contributions and issues, please refer to the main RWS framework repository.

## Repository

[https://github.com/rws-framework/tsc](https://github.com/rws-framework/tsc)
