const fs = require('fs');
const resultObj = [];

console.log('warn : all the images must be in png format'); // can be changed.
fs.readdir('./pics', {encoding: 'utf8'}, (err, files) => {
    if (err)
        throw err;
    console.log(files);
    for(filename of files)
        resultObj.push('data:image/png;base64,' + fs.readFileSync(`./pics/${filename}`).toString('base64'));
    fs.writeFileSync('./result.js', `function getMascottPics(){return ${JSON.stringify(resultObj)};}`, {encoding: 'utf8'});
    console.log('good');
})