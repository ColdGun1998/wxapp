const fftUtilClass = require('../../dist/fftUtil');
const path = require('path');
const fs = require('fs');

fftUtil = new fftUtilClass();
// 生成基准信号
const signalRef = fftUtil.generateSignalRef()

var data = fs.readFileSync(path.resolve(__dirname, './Recording #31.wav'));

// let index1 = fftUtil.detectSingleFrequency(data.buffer.slice(0, 300000));
// // let index1 = fftUtil.detectSingleFrequency(data.buffer.slice());


// console.log(index1)


console.log('结束');