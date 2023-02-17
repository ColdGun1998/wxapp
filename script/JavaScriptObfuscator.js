const path = require("path");
const fs = require('fs');
var JavaScriptObfuscator = require('javascript-obfuscator');



var data = fs.readFileSync(path.resolve(__filename, '..', '..', 'src', 'static', 'workers', 'worker.js'), {encoding:"utf-8"});
var data2 = fs.readFileSync(path.resolve(__filename, '..', '..', 'src', 'static', 'workers', 'fftUtil.js'), {encoding:"utf-8"});
var data3 = fs.readFileSync(path.resolve(__filename, '..', '..', 'fftUtilsPack',"test", 'chenliangminip', 'posminiapp', 'static', 'workers', 'worker.js'), {encoding:"utf-8"});


var obfuscationResult = JavaScriptObfuscator.obfuscate(data);
var fftobfuscationResult = JavaScriptObfuscator.obfuscate(data2);
var data3obfuscationResult = JavaScriptObfuscator.obfuscate(data3);

console.log(data3obfuscationResult.getObfuscatedCode())


fs.writeFileSync(path.resolve(__filename, '..', '..', "output", 'worker.js'), obfuscationResult.getObfuscatedCode(), {encoding:"utf-8"})
fs.writeFileSync(path.resolve(__filename, '..', '..', "output", 'fftUtil.js'), fftobfuscationResult.getObfuscatedCode(), {encoding:"utf-8"})
fs.writeFileSync(path.resolve(__filename, '..', '..', "output", "other", 'worker.js'), data3obfuscationResult.getObfuscatedCode(), {encoding:"utf-8"})
