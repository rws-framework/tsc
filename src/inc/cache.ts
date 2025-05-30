import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getParams } from './params';

export const getCachedPath = (key: string, rwsCliConfigDir: string): string => {
    return path.resolve(rwsCliConfigDir, key);
};

export function needsCacheWarming(rwsCliConfigDir: string): boolean {
    if (!fs.existsSync(getCachedPath('paths', rwsCliConfigDir)) || 
        !fs.existsSync(getCachedPath('checksum', rwsCliConfigDir))) {
        return true;
    }
    
    const fileList: string[] = fs.readFileSync(getCachedPath('paths', rwsCliConfigDir), 'utf-8').split('\n');    

    if (fileList.length) {
        const fileContents: string[] = [];
        for (const filePath of fileList) {
            if (fs.existsSync(filePath)) {
                fileContents.push(fs.readFileSync(filePath, 'utf-8'));
            }
        }
        const finalMD5: string = crypto.createHash('md5').update(fileContents.join('\n')).digest('hex');
        const cachedMD5: string = fs.readFileSync(getCachedPath('checksum', rwsCliConfigDir), 'utf-8');

        if (finalMD5 === cachedMD5) {            
            return false;
        }
    }        

    return true;
}
