"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeBuiltins = exports.webpackRelatedExternals = exports.webpackInceptionExternals = void 0;
const webpackRelatedExternals = [
    /^webpack$/,
    /^webpack\/.+$/,
    /^webpack-sources/,
    /^webpack-dev-server/,
    /^enhanced-resolve/,
    /^tapable/,
    /^watchpack/,
    /^loader-runner/,
    /^schema-utils/,
    /^@webpack-cli/,
    /^webpackbar/
];
exports.webpackRelatedExternals = webpackRelatedExternals;
// Node built-in modules that webpack might try to bundle
const nodeBuiltins = [
    'path',
    'fs',
    'crypto',
    'buffer',
    'util',
    'events',
    'stream',
    'string_decoder',
    'assert',
    'os'
];
exports.nodeBuiltins = nodeBuiltins;
const webpackInceptionExternals = ({ context, request }, callback) => {
    // Debug logging
    if (process.env.DEBUG) {
        console.log(`[Webpack Inception] Processing: ${request} from ${context}`);
    }
    // Check if it's a webpack-related package
    if (webpackRelatedExternals.some(pattern => pattern.test(request))) {
        return callback(null, `commonjs ${request}`);
    }
    // Node.js built-ins
    if (nodeBuiltins.includes(request)) {
        return callback(null, `commonjs ${request}`);
    }
    // If request starts with . or .. it's a local import
    if (request.startsWith('.') || request.startsWith('..')) {
        return callback();
    }
    // For node_modules
    if (request.includes('node_modules')) {
        return callback(null, `commonjs ${request}`);
    }
    // For all other cases, let webpack bundle them
    callback();
};
exports.webpackInceptionExternals = webpackInceptionExternals;
