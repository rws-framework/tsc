const path = require('path');
const { rwsPath } = require('@rws-framework/console');

const allowedOptions = {
    VERBOSE: 'verbose',
    RELOAD: 'reload'
}



function getParams(){
    const argv = [...process.argv].splice(2);
    const params = argv.filter(item => !item.startsWith('--'));
    const options = argv.filter(item => item.startsWith('--'));
    const hasAllowedOption = (option) => params.find(arg => arg === `--${option}`) !== null;

    const appRoot = rwsPath.findRootWorkspacePath();    
    const rwsCliConfigDir = path.resolve(appRoot, 'node_modules', '.rws', 'cli');    
    const tscExecDir = path.resolve(__dirname, '..');
    const isVerbose = hasAllowedOption(allowedOptions.VERBOSE);

    params.push(tscExecDir);

    let getParamString = () => params.length ? (' ' + params.join(' ')) + (options.length ? (' ' + options.join(' ')) : '') : '';

    return {
        appRoot,
        rwsCliConfigDir,
        tscExecDir,
        isVerbose,
        params,
        options,
        allowedOptions,
        getParamString,
        hasAllowedOption
    }
}



module.exports = { getParams }