const purefft = require('./fft.js');
import {
    SIGNAL_LENGTH
} from './constant';
import singleFrequencyDetect from "./SingleFrequency/singleFrequencyDetect";
import ChebyshevI from "./Filter/ChebyshevI"
import pdr from "./pdr.js"
import fuse from "./fuse.js";

let timeStamps1 = [];
let startTime = null;
let lastInfo2 = [];


let timeQueueList = [
    [],
    [],
    [],
    [],
    [],
    [],
    []
];

let timeQueueList_cangku = [
    [],[],[],[],[]
]
class FFTUtils_Racetrack {

    // 算法参数
    SAMPLE_RATE_INHZ = 48000;
    vMaxTh = 0; //判断是否有声音信号到达的阈值，增大会减小误报的概率，同时提升漏报的概率，默认值100
    vRatioTh = 0.3; //判断实际到达点的值与最大值的比值，多径效应越明显则该值应取的越大，默认值0.3，一般不修改
    pMaxTh = 2000; //在最高峰前搜索实际到达点的长度，默认值2000，应小于2048
    maxRatioTh = 0; //25
    totalLength = 9.85; // 两基站之间的距离
    timeIntervals = [0.150]; // 单位秒
    soundSpeed = 340; // 声速
    frequencyStart = 17000;
    frequencyEnd = 19000;
    durationTime = 0.03;
    timeInterval = 0.15;



    // 非算法参数
    signalMax = -100;
    allTdoaInfos = [];
    preSoundInputBean = null;
    dataQueue = [];
    lastFrame = null;
    frameSequence = 0;
    signalRef = null;
    singalRefFFt = null;
    lngStart = 120.000600;
    lngEnd = 120.000700;
    latStart = 30.000600;
    latEnd = 30.000700;
    timeInterval = 0.150;
    height = 5;

    // 记录日志用
    clusterId = null;

    constructor(clusterId) {
        this.clusterId = clusterId;
    }
    clear() {
        this.preSoundInputBean = null;
        this.signalMax = -100;
        this.dataQueue = [];
        this.lastFrame = null;
        this.frameSequence = 0;
        this.signalRef = null;
        this.allTdoaInfos = [];
        timeStamps1 = [];
        startTime = null;
        lastInfo2 = [];

        singleFrequencyDetect.clear();
        timeQueueList = [
            [],
            [],
            [],
            [],
            []
        ];
    }


    // 生成基准信号
    generateSignalRef(frequencyStart = 17000, frequencyEnd = 19000, durationTime = 2048 / 48000, sampleRate = 48000) {
        let rate = (frequencyEnd - frequencyStart) / durationTime / 2;
        let signalRef = [];
        let T = 1 / sampleRate;
        // 采样时间=采样点/采样频率 采样点为2048 采样率为48kHz 通过采样时间来计算这段采样时间下的采样点
        for (let i = 0; i < durationTime * sampleRate && i < SIGNAL_LENGTH / 2; i++)
            signalRef.push(Math.cos(2 * Math.PI * (frequencyStart + rate * T * i) * T * i));
        let leftLength = SIGNAL_LENGTH - signalRef.length;
        for (let j = 0; j < leftLength; j++) {
            signalRef.push(0);
        }
        this.signalRef = signalRef;
        return signalRef;
    }

    // 字节数组转成小端int16普通数组
    getInt16FromArray(ArrayBuffer) {
        // console.log('ArrayBuffer是', ArrayBuffer);
        let dv = new DataView(ArrayBuffer);

        // console.log('DataView是', dv);
        // console.log('ArrayBuffer.byteLength', ArrayBuffer.byteLength);
        let res = [];
        // 双声道数据取平均归一化处理， 4字节一组
        let l = Math.floor(ArrayBuffer.byteLength / 4);
        for (let i = 0; i < l; i = i++) {
            let leftSound = dv.getInt16(i * 4, true)
            let rightSound = dv.getInt16(i * 4 + 2, true)
            let sample = Math.floor((leftSound + rightSound) / 2);
            res.push(sample);
        }
        // console.log('字节数组转换111', res);
        return res;
    }

    // 字节数组转成普通数组
    getDoubleFromArray(ArrayBuffer) {
        // console.log('ArrayBuffer是', ArrayBuffer);
        let dv = new DataView(ArrayBuffer);

        // console.log('DataView是', dv);
        // console.log('ArrayBuffer.byteLength', ArrayBuffer.byteLength);
        let res = [];
        // 双声道数据取平均归一化处理， 4字节一组
        let l = Math.floor(ArrayBuffer.byteLength / 4);
        for (let i = 0; i < l; i++) {
            let leftSound = dv.getInt16(i * 4, true)
            let rightSound = dv.getInt16(i * 4 + 2, true)
            let sample = (leftSound + rightSound) / 2 / 32768 // 归一化
            res.push(sample);
        }
        // console.log('字节数组转换111', res.slice(2900, 3000));
        return res;
    }

    // buffer数组转成普通数组
    getSingleLeftFromArray(ArrayBuffer) {
        // console.log('ArrayBuffer是', ArrayBuffer);
        let dv = new DataView(ArrayBuffer);

        // console.log('DataView是', dv);
        // console.log('ArrayBuffer.byteLength', ArrayBuffer.byteLength);
        let res = [];
        // 双声道数据取平均归一化处理， 4字节一组
        let l = Math.floor(ArrayBuffer.byteLength / 4);
        for (let i = 0; i < l; i++) {
            let leftSound = dv.getInt16(i * 4, true)
            let sample = leftSound / 32768 // 归一化
            res.push(sample);
        }
        // console.log('字节数组转换111', res.slice(2900, 3000));
        return res;
    }

    static getSingleLeftFromArrayStatic(ArrayBuffer) {
        // console.log('ArrayBuffer是', ArrayBuffer);
        let dv = new DataView(ArrayBuffer);

        // console.log('DataView是', dv);
        // console.log('ArrayBuffer.byteLength', ArrayBuffer.byteLength);
        let res = [];
        // 双声道数据取平均归一化处理， 4字节一组
        let l = Math.floor(ArrayBuffer.byteLength / 4);
        for (let i = 0; i < l; i++) {
            let leftSound = dv.getInt16(i * 4, true)
            let sample = leftSound / 32768 // 归一化
            res.push(sample);
        }
        // console.log('字节数组转换111', res.slice(2900, 3000));
        return res;
    }

    // buffer数组转成普通数组， ArrayBuffer是单声道的数据
    getSingleFromArray(ArrayBuffer) {
        // console.log('ArrayBuffer是', ArrayBuffer);
        let dv = new DataView(ArrayBuffer);

        // console.log('DataView是', dv);
        // console.log('ArrayBuffer.byteLength', ArrayBuffer.byteLength);
        let res = [];
        // 双声道数据取平均归一化处理， 4字节一组
        let l = Math.floor(ArrayBuffer.byteLength / 2);
        for (let i = 0; i < l; i++) {
            let leftSound = dv.getInt16(i * 2, true)
            let sample = leftSound / 32768 // 归一化
            res.push(sample);
        }
        // console.log('字节数组转换111', res.slice(2900, 3000));
        return res;
    }


    // 普通字节数组转
    static getSingleLeftFromList(inputData) {
        // console.log('ArrayBuffer是', ArrayBuffer);
        let ArrayBuffer = new Int8Array(inputData).buffer;
        let dv = new DataView(ArrayBuffer);

        // console.log('DataView是', dv);
        // console.log('ArrayBuffer.byteLength', ArrayBuffer.byteLength);
        let res = [];
        // 双声道数据取平均归一化处理， 4字节一组
        let l = Math.floor(ArrayBuffer.byteLength / 4);
        for (let i = 0; i < l; i++) {
            let leftSound = dv.getInt16(i * 4, true)
            let sample = leftSound / 32768 // 归一化
            res.push(sample);
        }
        // console.log('字节数组转换111', res.slice(2900, 3000));
        return res;
    }

    // 普通字节数组
    static getSingleFromList(inputData) {
        // console.log('ArrayBuffer是', ArrayBuffer);
        let ArrayBuffer = new Int8Array(inputData).buffer;
        let dv = new DataView(ArrayBuffer);

        // console.log('DataView是', dv);
        // console.log('ArrayBuffer.byteLength', ArrayBuffer.byteLength);
        let res = [];
        // 双声道数据取平均归一化处理， 4字节一组
        let l = Math.floor(ArrayBuffer.byteLength / 2);
        for (let i = 0; i < l; i++) {
            let leftSound = dv.getInt16(i * 2, true)
            let sample = leftSound / 32768 // 归一化
            res.push(sample);
        }
        // console.log('字节数组转换111', res.slice(2900, 3000));
        return res;
    }

    // 生成vTemp， 新旧各一半拼接
    getvTemp(oldArray, newArray) {
        let res = [];
        // 旧数据的一半 + 新数据的一半拼接起来到temp
        res.push(...oldArray.slice(SIGNAL_LENGTH / 2, SIGNAL_LENGTH));
        res.push(...newArray.slice(0, SIGNAL_LENGTH / 2));
        // console.log('旧数据的一半 + 新数据的一半拼接起来到temp', res);
        return res;
    }

    // 填充数据到2的n次4096个点
    fillDataWithZero(sig) {
        if (sig.length >= 4096) {
            return sig;
        }
        let a = sig.slice(0);
        let leftLength = 4096 - a.length;
        for (let j = 0; j < leftLength; j++) {
            a.push(0);
        }
        return a;
    }


    // 求相互结果
    calculateConvolve(sig1, sig2) {
        let s2fft = null;
        if (sig2 == this.signalRef) {
            s2fft = this.singalRefFFt;
        } else {
            s2fft = purefft.fft(this.fillDataWithZero(sig2));
        }
        let s1fft = purefft.fft(this.fillDataWithZero(sig1));

        // fs.writeFileSync("s2fft.csv", s2fft, "utf8");
        // fs.writeFileSync("s1fft.csv", s1fft, "utf8");
        let s3 = {
            'real': [],
            'imag': [],
        }
        s1fft.real.map((item, i) => {
            // 共轭复数
            let tempi = -s2fft.imag[i];
            s3.real.push((item * s2fft.real[i] - s1fft.imag[i] * tempi));
            s3.imag.push((item * tempi + s2fft.real[i] * s1fft.imag[i]));
        })
        let s3InvFFT = purefft.ifft(s3);
        let res = s3InvFFT.real.map((item) => {
            return Math.abs(item);
        })
        return res;
    }


    // 求虚数的绝对值
    abs(real, imaginary) {
        if (Math.abs(real) < Math.abs(imaginary)) {
            if (imaginary < 0.0000001) {
                return Math.abs(real);
            }
            let q = real / imaginary;
            return Math.abs(imaginary) * Math.sqrt(1 + q * q);
        } else {
            if (real < 0.000001) {
                return Math.abs(imaginary);
            }
            let q = imaginary / real;
            return Math.abs(real) * Math.sqrt(1 + q * q);
        }
    }

    getMaxAndIndex(a) {
        if (!a || a.length == 0) {
            return {
                "index": -1,
                "max": -1
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

    handleInputBean(currentSoundInputBean) {
        let res = -1;
        res = this.getTDOA(this.preSoundInputBean, currentSoundInputBean);
        this.preSoundInputBean = currentSoundInputBean;
        return res;
    }

    // 计算tdoa
    getTDOA(preSoundInputBean, currentSoundInputBean) {
        if (preSoundInputBean == null) {
            // console.log("preSoundInputBean = null, currentSoundInputBean: " + currentSoundInputBean.sequenceId);
            this.signalMax = Math.max(this.signalMax, currentSoundInputBean.signalMax);
            return -1;
        }
        this.signalMax = Math.max(preSoundInputBean.signalMax, currentSoundInputBean.signalMax); //double
        let C2_a = currentSoundInputBean.corrHalfArray; // double[]
        let CTemp1_a = currentSoundInputBean.prevCorrHalfArray; //double[]
        let C1_a = preSoundInputBean.corrHalfArray; //double[]
        let Ctemp0_a = preSoundInputBean.prevCorrHalfArray; //double[]

        let bufferQueue = []; // list<double>
        let vMaxQueue = []; //ArrayList<>();
        let pMaxQueue = []; //ArrayList<>();
        bufferQueue.push(Ctemp0_a);
        bufferQueue.push(C1_a);
        bufferQueue.push(CTemp1_a);
        bufferQueue.push(C2_a);

        // 最大值
        vMaxQueue.push(preSoundInputBean.prevCorrHalfArrayMax);
        vMaxQueue.push(preSoundInputBean.corrHalfArrayMax);
        vMaxQueue.push(currentSoundInputBean.prevCorrHalfArrayMax);
        vMaxQueue.push(currentSoundInputBean.corrHalfArrayMax);

        // 最大值下标
        pMaxQueue.push(preSoundInputBean.prevCorrHalfArrayMaxIndex);
        pMaxQueue.push(preSoundInputBean.corrHalfArrayMaxIndex);
        pMaxQueue.push(currentSoundInputBean.prevCorrHalfArrayMaxIndex);
        pMaxQueue.push(currentSoundInputBean.corrHalfArrayMaxIndex);

        for (let i = 2; i > 0; i--) {
            let bufferTemp = bufferQueue[i];
            let bufferTempPrev = bufferQueue[i - 1];
            if (bufferTempPrev == null || bufferTempPrev.length == 0 || pMaxQueue[i - 1] == -1) {
                // console.log("bufferTempPrev为空");
                // console.log("preSoundInputBean", JSON.stringify(preSoundInputBean));
                return -1;
            };
            let vMax = vMaxQueue[i];
            let pMax = pMaxQueue[i];
            if (vMax > this.vMaxTh && (vMax / this.signalMax) > this.maxRatioTh && vMax > vMaxQueue[i + 1] &&
                vMax > vMaxQueue[i - 1]) {
                for (let j = this.pMaxTh; j >= 0; j--) {
                    let vNow = pMax - j < 0 ? bufferTempPrev[SIGNAL_LENGTH / 2 + pMax - j] : bufferTemp[pMax - j];
                    let vPrev = pMax - j - 1 < 0 ? bufferTempPrev[SIGNAL_LENGTH / 2 + pMax - j - 1] : bufferTemp[pMax - j - 1];
                    let vNext = pMax - j + 1 < 0 ? bufferTempPrev[SIGNAL_LENGTH / 2 + pMax - j + 1] : bufferTemp[pMax - j + 1];

                    if (vNow > vMax * this.vRatioTh && vNow > vPrev && vNow > vNext) {
                        let TOA = pMax - j - SIGNAL_LENGTH / 2 * (2 - i);
                        if (process.env.NODE_ENV == "Development") {
                            console.log("TOA= " + TOA);
                            console.log("stampNumber= " + currentSoundInputBean.sequenceId);
                            console.log("vMax: " + vMax);
                            console.log("signalMax: " + this.signalMax);
                            console.log("vMax/signalMax: " + vMax / this.signalMax);
                        }
                        // console.log("vMax: " + vMax,"signalMax: " + this.signalMax, "vMax/signalMax: " + vMax/this.signalMax);
                        try {
                            return (TOA + currentSoundInputBean.sequenceId * SIGNAL_LENGTH) / this.SAMPLE_RATE_INHZ;
                        } catch (e) {
                            console.log(e)
                            return -1;
                        }
                    }
                }
            }
        }
        return 0;
    }


    // 获取tdoa信息,
    getTDOAInfoWithList(inputList) {
        if (!inputList || inputList.length == 0) {
            console.log("inputList为空");
        }
        let tdoaInfos = [];
        // if(settings) {
        //     // todo 设置配置
        // };
        if (!startTime) {
            startTime = new Date().getTime() - 200;
        }
        Array.prototype.push.apply(this.dataQueue, inputList);
        let count = Math.floor(this.dataQueue.length / SIGNAL_LENGTH);
        // 4096 * count 长度的数组
        let normalArray = this.dataQueue.slice(0, count * SIGNAL_LENGTH);
        this.dataQueue = this.dataQueue.slice(count * SIGNAL_LENGTH);
        let lastArrayTemp = this.lastFrame;
        // console.log('this.dataQueue', this.dataQueue);
        if (this.signalRef == null) {
            this.signalRef = this.generateSignalRef(this.frequencyStart, this.frequencyEnd, this.durationTime, this.SAMPLE_RATE_INHZ);
            this.singalRefFFt = purefft.fft(this.fillDataWithZero(this.signalRef ));
            console.log('no signalref, generate', this.frequencyStart, this.frequencyEnd, this.durationTime, this.SAMPLE_RATE_INHZ);
        }
        if (count == 0) {
            // console.log("getTDOAInfoWithList不够一帧的长度, 直接返回");
            return [];
        }

        //
        for (let i = 0; i < count; i++) {
            let signalFrameArray = normalArray.slice(SIGNAL_LENGTH * i, SIGNAL_LENGTH * (i + 1))
            let prevCorrHalfArray = [];
            let corrHalfArray = [];
            // 求CTemp1_a 和 C2_a
            // console.log('lastArrayTemp', lastArrayTemp);
            let prevCorrArray = [];
            if (lastArrayTemp != null && lastArrayTemp.length > 0) {
                let vTemp = this.getvTemp(lastArrayTemp, signalFrameArray);
                prevCorrArray = this.calculateConvolve(vTemp, this.signalRef);
                // console.log('prevCorrArray', prevCorrArray);
                prevCorrHalfArray = prevCorrArray.slice(0, prevCorrArray.length / 2);
            }
            let corrArray = this.calculateConvolve(signalFrameArray, this.signalRef);
            // console.log('corrArray', corrArray);
            corrHalfArray = corrArray.slice(0, corrArray.length / 2);

            let prevMaxAndIndex = this.getMaxAndIndex(prevCorrHalfArray);
            let maxAndIndex = this.getMaxAndIndex(corrHalfArray);
            let originalMaxAndIndex = this.getMaxAndIndex(signalFrameArray);


            let tdoa = this.handleInputBean({
                'version': '1',
                'sequenceId': this.frameSequence,
                'timeStamp': '' + new Date().getTime(),
                'signalFrameArray': signalFrameArray,
                'prevCorrHalfArray': prevCorrHalfArray,
                'corrHalfArray': corrHalfArray,
                'signalMax': originalMaxAndIndex == null ? null : originalMaxAndIndex.max,
                'prevCorrHalfArrayMax': prevMaxAndIndex == null ? null : prevMaxAndIndex.max,
                'prevCorrHalfArrayMaxIndex': prevMaxAndIndex == null ? null : prevMaxAndIndex.index,
                'corrHalfArrayMax': maxAndIndex == null ? null : maxAndIndex.max,
                'corrHalfArrayMaxIndex': maxAndIndex == null ? null : maxAndIndex.index
            })
            if (tdoa > 0) {
                // console.log(this.clusterId, ' 获得到的tdoa ', tdoa);
            }
            tdoaInfos.push({
                'sequenceId': this.frameSequence, // 音频分片序列号
                'timeStamp': '' + new Date().getTime(), // 时间戳
                'beaconId': '', // 基站编号
                'scenceId': '', // 场景id
                'tdoa': tdoa, // 计算出来的TDOA值
            });

            this.frameSequence++;
            lastArrayTemp = signalFrameArray;
        }
        this.lastFrame = lastArrayTemp;
        // console.log(JSON.stringify(tdoaInfos));
        return tdoaInfos;
    }


    // 获取时间间隔 小于500ms的
    getTimeDelta(tdoaInfos) {
        if (tdoaInfos == null) {
            console.log("getTimeDelta tdoaInfos为空,  直接返回");
            return;
        }

        let timeDelta = [];
        // 剔除时间间隔大
        let newTdoaInfos = tdoaInfos.filter((x) => x.tdoa > 0);
        newTdoaInfos.forEach((tdoaInfo) => {
            this.allTdoaInfos.push(tdoaInfo)
        })

        if (this.allTdoaInfos.length < 2) {
            console.log("this.allTdoaInfos 长度小于2， 直接返回");
            return;
        }
        // console.log(" this.allTdoaInfos", this.allTdoaInfos);
        for (let i = 1; i < this.allTdoaInfos.length; i++) {
            // console.log(" this.allTdoaInfos[i].tdoa", this.allTdoaInfos[i].tdoa)
            if (this.allTdoaInfos[i].tdoa - this.allTdoaInfos[i - 1].tdoa <= this.timeInterval + 0.1 && this.allTdoaInfos[i].tdoa - this.allTdoaInfos[i - 1].tdoa >= 0.05) {
                timeDelta.push(this.allTdoaInfos[i].tdoa - this.allTdoaInfos[i - 1].tdoa);
                this.allTdoaInfos.splice(i - 1, 2);
                i = i - 1;
            }
        }
        return timeDelta;
    }

    // 计算距离 一维二基站
    getDistance(timeDeltas) {
        let distances = [];
        if (!timeDeltas) {
            console.log("没有timeDelta");
            return distances;
        }


        timeDeltas.forEach((timeDelta) => {
            console.log("timeDelta", timeDelta)
            distances.push((this.totalLength + this.soundSpeed * (this.timeInterval - timeDelta)) / 2);
        })
        return distances;
    }

    // 三基站计算距离
    //  0  ----   1 -----    2
    //  17-18.5  18.5-20     17-18.5   Khz
    //   0        150       300        ms
    static calculateDistanceThreeBeaconOrigin(tdoaInfo1, tdoaInfo2, interval1 = 0.145, interval2 = 0.145, totalLength1 = 8, totalLength2 = 8) {

        let distances1 = [];
        let distances2 = [];
        // 低频信号到达时间
        tdoaInfo1.forEach(x => {
            if (x.tdoa && x.tdoa > 0) {
                timeStamps1.push(x.tdoa);
            }
        });

        // 高频信号到达时间
        tdoaInfo2.forEach(x => {
            if (x.tdoa && x.tdoa > 0) {
                timeStamps1.forEach(t1 => {
                    // 低频信号中有满足条件的就计算距离
                    if (t1 < x.tdoa && x.tdoa - t1 < 0.350) {
                        console.log("第一组基站间隔", x.tdoa, t1, x.tdoa - t1);
                        let distance = totalLength1 + 340 * (interval1 - (x.tdoa - t1)) / 2
                        console.log("第一组基站测距", 0 + distance);
                        distances1.push(distance)
                    }
                    if (t1 > x.tdoa && t1 - x.tdoa < 0.350) {
                        console.log("第二组基站间隔", t1, x.tdoa, t1 - x.tdoa);
                        let distance2 = totalLength2 + 340 * (interval2 - (t1 - x.tdoa)) / 2;
                        console.log("时间${startTime + x.tdoa * 1000}, 第二组基站测距 ${8 + distance2}");
                        distances2.push(distance2);
                    }
                })
            }
        });
        // 高频信号到达时间
        if (lastInfo2) {
            lastInfo2.forEach(x => {
                if (x.tdoa && x.tdoa > 0) {
                    timeStamps1.forEach(t1 => {
                        if (t1 > x.tdoa && t1 - x.tdoa < 0.350) {
                            console.log("第二组基站间隔", t1, x.tdoa, t1 - x.tdoa);
                            let distance2 = totalLength2 + 340 * (interval2 - (t1 - x.tdoa)) / 2;
                            console.log("时间${startTime + x.tdoa * 1000}, 第二组基站测距 ${8 + distance2}");
                            distances2.push(distance2);
                            // this.postLocationResult(0 + distance2, 0 + distance2, this.startTime + x.tdoa * 1000 + 1);
                        }
                    })
                }
            });
        }
        lastInfo2.push.apply(lastInfo2, tdoaInfo2.filter(x => x.tdoa && x.tdoa > 0));
        if (lastInfo2.length >= 2) {
            lastInfo2.splice(0, lastInfo2.length - 1);
        }
        if (timeStamps1.length > 100) {
            timeStamps1.splice(0, timeStamps1.length / 2);
        }
        return {
            distances1,
            distances2
        }
    }


    static calculateDistanceThreeBeacon(tdoaInfo1, tdoaInfo2, settings1, settings2, type = 0) {

        let interval1 = settings1.timeInterval;
        let interval2 = settings2.timeInterval;
        let totalLength1 = settings1.totalLength;
        let totalLength2 = settings2.totalLength;



        let distances1 = [];
        let distances2 = [];
        // 低频信号到达时间
        tdoaInfo1.forEach(x => {
            if (x.tdoa && x.tdoa > 0) {
                timeStamps1.push(x.tdoa);
            }
        });

        // 高频信号到达时间
        tdoaInfo2.forEach(x => {
            if (x.tdoa && x.tdoa > 0) {
                timeStamps1.forEach(t1 => {
                    // 低频信号中有满足条件的就计算距离
                    if (t1 < x.tdoa && x.tdoa - t1 < 0.280) {
                        console.log("第一组基站间隔", x.tdoa, t1, x.tdoa - t1);
                        let distance = null;
                        if (type == 0) {
                            distance = (totalLength1 + 340 * (interval1 - (x.tdoa - t1))) / 2
                        } else if (type == 1) {
                            // console.log("第一组基站间隔", x.tdoa, t1, x.tdoa - t1);
                            distance = FFTUtils_Racetrack.getDistanceWithHeight(
                                x.tdoa - t1, settings1.height ? settings1.height : 5, totalLength1 ? totalLength1 : 15, interval1, 0.1
                            )
                        }
                        // console.log("第一组基站测距", distance);
                        distances1.push(distance)
                    }
                    if (0.04 < t1 - x.tdoa && t1 - x.tdoa < 0.280) {
                        console.log("第二组基站间隔", t1, x.tdoa, t1 - x.tdoa);
                        let distance2 = null
                        if (type == 0) {
                            distance2 = (totalLength2 + 340 * (interval2 - (t1 - x.tdoa))) / 2;
                        } else if (type == 1) {
                            distance2 = FFTUtils_Racetrack.getDistanceWithHeight(
                                t1 - x.tdoa, settings2.height ? settings2.height : 5, totalLength2 ? totalLength2 : 15, interval2, 0.1
                            )
                        }
                        // console.log("时间${startTime + x.tdoa * 1000}, 第二组基站测距 ${totalLength2 + distance2}");
                        distances2.push(distance2);
                    }
                })
            }
        });
        // 高频信号到达时间
        let flag = false;
        if (lastInfo2) {
            lastInfo2.forEach(x => {
                if (x.tdoa && x.tdoa > 0) {
                    timeStamps1.forEach(t1 => {
                        if (t1 - x.tdoa > 0.280 || 0.040 > t1 - x.tdoa) {
                            flag = true;
                        }
                        if (0.040 < t1 - x.tdoa && t1 - x.tdoa < 0.280) {
                            flag = true;
                            console.log("第二组基站间隔", t1, x.tdoa, t1 - x.tdoa);
                            let distance2 = null
                            if (type == 0) {
                                distance2 = (totalLength2 + 340 * (interval2 - (t1 - x.tdoa))) / 2;
                            } else if (type == 1) {
                                distance2 = FFTUtils_Racetrack.getDistanceWithHeight(
                                    t1 - x.tdoa, settings2.height ? settings2.height : 5, totalLength2 ? totalLength2 : 15, interval2, 0.1
                                )
                            }
                            // console.log("时间${startTime + x.tdoa * 1000}, 第二组基站测距 ${totalLength2 + distance2}");
                            distances2.push(distance2);
                            // this.postLocationResult(0 + distance2, 0 + distance2, this.startTime + x.tdoa * 1000 + 1);
                        }
                    })
                }
            });
        }
        // 先清理
        if (flag) lastInfo2 = [];
        lastInfo2.push.apply(lastInfo2, tdoaInfo2.filter(x => x.tdoa && x.tdoa > 0));

        if (timeStamps1.length > 100) {
            timeStamps1.splice(0, timeStamps1.length / 2);
        }
        return {
            distances1,
            distances2
        }
    }

    static getDistanceWithHeight(time, height = 0, length = 15, timeInterval = 0.15, precision = 0.1) {

        let distance = timeInterval * 340 - time * 340;
        let resx = null;
        let j = 1000000;
        for (let x = 0; x <= length; x = x + precision) {
            let tempDistance = Math.sqrt(x * x + height * height) - Math.sqrt((length - x) * (length - x) + height * height)
            if (Math.abs(tempDistance - distance) < j) {
                resx = x;
                j = Math.abs(tempDistance - distance);
            }
        }
        return resx;
    }




    static calculateLocation(tdoas, settings, index = 0) {
        if (tdoas == null || tdoas.length == 0) {
            return;
        }
        let mleResult = null;
        timeQueueList[index].push(...tdoas);
        let now = timeQueueList[index][timeQueueList[index].length - 1];
        while (now - timeQueueList[index][0] > settings.period) {
            timeQueueList[index].splice(0, 1);
        }
        if (timeQueueList[index].length < settings.beaconsLocation.length) return;
        let available = true;
        let distances = new Array(settings.beaconsLocation.length).fill(0);
        for (let i = 0; i < settings.beaconsLocation.length; i++) {
            let timeDifference = now - timeQueueList[index][timeQueueList[index].length - 1 - i] - i * settings.interval;
            // console.log("Time Difference: ", now, timeQueueList[index][timeQueueList[index].length - 1 - i], timeDifference);
            if (Math.abs(timeDifference) < 30 / 340) {
                distances[distances.length - 1 - i] = -timeDifference * 340;
            } else {
                available = false;
                break;
            }
        }
        if (available) {
            timeQueueList[index] = [];
            mleResult = FFTUtils_Racetrack.locate(distances, settings);
        }
        return mleResult;
    }

    static calculateLocationYanjiuyuan(tdoas, settings, index = 0) {
        if (tdoas == null || tdoas.length == 0) {
            return;
        }
        let mleResult = null;
        timeQueueList[index].push(...tdoas);
        let now = timeQueueList[index][timeQueueList[index].length - 1];
        while (now - timeQueueList[index][0] > settings.period) {
            timeQueueList[index].splice(0, 1);
        }
        if (timeQueueList[index].length < settings.beaconsLocation.length) return;
        let available = true;
        let distances = new Array(settings.beaconsLocation.length).fill(0);
        for (let i = 0; i < settings.beaconsLocation.length; i++) {
            // console.log(settings?.timeIntervals)
            let timeDifference = now - timeQueueList[index][timeQueueList[index].length - 1 - i] - i * settings.timeIntervals[i];
            // console.log("Time Difference: ", now, timeQueueList[index][timeQueueList[index].length - 1 - i], timeDifference);
            if (Math.abs(timeDifference) < 30 / 340) {
                distances[distances.length - 1 - i] = -timeDifference * 340;
            } else {
                available = false;
                break;
            }
        }
        let tempT = timeQueueList[index];
        if (available) {
            timeQueueList[index] = [];
            mleResult = FFTUtils_Racetrack.locate(distances, settings);
        }
        return {mleResult,tdoas:tempT};
    }
    static locate(distances, settings) {
        return FFTUtils_Racetrack.MLE(distances, settings);
    }

    static calculateLocationC64(tdoas, settings, index = 0) {
        if (tdoas == null || tdoas.length == 0) {
            return;
        }
        let mleResult = null;
        timeQueueList[index].push(...tdoas);
        let now = timeQueueList[index][timeQueueList[index].length - 1];
        while (now - timeQueueList[index][0] > settings.period) {
            timeQueueList[index].splice(0, 1);
        }
        if (timeQueueList[index].length < settings.beaconsLocation.length) return;
        let available = true;
        let distances = new Array(settings.beaconsLocation.length).fill(0);
        for (let i = 0; i < settings.beaconsLocation.length; i++) {
            let timeDifference = now - timeQueueList[index][timeQueueList[index].length - 1 - i] - i * settings.interval;
            console.log("Time Difference: ", now, timeQueueList[index][timeQueueList[index].length - 1 - i], timeDifference);
            //            Log.d(TAG,"Time Difference: " + timeDifference);
            if (Math.abs(timeDifference) < 30 / 340) {
                distances[distances.length - 1 - i] = -timeDifference * 340;
            } else {
                available = false;
                break;
            }
        }
        if (available) {
            let tempTimeQueue = timeQueueList[index];
            timeQueueList[index] = [];
            mleResult = FFTUtils_Racetrack.locateC64(distances, settings, tempTimeQueue);
            mleResult.push(tempTimeQueue);
        }

        return mleResult;
    }

    static calculateLocationC64New(tdoas, settings, index = 0) {
        if (tdoas == null || tdoas.length == 0) {
            return;
        }
        let mleResult = null;
        timeQueueList[index].push(...tdoas);
        let now = timeQueueList[index][timeQueueList[index].length - 1];
        while (now - timeQueueList[index][0] > settings.period) {
            timeQueueList[index].splice(0, 1);
        }
        if (timeQueueList[index].length < settings.beaconsLocation.length) return;
        let available = true;
        let distances = new Array(settings.beaconsLocation.length).fill(0);
        for (let i = 0; i < settings.beaconsLocation.length; i++) {
            let timeDifference = now - timeQueueList[index][timeQueueList[index].length - 1 - i] - i * settings.interval;
            // console.log("Time Difference: ", now, timeQueueList[index][timeQueueList[index].length - 1 - i], timeDifference);
            //            Log.d(TAG,"Time Difference: " + timeDifference);
            if (Math.abs(timeDifference) < 30 / 340) {
                distances[distances.length - 1 - i] = -timeDifference * 340;
            } else {
                available = false;
                break;
            }
        }
        if (available) {
            let tempTimeQueue = timeQueueList[index];
            timeQueueList[index] = [];
            mleResult = FFTUtils_Racetrack.locateC64New(distances, settings, tempTimeQueue);
            mleResult.push(tempTimeQueue);
        }

        return mleResult;
    }

    static calculateLocationWithOneDimension(tdoas, settings, index = 0) {
        if (tdoas == null || tdoas.length == 0) {
            return;
        }
        let mleResult = null;
        timeQueueList[index].push(...tdoas);
        let now = timeQueueList[index][timeQueueList[index].length - 1];
        while (now - timeQueueList[index][0] > settings.period) {
            timeQueueList[index].splice(0, 1);
        }
        if (timeQueueList[index].length < settings.beaconsLocation.length) return;
        let available = true;
        let distances = new Array(settings.beaconsLocation.length).fill(0);
        for (let i = 0; i < settings.beaconsLocation.length; i++) {
            let timeDifference = now - timeQueueList[index][timeQueueList[index].length - 1 - i] - i * settings.interval;
            console.log("Time Difference: ", now, timeQueueList[index][timeQueueList[index].length - 1 - i], timeDifference);
            //            Log.d(TAG,"Time Difference: " + timeDifference);
            if (Math.abs(timeDifference) < 30 / 340) {
                distances[distances.length - 1 - i] = -timeDifference * 340;
            } else {
                available = false;
                break;
            }
        }
        if (available) {
            timeQueueList[index] = [];

            mleResult = FFTUtils_Racetrack.locate(distances, settings);
            // 如果新的位置距离历史位置比较远，位置不可靠，先使用一维定位，如果一维定位结果较远，就使用4基站定位
            if(settings.lastCoordinate && (FFTUtils_Racetrack.calculateTwoPointDistance(mleResult, settings.lastCoordinate)  > 1.5 * 1.5)) {

                // 先计算一维定位 todo
                let mleResultMin = null;
                let distancesindex = null;
                let settingsindex = null;
                // 获得Cmn的序号
                let alldistances = FFTUtils_Racetrack.cmn(distances, 3);
                let alllocations = FFTUtils_Racetrack.cmn(settings.locations, 3);

                for (let i = 0; i < alldistances.length; i++) {
                    let distancesi = alldistances[i];
                    let settingsi = JSON.parse(JSON.stringify(settings));
                    settingsi.locations = alllocations[i];
                    settingsi.precision = 0.3;
                    let mleResultTemp = FFTUtils_Racetrack.MLE(distancesi, settingsi);
                    if (mleResultMin) {
                        if (mleResultMin[3] > mleResultTemp[3]) {
                            mleResultMin = mleResultTemp;
                            distancesindex = distancesi;
                            settingsindex = settingsi;
                        }
                        // if (FFTUtils_Racetrack.calculateTwoPointDistance(mleResultMin, settings.lastCoordinate) >
                        //     FFTUtils_Racetrack.calculateTwoPointDistance(mleResultTemp, settings.lastCoordinate)) {
                        //     mleResultMin = mleResultTemp;
                        //     distancesindex = distancesi;
                        //     settingsindex = settingsi;
                        // }
                    } else {
                        mleResultMin = mleResultTemp;
                        distancesindex = distancesi;
                        settingsindex = settingsi;
                    }
                }
                console.log("三基站定位mleResultMin", mleResultMin);
                mleResult = mleResultMin;
            }
        }
        return mleResult;
    }

    // 仓库的定位
    static calculateLocationCangKu(tdoas,settings, index = 0) {
        console.log(index,inedex,tdoas)
        timeQueueList_cangku[index].push(...tdoas);
        let timeDelta = [];

        if (timeQueueList_cangku[index].length < 2) {
            console.log("timeQueueList_cangku[index] 长度小于2， 直接返回");
            return;
        }
        // console.log(" timeQueueList_cangku[index]", timeQueueList_cangku[index]);
        for (let i = 1; i < timeQueueList_cangku[index].length; i++) {
            // console.log(" timeQueueList_cangku[index][i].tdoa", timeQueueList_cangku[index][i].tdoa)
            if (timeQueueList_cangku[index][i].tdoa - timeQueueList_cangku[index][i - 1].tdoa <= this.timeInterval + 0.1 && timeQueueList_cangku[index][i].tdoa - timeQueueList_cangku[index][i - 1].tdoa >= 0.05) {
                timeDelta.push(timeQueueList_cangku[index][i].tdoa - timeQueueList_cangku[index][i - 1].tdoa);
                timeQueueList_cangku[index].splice(i - 1, 2);
                i = i - 1;
            }
        }


    }


    //
    static calcualteLocationWithPoints(tdoas, pointObjList) {

    }

    /**
     * 求：组合C(m, n)，m为上标，n为下标。m选n的所有项
     * m {必传} 原始数据
     * n {必传} 当前项还需元素的个数
     * currentIndex 当前索引
     * choseArr 当前项的部分元素集合（不是完整项，是生成完整项的一个中间状态）
     * result 所有项的结果结合
     */
    static cmn(m, n, currentIndex = 0, choseArr = [], result = []) {
        let mLen = m.length
            // 可选数量小于项所需元素的个数，则递归终止
        if (currentIndex + n > mLen) {
            return
        }
        for (let i = currentIndex; i < mLen; i++) {
            // n === 1的时候，说明choseArr在添加一个元素，就能生成一个新的完整项了。
            // debugger
            if (n === 1) {
                // 再增加一个元素就能生成一个完整项，再加入到结果集合中
                result.push([...choseArr, m[i]])
                    // 继续下一个元素生成一个新的完整项
                i + 1 < mLen && FFTUtils_Racetrack.cmn(m, n, i + 1, choseArr, result)
                break
            }
            // 执行到这，说明n > 2，choseArr还需要两个以上的元素，才能生成一个新的完整项。则递归，往choseArr添加元素
            FFTUtils_Racetrack.cmn(m, n - 1, i + 1, [...choseArr, m[i]], result)
        }
        return result
    }

    // 爬格子的时候选择c64
    static locateC64(distances, settings) {
        let mleResultMin = null;
        let distancesindex = null;
        let settingsindex = null;
        // 获得Cmn的序号
        let alldistances = FFTUtils_Racetrack.cmn(distances, 4);
        let alllocations = FFTUtils_Racetrack.cmn(settings.locations, 4);


        if (alldistances.length != alllocations.length) {
            console.log("基站个数与信号数量不符合");
            return null;
        } else {
            for (let i = 0; i < alldistances.length; i++) {
                let distancesi = alldistances[i];
                let settingsi = JSON.parse(JSON.stringify(settings));
                settingsi.locations = alllocations[i];
                settingsi.precision = 0.3;
                let mleResult = FFTUtils_Racetrack.MLE(distancesi, settingsi);
                if (mleResultMin) {
                    if (mleResultMin[3] > mleResult[3]) {
                        mleResultMin = mleResult;
                        distancesindex = distancesi;
                        settingsindex = settingsi;
                    }
                } else {
                    mleResultMin = mleResult;
                    distancesindex = distancesi;
                    settingsindex = settingsi;
                }
            }
        }

        console.log("settingsindex", settingsindex);
        if (distancesindex != null) {
            settingsindex.precision = settings.precision;
            mleResultMin = FFTUtils_Racetrack.MLE(distancesindex, settingsindex);
        }
        console.log("mleResultMin", mleResultMin);
        return mleResultMin;
    }


    static getTDOAInfoWithListlocateC64New(distances, settings, timeQueue) {
        let mleResultMin = null;
        let distancesindex = null;
        let settingsindex = null;
        // 获得Cmn的序号
        // let alldistances = FFTUtils_Racetrack.cmn(distances, 4);
        let num = Math.max(settings.locations.length - 1, 4);
        let alllocations = FFTUtils_Racetrack.cmn(settings.locations, num);
        let allTimeQueue = FFTUtils_Racetrack.cmn(timeQueue, num);
        let tempIndex = new Array(settings.locations.length).fill(0).map((v, i) => i);
        let allIndex = FFTUtils_Racetrack.cmn(tempIndex, num);


        if (allIndex.length != alllocations.length) {
            console.log("基站个数与信号数量不符合");
            return null;
        } else {
            for (let i = 0; i < alllocations.length; i++) {
                let available = true;
                let distancesi = new Array(alllocations[i].length).fill(0);
                let settingsi = JSON.parse(JSON.stringify(settings));
                settingsi.locations = alllocations[i];
                settingsi.beaconsLocation = alllocations[i];
                let timeQueuei = allTimeQueue[i];
                let now = timeQueuei[timeQueuei.length - 1];
                let indexi = allIndex[i];
                for (let i = 0; i < settingsi.beaconsLocation.length; i++) {
                    let timeDifference = now - timeQueuei[i] - (indexi[indexi.length - 1] - indexi[i]) * settings.interval;
                    // console.log("Time Difference: ", now, timeQueuei[timeQueuei.length - 1 - i], timeDifference);
                    //            Log.d(TAG,"Time Difference: " + timeDifference);
                    if (Math.abs(timeDifference) < 30 / 340) {
                        distancesi[i] = -timeDifference * 340;
                    } else {
                        available = false;
                        break;
                    }
                }
                settingsi.precision = 0.3;
                let mleResult = FFTUtils_Racetrack.MLE(distancesi, settingsi);
                if (mleResultMin) {
                    if (mleResultMin[3] > mleResult[3]) {
                        mleResultMin = mleResult;
                        distancesindex = distancesi;
                        settingsindex = settingsi;
                    }
                } else {
                    mleResultMin = mleResult;
                    distancesindex = distancesi;
                    settingsindex = settingsi;
                }
            }
        }

        console.log("settingsindex", settingsindex);
        if (distancesindex != null) {
            settingsindex.precision = settings.precision;
            mleResultMin = FFTUtils_Racetrack.MLE(distancesindex, settingsindex);
        }
        console.log("mleResultMin", mleResultMin);
        return mleResultMin;
    }




    static getTwoPointDistance(location1, location2) {
        return Math.sqrt((location1[0] - location2[0]) * (location1[0] - location2[0]) +
            (location1[1] - location2[1]) * (location1[1] - location2[1]));
    }

    static MLE(distances, settings) {
        let dimension = 3;
        let JMin = 1e100;
        let xMin = 0,
            yMin = 0,
            zMin = 0,
            J;
        let temp = new Array(dimension);
        let disti, dist0;
        let Ji;
        let extraRangeList = new Array(3);
        extraRangeList[0] = settings.xRange[1] - settings.xRange[0];
        extraRangeList[1] = settings.yRange[1] - settings.yRange[0];
        extraRangeList[2] = settings.zRange[1] - settings.zRange[0];
        if (settings.acousticMapLimitFlag == 1) {
            extraRangeList[0] = 0;
            extraRangeList[1] = 0;
            extraRangeList[2] = 0;
        }

        // 麦克风高度固定为1.2米
        let micHeight = 1.2
        for (let x = settings.xRange[0] - extraRangeList[0]; x <= settings.xRange[1] + extraRangeList[0]; x += settings.precision)
            for (let y = settings.yRange[0] - extraRangeList[1]; y <= settings.yRange[1] + extraRangeList[1]; y += settings.precision)
                for (let z = settings.zRange[0] - extraRangeList[2]; z <= settings.zRange[1] + extraRangeList[2]; z += settings.precision) {
                    if (settings.lastCoordinate && (x - settings.lastCoordinate[0]) * (x - settings.lastCoordinate[0]) +
                        (y - settings.lastCoordinate[1]) * (y - settings.lastCoordinate[1]) +
                        (z - settings.lastCoordinate[2]) * (z - settings.lastCoordinate[2]) >
                        settings.radius * settings.radius) {
                        continue;
                    }
                    // console.log("settings.limitPoly", settings.limitPoly)
                    if (settings.limitPoly != null && settings.limitPoly.length != 0) {
                        if (!FFTUtils_Racetrack.PointInPoly([x, y], settings.limitPoly)) {
                            continue;
                        }
                    }
                    temp[0] = settings.locations[0][0] - x;
                    temp[0] *= temp[0];
                    temp[1] = settings.locations[0][1] - y;
                    temp[1] *= temp[1];
                    temp[2] = settings.locations[0][2] - micHeight;
                    temp[2] *= temp[2];
                    dist0 = Math.sqrt(temp[0] + temp[1] + temp[2]);
                    J = 0;
                    for (let i = 0; i < distances.length - 1; i++) {
                        temp[0] = settings.locations[i + 1][0] - x;
                        temp[0] *= temp[0];
                        temp[1] = settings.locations[i + 1][1] - y;
                        temp[1] *= temp[1];
                        temp[2] = settings.locations[i + 1][2] - micHeight;
                        temp[2] *= temp[2];
                        disti = Math.sqrt(temp[0] + temp[1] + temp[2]);
                        Ji = disti - dist0 - (distances[i + 1] - distances[0]);
                        Ji *= Ji;
                        J += Ji;
                    }
                    if (J < JMin) {
                        xMin = x;
                        yMin = y;
                        zMin = z;
                        JMin = J;
                    }
                }
        return [xMin, yMin, zMin, JMin / distances.length];
    }


    clearTimeQueue() {
        timeQueueList = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
    }

    static calculateCoordinate(lngStart, lngEnd, latStart, latEnd, ratio) {
        let res = {
            lng: -1,
            lat: -1,
        }

        let lng = lngStart + (lngEnd - lngStart) * ratio;
        let lat = latStart + (latEnd - latStart) * ratio;

        res.lng = lng;
        res.lat = lat;

        return res;
    }

    static distanceOfPointAndLine(x, y, x1, y1, x2, y2) {
        //三角形三个边长
        let A = Math.abs(Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2)));
        let B = Math.abs(Math.sqrt(Math.pow((x - x2), 2) + Math.pow((y - y2), 2)));
        let C = Math.abs(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
        //利用海伦公式计算三角形面积
        //周长的一半
        let P = (A + B + C) / 2;
        let allArea = Math.abs(Math.sqrt(P * (P - A) * (P - B) * (P - C)));
        //普通公式计算三角形面积反推点到线的垂直距离
        let dis = (2 * allArea) / C;
        return dis;
    }

    static getTwoNearPointInPoly(pt, poly) {
        let mindis = 1000000;
        let resIndex = null;
        for(let i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
            let dis = FFTUtils_Racetrack.distanceOfPointAndLine(pt[0], pt[1], poly[i][0], poly[i][1], poly[j][0], poly[j][1]);
            if (mindis > dis) {
                if((pt[0] <= Math.max(poly[i][0], poly[j][0]) && pt[0] > Math.min(poly[i][0], poly[j][0]))
                    || (pt[1] <= Math.max(poly[i][1], poly[j][1]) && pt[1] > Math.min(poly[i][1], poly[j][1]))) {
                    mindis = dis;
                    resIndex = [i, j, dis];
                }
            }
        }
        return resIndex;
    }


    // 检测单频信号，确定组号
    detectSingleFrequencyWithList(inputDataList) {
        // signal 归一化处理过的pcm 单声道音频数据
        return singleFrequencyDetect.detectSingleFrequence(inputDataList)
    }

    // FIR 滤波器
    static FIRFilter(signal, filterParams) {
        if (signal == null || signal.length == 0) {
            console.log("filter signal为空");
            return signal.slice(0);
        }
        if (filterParams == null || filterParams.length == 0) {
            console.log("filterParams为空");
            return signal.slice(0);
        }
        let inData = new Array(filterParams.length).fill(0);
        let outData = new Array(signal.length).fill(0);
        for (let i = 0; i < signal.length; i++) {
            // 数组右移一位
            for (let k = inData.length - 1; k > 0; k--) {
                inData[k] = inData[k - 1];
            }
            inData[0] = signal[i];

            //calculate y based on a and b coefficients
            //and in and out.
            let y = 0;
            for (let j = 0; j < filterParams.length; j++) {
                y += filterParams[j] * inData[j];
            }
            outData[i] = y
        }
        return outData;
    }

    // chebyshev1 滤波器
    static createBandPassFilter(sampleRate = 48000, order, lowCutoff, highCutoff) {

        let centreFreq = (highCutoff + lowCutoff) / 2.0;
        let width = Math.abs(highCutoff - lowCutoff);
        let bp = new ChebyshevI();
        bp.bandPass(order, sampleRate, centreFreq, width, 1)
        return bp;
    }

    // 更新配置
    updateSettings(settings) {
        this.clear();
        if (!settings) {
            console.log("FFTUtilsSettings updateSettings settings 为空");
            return;
        }
        console.log(this.clusterId + '使用的配置', JSON.stringify(settings));
        this.SAMPLE_RATE_INHZ = settings.SAMPLE_RATE_INHZ ? settings.SAMPLE_RATE_INHZ : this.SAMPLE_RATE_INHZ;
        this.vMaxTh = settings.vMaxTh ? settings.vMaxTh : this.vMaxTh;
        this.vRatioTh = settings.vRatioTh ? settings.vRatioTh : this.vRatioTh;
        this.pMaxTh = settings.pMaxTh ? settings.pMaxTh : this.pMaxTh;
        this.maxRatioTh = settings.maxRatioTh ? settings.maxRatioTh : this.maxRatioTh;
        this.frequencyStart = settings.frequencyStart ? settings.frequencyStart : this.frequencyStart;
        this.frequencyEnd = settings.frequencyEnd ? settings.frequencyEnd : this.frequencyEnd;
        this.durationTime = settings.durationTime ? settings.durationTime : this.durationTime;
        this.totalLength = settings.totalLength ? settings.totalLength : this.totalLength; // 两基站之间的距离
        this.timeIntervals = settings.timeIntervals ? settings.timeIntervals : this.timeIntervals; // 单位秒
        this.soundSpeed = settings.soundSpeed ? settings.soundSpeed : this.soundSpeed; // 声速
        this.lngStart = settings.lngStart != null ? settings.lngStart : this.lngStart;
        this.lngEnd = settings.lngEnd != null ? settings.lngEnd : this.lngEnd;
        this.latStart = settings.latStart != null ? settings.latStart : this.latStart;
        this.latEnd = settings.latEnd != null ? settings.latEnd : this.latEnd;
        this.timeInterval = settings.timeInterval ? settings.timeInterval : this.timeInterval;
        this.height = settings.height ? settings.height : this.height;
    }

    //计算一个点是否在多边形里,参数:点,多边形数组
    static PointInPoly(pt, poly) {
        let c = false;
        for (let i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1])) &&
            (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) &&
            (c = !c);
        return c;
    }

    //计算两点距离, return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
    static calculateTwoPointDistance(point1, point2) {
        return (point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]);
    }

    static getPdr() {
        return pdr;
    }

    static getFuse() {
        return fuse;
    }

    static getKalmanFilter() {
        return fuse.makeKalmanFilter();
    }
}

export default FFTUtils_Racetrack;
