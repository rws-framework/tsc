const path = require('path');
const { rwsPath } = require('@rws-framework/console');

function getParams(){
    const params = [...process.argv.splice(2)];
    
    const appRoot = rwsPath.findRootWorkspacePath();    
    const rwsCliConfigDir = path.resolve(appRoot, 'node_modules', '.rws', 'cli');    
    const tscExecDir = path.resolve(__dirname, '..');
    const isVerbose = params.find(arg => arg.indexOf('--verbose') > -1) !== null;

    let paramsString = () => params.length ? (' ' + params.join(' ')) : '';

    return {
        appRoot,
        rwsCliConfigDir,
        tscExecDir,
        isVerbose,
        params,
        paramsString
    }
}



module.exports = { getParams }