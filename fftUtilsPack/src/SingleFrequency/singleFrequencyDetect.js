const purefft = require('../fft.js');
class singleFrequencyDetect {
    freqStart = 19e3;
    freqEnd = 21.5e3;
    sampleRate = 48e3; //采样速率
    f1 = 19.4e3;
    f2 = 19.7e3;
    f3 = 20e3;
    f4 = 20.3e3;
    f5 = 20.6e3;
    fCom = [this.f1, this.f2, this.f3, this.f4, this.f5];

    frameLength = 8192 * 8;  // 65536 个点算幅值最大的频率

    dataQueue = [];


    detectSingleFrequence(signal, start = 19100, end = 20900) {
        let resIndex = [];
        if (signal == null || signal.length == 0) {
            console.log(`信号为空`);
            return [];
        }
        Array.prototype.push.apply(this.dataQueue, signal);
        let segNum = Math.floor(this.dataQueue.length / this.frameLength);
        if (segNum == 0) {
            console.log("单频检测不够一帧的长度,直接返回");
            return [];
        }
        let normalArray = this.dataQueue.slice(0, segNum * this.frameLength)
        this.dataQueue = this.dataQueue.slice(segNum * this.frameLength)
        for (let i = 0; i < segNum; i++) {
            let data0 = normalArray.slice(i * this.frameLength, (i + 1) * this.frameLength);
            // 快速傅里叶变换
            let data0img = new Array(data0.length).fill(0);
            let dataObj = {
                real: data0,
                imag: data0img,
            }
            let data0fft = purefft.fft(dataObj);
            let data0fftabs = data0fft.real.map((item) => {
                return Math.abs(item);
            })

            let indexStart = start * this.frameLength / this.sampleRate;
            let indexEnd = end * this.frameLength / this.sampleRate;
            let maxAndIndex = this.getMaxAndIndexWithRange(data0fftabs, Math.floor(indexStart), Math.floor(indexEnd));
            console.log("maxAndIndex", maxAndIndex);
            // 将横坐标转化，显示为频率f= n*(fs/N)
            let frenquency = maxAndIndex.index * this.sampleRate / this.frameLength;
            console.log("frenquency", frenquency);
            if (frenquency < this.freqStart - 2000 || frenquency > this.freqEnd + 2000) {
                resIndex.push(null)
            } else {
                let min = 1000000;
                let minIndex = -1;
                this.fCom.forEach((item, index) => {
                    if (Math.abs(frenquency - item) < min) {
                        minIndex = index;
                        min = Math.abs(frenquency - item)
                    }
                })
                resIndex.push({ freq: frenquency, index: minIndex });
            }
        }
        return resIndex;

    }


    getMaxAndIndex(a) {
        if (!a || a.length == 0) {
            return {
                index: -1,
                max: -1
            }
        }
        let indexOfMax = 0;
        let tempMax = a[0];
        for (let i = 0; i < a.length; i++) {
            if (a[i] > tempMax) {
                tempMax = a[i];
                indexOfMax = i;
            }
        }

        return {
            "index": indexOfMax,
            "max": tempMax
        }
    }


    getMaxAndIndexWithRange(a, start, end) {

        if (!a || a.length == 0) {
            return {
                index: -1,
                max: -1
            }
        }
        let indexOfMax = start;
        let tempMax = a[start];
        for (let i = start; i < end; i++) {
            if (a[i] > tempMax) {
                tempMax = a[i];
                indexOfMax = i;
            }
        }

        return {
            "index": indexOfMax,
            "max": tempMax
        }
    }

    clear() {
        this.dataQueue = [];
    }

    // %% signal ID identification
    //     clear;clc;close all;
    //     freqStart = 19e3; freqEnd = 21.5e3;
    //     f1 = 19.4e3;f2 = 19.7e3; f3 = 20e3; f4 = 20.3e3; f5 = 20.6e3;
    //     fCom = [f1 f2 f3 f4 f5];
    //     fs = 48e3; %采样速率
    //
    //     signal = audioread("Recording #34.wav");
    //
    //     segNum = length(signal)/8192;
    //     frequencyDetection = ones(1,5);
    //     for i = 1:1:segNum
    //     data0 = signal((i-1)*8192+1:i*8192);
    //     y0 = abs(fft(data0)); %快速傅里叶变换的幅值
    //
    //
    // %将横坐标转化，显示为频率f= n*(fs/N)
    //     f = (0:length(y0)-1)*fs/length(y0);
    //     [a,b0] = max(y0);
    //
    //     frequency1 = f(b0);
    //     if(frequency1<freqEnd&&frequency1>freqStart)
    //     frequencyDetection(i) = frequency1;
    //     else
    //     frequencyDetection(i) = 0;
    //     end
    //     end
    //     frequencyFinal = mean(frequencyDetection(frequencyDetection~=0));
    //     [a b] = min(abs(frequencyFinal*ones(1,5)-fCom));
    //     fCom(b)
    //
    //
    // %% conduct positioning in 1-d condition
    // % totalLength: length of BS;
    // % timeInterval: real interval of BS;
    // % c :sound speed
    //     totalLength1 = 18.2;
    //     totalLength2 = 14.4;
    //     realValue = 16;
    //
    //     timeInterval = 0.15;
    //     c = 340;
    // %% 17-19kHz
    //     signal = audioread("Recording #31.wav");signal = signal(:,1);
    // % TOA estimation
    //     originArriveTime = toaEstimationNew(filterChirp(signal,17e3,19e3,0),2048,17e3,19e3,1,1.5);
    //     timeStamp = originArriveTime(2,:);
    //     count = 1;
    //     arriveTime = ones(1,5);
    //     for i = 2:length(timeStamp)
    //     if(timeStamp(i)~=0)
    //     if(timeStamp(i)~=timeStamp(i-1))&&(timeStamp(i)==timeStamp(i+1))
    //     arriveTime(count) = timeStamp(i)*4096+originArriveTime(1,i);
    //     count = count + 1;
    //     end
    //     end
    //     end
    //     arriveTime1719 = arriveTime/48000;
    // %% 21-23kHz
    //     originArriveTime = toaEstimationNew(filterChirp(signal,21e3,23e3,0),2048,21e3,23e3,1,3);
    //     timeStamp = originArriveTime(2,:);
    //     count = 1;
    //     arriveTime = ones(1,5);
    //     for i = 2:length(timeStamp)
    //     if(timeStamp(i)~=0)
    //     if(timeStamp(i)~=timeStamp(i-1))&&(timeStamp(i)==timeStamp(i+1))
    //     arriveTime(count) = timeStamp(i)*4096+originArriveTime(1,i);
    //     count = count + 1;
    //     end
    //     end
    //     end
    //     arriveTime2123 = arriveTime/48000;


}

export default new singleFrequencyDetect();
