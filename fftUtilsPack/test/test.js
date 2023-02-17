const fftUtilClass = require('../dist/fftUtil');
const path = require('path');
const fs = require('fs');

fftUtil = new fftUtilClass();
// 生成基准信号
const signalRef = fftUtil.generateSignalRef();
// fs.writeFileSync("signalRef.csv", signalRef, "utf8");

var data = fs.readFileSync(path.resolve(__dirname, './data.wav'));

let tdoainfos = fftUtil.getTDOAInfoWithList(data.buffer.slice(44, 300000));
// let tdoainfos2 = fftUtil.getTDOAInfoWithList(data.buffer.slice(300000, 600000));
console.log("tdoainfos:", tdoainfos);
// console.log(fftUtil.getDistance(fftUtil.getTimeDelta(tdoainfos)))
// console.log(fftUtil.getDistance(fftUtil.getTimeDelta(tdoainfos2)))
// fftUtil.getTDOAInfo(data.buffer.slice(600000, 900000));
// fftUtil.getTDOAInfo(data.buffer.slice(900000, 1200000));
// fftUtil.getTDOAInfo(data.buffer.slice(1200000, 1500000));
// fftUtil.getTDOAInfo(data.buffer.slice(1500000, 1800000));
// fftUtil.getTDOAInfo(data.buffer.slice(2100000, 2400000));

console.log('结束');