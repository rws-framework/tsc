const path = require('path');
const { rwsPath } = require('@rws-framework/console');

function getParams(){
    const argv = [...process.argv].splice(2);
    const params = argv.filter(item => !item.startsWith('--'));
    const options = argv.filter(item => item.startsWith('--'));

    const appRoot = rwsPath.findRootWorkspacePath();    
    const rwsCliConfigDir = path.resolve(appRoot, 'node_modules', '.rws', 'cli');    
    const tscExecDir = path.resolve(__dirname, '..');
    const isVerbose = params.find(arg => arg.indexOf('--verbose') > -1) !== null;

    params.push(tscExecDir);

    let paramsString = () => params.length ? (' ' + params.join(' ')) + (options.length ? (' ' + options.join(' ')) : '') : '';

    return {
        appRoot,
        rwsCliConfigDir,
        tscExecDir,
        isVerbose,
        params,
        options,
        paramsString
    }
}



module.exports = { getParams }