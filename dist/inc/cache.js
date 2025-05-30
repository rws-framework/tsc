"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedPath = void 0;
exports.needsCacheWarming = needsCacheWarming;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getCachedPath = (key, rwsCliConfigDir) => {
    return path_1.default.resolve(rwsCliConfigDir, key);
};
exports.getCachedPath = getCachedPath;
function needsCacheWarming(rwsCliConfigDir) {
    if (!fs_1.default.existsSync((0, exports.getCachedPath)('paths', rwsCliConfigDir)) ||
        !fs_1.default.existsSync((0, exports.getCachedPath)('checksum', rwsCliConfigDir))) {
        return true;
    }
    const fileList = fs_1.default.readFileSync((0, exports.getCachedPath)('paths', rwsCliConfigDir), 'utf-8').split('\n');
    if (fileList.length) {
        const fileContents = [];
        for (const filePath of fileList) {
            if (fs_1.default.existsSync(filePath)) {
                fileContents.push(fs_1.default.readFileSync(filePath, 'utf-8'));
            }
        }
        const finalMD5 = crypto_1.default.createHash('md5').update(fileContents.join('\n')).digest('hex');
        const cachedMD5 = fs_1.default.readFileSync((0, exports.getCachedPath)('checksum', rwsCliConfigDir), 'utf-8');
        if (finalMD5 === cachedMD5) {
            return false;
        }
    }
    return true;
}
