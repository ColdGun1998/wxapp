import fftUtils from './fftUtil'

// Enum
let SmoothType = {
    mean: 0,
    weightedMean: 1,
    kalmanFilter: 2,
}

let pdr = fftUtils.getPdr();
let fuse = fftUtils.getFuse();
let startPosition = { timestamp: 0, x: 0, y: 0 };
let lastPosition = { timestamp: 0, x: 0, y: 0 };
let stepList = [];
let imuDataList = [];
let alpha = 0;
let imuSteps = 0.35;
let imuMaxDrift = 3;
let acousticMaxDrift = 2.5;
let acousticC64Flag = 0;
let acousticHeight = 2;
let acousticSmoothFlag = 0;
let acousticMapLimitFlag = 0;
let acousticImuStaticFlag = 0;
let aclocTrack = [];
let track = [];
let fakeAclocTrack = false;
let isStatic = false;

let lastAcLoc =null;
let lastImuLoc = null;
let acLocNum = 0;
let hasInitIMUY = false;
let lastFuseLoc = null;
let limitDis = 1.5;

// 调试开关
let DEBUG = false;
let DEBUG_LOG = false;
// 调试数据存储位置，每当reset时会返回此数据内容
let debugData = {
    acousticLocation: [],
    imuDataList: [],
};

let tmpLocationSum = { x: 0, y: 0, n: 0 };

// 主页面开启声波定位的时间
let recordStartTime = null;

// 用于testFile时校准imu与声波的时差。正常使用时是否需要此参数有待验证。
let timeDiff = -1200;

let kalmanFilter = fftUtils.getKalmanFilter();

// if (console.log) {
//     var old = console.log;
//     let that = this;
//     console.log = function() {
//         worker.postMessage({
//             code: 'console',
//             content: JSON.stringify(arguments)
//         });
//         old.apply(this, arguments)
//     }
// }

console.log("worker init")

function workerConsole(ctx){
    worker.postMessage({
        code:'console',
        context:ctx
    })
}

// 一维定位三基站
const beaconCluster1 = new fftUtils('beaconCluster1');
const beaconCluster2 = new fftUtils('beaconCluster2');
let settings1 = null;
let settings2 = null;

// 一维定位
const beaconCluster1D = new fftUtils('beaconCluster1D');
let settings1D = null;

// 二维定位
const beaconCluster2D = new fftUtils('beaconCluster2D');
let settings2D = null;

// 体育馆定位
let frqDetect1 = new fftUtils('frqDetect1');
let frqDetect2 = new fftUtils('frqDetect2');
let frqDetect3 = new fftUtils('frqDetect3');

let frqDetectList = [frqDetect1, frqDetect2, frqDetect3];

// 三组声波频率的配置
let durationTime = 0.03;
let sampleFrq = 48000;
let vMaxTh = 0.8;
let vRatioTh = 0.3;
let maxRatioTh = 25;

// 单频检测存储
let SingleDetectList = []

let frequenceSetting1 = {
    vMaxTh: vMaxTh,
    vRatioTh: vRatioTh,
    pMaxTh: Math.floor(durationTime * sampleFrq) - 1,
    maxRatioTh: maxRatioTh,
    frequencyStart: 17000,
    frequencyEnd: 19000,
    durationTime: durationTime,
    timeInterval: 0.15,
}

let frequenceSetting2 = {
    vMaxTh: vMaxTh,
    vRatioTh: vRatioTh,
    pMaxTh: Math.floor(durationTime * sampleFrq) - 1,
    maxRatioTh: maxRatioTh,
    frequencyStart: 19000,
    frequencyEnd: 21000,
    durationTime: durationTime,
    timeInterval: 0.15,
}

let frequenceSetting3 = {
    vMaxTh: vMaxTh,
    vRatioTh: vRatioTh,
    pMaxTh: 2047,
    maxRatioTh: Math.floor(durationTime * sampleFrq) - 1,
    frequencyStart: 21000,
    frequencyEnd: 23000,
    durationTime: durationTime,
    timeInterval: 0.15,
}

let frequenceSettingList = [frequenceSetting1, frequenceSetting2, frequenceSetting3];

frqDetectList.forEach((detect, index) => {
    detect.updateSettings(frequenceSettingList[index]);
})

// 苏州定位
let frqDetect1_suzhou = new fftUtils('frqDetect1_suzhou');
let frqDetect2_suzhou = new fftUtils('frqDetect2_suzhou');
let frqDetect3_suzhou = new fftUtils('frqDetect3_suzhou');

let frqDetectList_suzhou = [frqDetect1_suzhou, frqDetect2_suzhou, frqDetect3_suzhou];

let frequenceSetting1_suzhou = {
    vMaxTh: vMaxTh,
    vRatioTh: vRatioTh,
    pMaxTh: Math.floor(durationTime * sampleFrq) - 1,
    maxRatioTh: maxRatioTh,
    frequencyStart: 17000,
    frequencyEnd: 19000,
    durationTime: durationTime,
    timeInterval: 0.15,
}

let frequenceSetting2_suzhou = {
    vMaxTh: vMaxTh,
    vRatioTh: vRatioTh,
    pMaxTh: Math.floor(durationTime * sampleFrq) - 1,
    maxRatioTh: maxRatioTh,
    frequencyStart: 19000,
    frequencyEnd: 21000,
    durationTime: durationTime,
    timeInterval: 0.15,
}

let frequenceSetting3_suzhou = {
    vMaxTh: vMaxTh,
    vRatioTh: vRatioTh,
    pMaxTh: Math.floor(durationTime * sampleFrq) - 1,
    maxRatioTh: maxRatioTh,
    frequencyStart: 21000,
    frequencyEnd: 23000,
    durationTime: durationTime,
    timeInterval: 0.15, // 根据实际调整
    totalLength: 20,
}

let frequenceSettingList_suzhou = [frequenceSetting1_suzhou, frequenceSetting2_suzhou, frequenceSetting3_suzhou];

frqDetectList_suzhou.forEach((detect, index) => {
    detect.updateSettings(frequenceSettingList_suzhou[index]);
})


// 省博定位
let frqDetect1_shengbo = new fftUtils('frqDetect1_shengbo');
let frqDetect2_shengbo = new fftUtils('frqDetect2_shengbo');
let frqDetect3_shengbo = new fftUtils('frqDetect3_shengbo');

let frqDetectList_shengbo = [frqDetect1_shengbo, frqDetect2_shengbo, frqDetect3_shengbo];

let frequenceSetting1_shengbo = null;
let frequenceSetting2_shengbo = null;
let frequenceSetting3_shengbo = null;
let frequenceSettingList_shengbo = [frequenceSetting1_shengbo, frequenceSetting2_shengbo, frequenceSetting3_shengbo];

let shengboEnhanceMap = {
    "楼层-1一维1": {
        x1: 24,
        y1: -3.15,
        x2: 24,
        y2: 2.9,
        length: 5.05,
        height: 4.23,
        index1: 0,
        index2: 1,
        timeInterval: 0.15,
        tdoasNumber: 6
    },
    "楼层1一维1": {
        x1: 0,
        y1: 6.99,
        x2: 11.9,
        y2: 6.99,
        length: 11.9,
        height: 4.6,
        index1: 3,
        index2: 4,
        timeInterval: 0.15,
        tdoasNumber: 5,
    }
};
shengboEnhanceMap["楼层1一维1"].length
// 省博定位
let frqDetect1_cangku = new fftUtils('frqDetect1_cangku');
let frqDetect2_cangku = new fftUtils('frqDetect2_cangku');
let frqDetect3_cangku = new fftUtils('frqDetect3_cangku');
let frqDetect4_cangku = new fftUtils('frqDetect4_cangku');

let frqDetectList_cangku = [frqDetect1_cangku, frqDetect2_cangku, frqDetect3_cangku, frqDetect4_cangku];
// let frqDetectList_cangku = [frqDetect1_cangku, frqDetect2_cangku, frqDetect3_cangku];
let frequenceSettingList_cangku = [null, null, null, null];




let locations1 = [
    [5, 18, 1.5],
    [0, 18, 1.5],
    [0, 0, 1.5],
    [10, 0, 1.5],
    [10, 18, 1.5],
]

let locations2 = [
    [15, 18, 1.5],
    [20, 18, 1.5],
    [20, 0, 1.5],
    [10, 0, 1.5],
    [10, 18, 1.5],
]

let locations3 = [
    [25, 18, 1.5],
    [20, 18, 1.5],
    [20, 0, 1.5],
    [30, 0, 1.5],
    [30, 18, 1.5],
]


let locationSettingList = [
    getLocationSetting(locations1),
    getLocationSetting(locations2),
    getLocationSetting(locations3),
];


let locationSettingList_suzhou = [];

let signalFilterParameterList = [
    [48000, 32, 16700, 17300],
    [48000, 32, 18700, 19300],
    [48000, 32, 20700, 21300],
];

let signalFilterList = []

signalFilterParameterList.forEach((item) => {
    let bp = fftUtils.createBandPassFilter(item[0], item[1], item[2], item[3]);
    signalFilterList.push(bp)
})

let qb17filter = fftUtils.createBandPassFilter(48000, 8, 16900, 17100);
let qb19filter = fftUtils.createBandPassFilter(48000, 8, 18900, 19100);
let qb21filter = fftUtils.createBandPassFilter(48000, 8, 20900, 21100);
let qb23filter = fftUtils.createBandPassFilter(48000, 8, 22900, 23100);

let shengboFilterList = [qb17filter, qb19filter, qb21filter, qb23filter];


let qb2123filter = fftUtils.createBandPassFilter(48000, 64, 21100, 22900);
let qb1719filter = fftUtils.createBandPassFilter(48000, 64, 17100, 18900);
let qb1921filter = fftUtils.createBandPassFilter(48000, 64, 19100, 20900);
let qb1517filter = fftUtils.createBandPassFilter(48000, 64, 15100, 16900);

let chirpFilterParameterList = [
    [48000, 32, 17400, 18600],
    [48000, 32, 19400, 20600],
    [48000, 32, 21400, 22600],
];

let chirpFilterList = [];

chirpFilterParameterList.forEach((item) => {
    let bp = fftUtils.createBandPassFilter(item[0], item[1], item[2], item[3]);
    chirpFilterList.push(bp)
})


let chirpFilterParameterList_suzhou = [
    [48000, 32, 17400, 18600],
    [48000, 32, 19400, 20600],
    [48000, 32, 21400, 22600],
];

let chirpFilterList_suzhou = [];

chirpFilterParameterList_suzhou.forEach((item) => {
    let bp = fftUtils.createBandPassFilter(item[0], item[1], item[2], item[3]);
    chirpFilterList_suzhou.push(bp)
})

let chirpFilterParameterList_shengbo = [
    [48000, 32, 17000, 19000],
    [48000, 32, 19000, 21000],
    [48000, 32, 21000, 23000],
];

let chirpFilterList_shengbo = [];

chirpFilterParameterList_shengbo.forEach((item) => {
    let bp = fftUtils.createBandPassFilter(item[0], item[1], item[2], item[3]);
    chirpFilterList_shengbo.push(bp)
});

// todo 
let chirpFilterParameterList_yanjiuyuan = [
    [48000, 32, 17000, 19000],
    [48000, 32, 19000, 21000],
    [48000, 32, 21000, 23000],
];

let chirpFilterList_yanjiuyuan = [];

chirpFilterParameterList_yanjiuyuan.forEach((item) => {
    let bp = fftUtils.createBandPassFilter(item[0], item[1], item[2], item[3]);
    chirpFilterList_yanjiuyuan.push(bp)
});


let chirpFilterParameterList_cangku = [
    [48000, 8, 15300, 16700],
    [48000, 8, 17300, 18700],
    [48000, 8, 19300, 20700],
    [48000, 8, 21300, 22700],
];

let chirpFilterList_cangku = [];

chirpFilterParameterList_cangku.forEach((item) => {
    let bp = fftUtils.createBandPassFilter(item[0], item[1], item[2], item[3]);
    chirpFilterList_cangku.push(bp)
})




let inputListTemp = []

let needJudgeNumber = true;
let chirpNum = -1;

// 保留输入的音频数据 一秒， 48000个点
let inputListStore = []

// 标志是否完成时间对齐， 一秒内的信号顺序为1，2，3，4，5
let isTimeAligned = false;
let timeGap = 0.330; // 两个信号时间差大于300，认为
let timeOffset = -1; // 需要偏移多少时间


function oneDProcessThreeBeacon_nanchang(inputData) {
    let timeStamp = new Date().getTime();


    // 检测单频信号，切换配置
    Array.prototype.push.apply(SingleDetectList, inputData);
    let tdoaInfo = []
    let tdoaInfo2 = []
    if (SingleDetectList.length > 8192 * 4) {
        let output = new Array(SingleDetectList.length);
        for (let i = 0; i < SingleDetectList.length; i++) {
            output[i] = qb1921filter.filter(SingleDetectList[i]);
        }
        let clusterIndex = beaconCluster1.detectSingleFrequencyWithList(output);
        console.log("clusterIndex", clusterIndex);
        let output1 = new Array(SingleDetectList.length);
        for (let i = 0; i < SingleDetectList.length; i++) {
            output1[i] = qb1719filter.filter(SingleDetectList[i]);
        }
        // 获取tdoa, 改成单声道
        tdoaInfo = beaconCluster1.getTDOAInfoWithList(output1);
        let output2 = new Array(SingleDetectList.length);
        for (let i = 0; i < SingleDetectList.length; i++) {
            output2[i] = qb2123filter.filter(SingleDetectList[i]);
        }
        tdoaInfo2 = beaconCluster2.getTDOAInfoWithList(output2);
        SingleDetectList = [];
    }


    worker.postMessage({
        'code': 'tdoaInfo',
        tdoaInfo,
        tdoaInfo2
    })

    let distanceObj = fftUtils.calculateDistanceThreeBeacon(tdoaInfo, tdoaInfo2, settings1, settings2, 1);

    let lngStart1 = settings1.lngStart;
    let lngEnd1 = settings1.lngEnd;
    let latStart1 = settings1.latStart;
    let latEnd1 = settings1.latEnd;


    let lngStart2 = settings2.lngStart;
    let lngEnd2 = settings2.lngEnd;
    let latStart2 = settings2.latStart;
    let latEnd2 = settings2.latEnd;

    let coord1 = [];
    let coord2 = [];
    distanceObj.distances1.forEach(x => {
        coord1.push(fftUtils.calculateCoordinate(lngStart1, lngEnd1, latStart1, latEnd1, x / settings1.totalLength));
    })

    distanceObj.distances2.forEach(x => {
        coord2.push(fftUtils.calculateCoordinate(lngStart2, lngEnd2, latStart2, latEnd2, x / settings2.totalLength));
    })


    worker.postMessage({
        'code': 'coordinate',
        coordinate1: coord1,
        coordinate2: coord2,
        timeStamp: timeStamp
    })
    worker.postMessage({
        'code': 'distances_nanchang',
        distances1: distanceObj.distances1,
        distances2: distanceObj.distances2,
        timeStamp: timeStamp
    })
}

function oneDProcessThreeBeacon(inputData) {
    let timeStamp = new Date().getTime();
    inputListTemp.push.apply(inputListTemp, inputData);

    if (inputListTemp.length < sampleFrq) {
        return;
    }

    // 输入到inputListStore, 凑齐一秒的数据, 如果 inputListStore.length 大于 48000 代表上次的数据因为楼层切换未处理
    let leftLength = Math.max(sampleFrq - inputListStore.length, 0);
    console.log("leftLength", leftLength);
    inputListStore.push.apply(inputListStore, inputListTemp.slice(0, leftLength));
    inputListTemp = inputListTemp.slice(leftLength);

    let tdoaInfo = [];
    let tdoaInfo2 = [];

    tdoaInfo = beaconCluster1.getTDOAInfoWithList(inputListStore);
    // let output2 = new Array(inputListStore.length);
    // for (let i = 0; i < inputListStore.length; i++) {
    //     output2[i] = qb2123filter.filter(inputListStore[i]);
    // }
    tdoaInfo2 = beaconCluster2.getTDOAInfoWithList(inputListStore);
    inputListStore = [];


    worker.postMessage({
        'code': 'tdoaInfo',
        tdoaInfo,
        tdoaInfo2
    })

    let distanceObj = fftUtils.calculateDistanceThreeBeacon(tdoaInfo, tdoaInfo2, settings1, settings2, 1);

    let lngStart1 = settings1.lngStart;
    let lngEnd1 = settings1.lngEnd;
    let latStart1 = settings1.latStart;
    let latEnd1 = settings1.latEnd;


    let lngStart2 = settings2.lngStart;
    let lngEnd2 = settings2.lngEnd;
    let latStart2 = settings2.latStart;
    let latEnd2 = settings2.latEnd;

    let coord1 = [];
    let coord2 = [];
    distanceObj.distances1.forEach(x => {
        coord1.push(fftUtils.calculateCoordinate(lngStart1, lngEnd1, latStart1, latEnd1, x / settings1.totalLength));
    })

    distanceObj.distances2.forEach(x => {
        coord2.push(fftUtils.calculateCoordinate(lngStart2, lngEnd2, latStart2, latEnd2, x / settings2.totalLength));
    })


    worker.postMessage({
        'code': 'coordinate',
        coordinate1: coord1,
        coordinate2: coord2,
        timeStamp: timeStamp
    })
    worker.postMessage({
        'code': 'distances_cangku',
        distances1: distanceObj.distances1,
        distances2: distanceObj.distances2,
        timeStamp: timeStamp
    })
}

let lastCoordinate1D = null;

function oneDProcess(inputData) {
    let timeStamp = new Date().getTime();
    let tdoaInfo = beaconCluster1D.getTDOAInfoWithList(inputData);
    worker.postMessage({
        'code': 'tdoaInfo',
        'tdoaInfo': tdoaInfo
    })
    let location = beaconCluster1D.getDistance(beaconCluster1D.getTimeDelta(tdoaInfo));

    // !!! limit in the area
    if (location != null && location.length > 0) {
        if (location[0] > settings1D.totalLength || location[0] < 0) {
            location = null;
        }
        if (lastCoordinate1D != null) {
            if (Math.abs(location[0] - lastCoordinate1D[0]) > acousticMaxDrift) {
                location = null;
            }
        }
    }

    if (location != null && location.length > 0) {
        lastCoordinate1D = location;
        lastAcLoc ={
            timestamp:timeStamp,
            x:location[0],
            y:0,
            deviation:0,
        };

        if (lastFuseLoc == null) {
            lastFuseLoc = {
                timestamp: recordStartTime,
                x: location[0],
                y: location[1],
                z: 0,
                deviation: 0,
            }
        } else if (Math.abs(lastAcLoc.x - lastFuseLoc.x) < limitDis) {
            lastFuseLoc = {
                timestamp: recordStartTime,
                x: (location[0] + lastFuseLoc.x) / 2,
                y: (location[1] + lastFuseLoc.y) / 2,
                z: 0,
                deviation: 0,
            }
            limitDis = 1.5;
        } else {
            limitDis += 1.5;
        }
    }

    worker.postMessage({
        'code': 'location',
        'location': lastAcLoc,
        'type': '1D',
        'timeStamp': timeStamp,
    })
}

function avg(array) {
    let sum = 0;
    let validArray = 0;
    for (var i = 0; i < array.length; i++) {
        let arrayI = array[i];
        if (arrayI != null) {
            sum += arrayI;
            validArray += 1;
        }
    }
    let avgVal = sum / validArray;
    console.log("sum:" + sum + ", avg:" + avgVal + ", validArray:" + validArray);
    return avgVal; // must be valid because avg is effective when location is valid
};

function weightAvg(array, weights) {
    // previous, now, array must be 3
    let sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum += array[i] * weights[i];
    }
    return sum;
};

let lastCoordinate = null;
let continue_err_count = 0;
let maNumber = 3; // 移动平均5个点
let outputLocList = []; //移动平均
function twoDProcess(inputData, locations) {
    console.log("twodProcess")
    let timeStamp = new Date().getTime();

    let tdoaInfo = beaconCluster2D.getTDOAInfoWithList(inputData);
    

    worker.postMessage({
        'code': 'tdoaInfo',
        tdoaInfo,
        // tdoaInfo2
    })

    // 取出所有到达时间
    let tdoas = [];
    tdoaInfo.forEach((item) => {
        if (item.tdoa > 0) {
            tdoas.push(item.tdoa);
        }
    })



    let ranges = [
        [100, -1],
        [100, -1],
        [100, -1]
    ];

    for (let i = 0; i < locations.length; i++) {
        let loc = locations[i];
        for (let j = 0; j < 3; j++) {
            ranges[j][0] = Math.min(ranges[j][0], loc[j]);
            ranges[j][1] = Math.max(ranges[j][1], loc[j]);
        }
    }
    // console.log('ranges:', ranges);

    let settings = {
        period: 1.002, // 同一批信号首位间隔时间
        beaconsLocation: locations,
        locations: locations,
        xRange: ranges[0],
        yRange: ranges[1],
        zRange: ranges[2],
        totalLength: Math.max(ranges[0][1] - ranges[0][0], ranges[1][1] - ranges[1][0], ranges[2][1] - ranges[2][0]), // 暂时用x轴  的长度
        lastCoordinate: lastCoordinate,
        radius: acousticMaxDrift,
        interval: 0.15,
        precision: 0.1,
        acousticMapLimitFlag: acousticMapLimitFlag
    }

    let costStartTime = new Date().getTime();
    let location = null;
    if (acousticC64Flag == 1) {
        location = fftUtils.calculateLocationC64(tdoas, settings);
    } else {
        location = fftUtils.calculateLocation(tdoas, settings);
    }
    if (location != null) {
        lastCoordinate = location;
    }
    // 是否需要移动平均 1: 1/3 1/3 1/3
    if (acousticSmoothFlag != 0) {
        if (location != null) {
            // previous, now
            outputLocList.push(JSON.parse(JSON.stringify(location)));
            // 计算移动均值
            let xList = outputLocList.map(item => item[0]);
            let yList = outputLocList.map(item => item[1]);
            console.log("xList", xList);
            if (acousticSmoothFlag == 1) {
                location[0] = avg(xList);
                location[1] = avg(yList);
            } else if (acousticSmoothFlag == 2) {
                // 默认3个加权平均为6/3/1，否则仍然为典型平均
                let weights = [];
                if (maNumber == 3) {
                    weights = [0.6, 0.3, 0.1];
                } else {
                    for (let i = 0; i < maNumber; i++) {
                        weights.push(1. / maNumber);
                    }
                }
                location[0] = weightAvg(xList, weights);
                location[1] = weightAvg(yList, weights);
            }
            if (outputLocList.length >= maNumber) {
                // 删除第一个location
                outputLocList.splice(0, 1);
            }
        }
    }

    if ((new Date().getTime() - costStartTime) > 1) {
        console.log("cal costTime", (new Date().getTime() - costStartTime));
    }
    console.log("打印日志")
    // worker.postMessage({
    //     'code': 'log',
    //     'msg': 'hhhh',
    // })

    worker.postMessage({
        'code': 'location',
        'location': location,
        'timeStamp': timeStamp,
    })
}

function stadiumProcess(inputList) {
    let timeStamp = new Date().getTime();
    inputListTemp.push.apply(inputListTemp, inputList);

    if (inputListTemp.length < sampleFrq) {
        return;
    }

    // 输入到inputListStore, 凑齐一秒的数据
    let leftLength = sampleFrq - inputListStore.length
    console.log("leftLength", leftLength);
    inputListStore.push.apply(inputListStore, inputListTemp.slice(0, leftLength));
    inputListTemp = inputListTemp.slice(leftLength);

    let res1 = getJudgedNumber(inputListStore, signalFilterParameterList, 1);
    let res2 = getJudgedNumber(inputListStore, chirpFilterParameterList, 2);

    console.log(res1.signalMaxAndIndex, res2.signalMaxAndIndex);

    // 保留数据，时间偏移的时候重新把数据放到input
    let inputListStoreKeep = inputListStore.slice(0);

    inputListStore = [];


    if (res1.signalMaxAndIndex.index == res2.signalMaxAndIndex.index) {
        chirpNum = res1.signalMaxAndIndex.index;
    } else if (res1.signalMaxAndIndex.index == 0 && res2.signalMaxAndIndex.index == 2) {
        chirpNum = 2;
    } else {
        let assistList = [];
        for (let i = 0; i < res1.meanList.length; i++) {
            assistList.push(res1.meanList[i] + res2.meanList[i]);
        }
        let assistRes = getMaxAndIndex(assistList);
        chirpNum = assistRes.index;
    }
    console.log(chirpNum);


    let tdoaInfo = frqDetectList[chirpNum].getTDOAInfoWithList(res2.filteredSignalList[chirpNum]);
    tdoaInfo = tdoaInfo.filter(item => item.tdoa > 0);

    console.log("tdoaInfo", tdoaInfo);

    let tdoaNumberTh = 3;

    if (tdoaInfo.length < tdoaNumberTh) {
        console.log("一秒内tdoa小于5个")
        return;
    }

    // 时间未对齐，先对齐时间
    if (!isTimeAligned) {
        if (tdoaInfo.length == 0) {
            console.log("一秒内未检测到tdoa信号");
            return;
        }
        if (tdoaInfo.length < tdoaNumberTh) {
            console.log(tdoaInfo);
            console.log("一秒内tdoa小于5个")
            return;
        }
        let i = 1;
        for (i = 1; i < tdoaInfo.length; i++) {
            let curTdoa = tdoaInfo[i].tdoa;
            let preTdoa = tdoaInfo[i - 1].tdoa;

            // 两个信号间的差值超过 timegap ，表示curTdoa 是这批信号的信号1
            if (curTdoa - preTdoa > timeGap) {
                // 需要偏移的时间，curTdoa 取小数

                timeOffset = fract(curTdoa);
                console.log("时间对齐", timeOffset);
                // 这批信号1 开始的信号插入回inputListStore
                inputListStore.push.apply(inputListStore, inputListStoreKeep.slice((timeOffset - 0.1) * sampleFrq))
                frqDetectList.forEach(item => {
                    item.clear();
                })
                isTimeAligned = true;
                break;
            }
        }
        // 已经对齐
        if (i == tdoaInfo.length && !isTimeAligned) {

            isTimeAligned = true;
        }
        if (isTimeAligned) {
            console.log('时间已经对齐');
        }
        return;
    }


    // 取出所有到达时间
    let tdoas = [];
    tdoaInfo.forEach((item) => {
        if (item.tdoa > 0) {
            tdoas.push(item.tdoa);
        }
    })


    let location = fftUtils.calculateLocation(tdoas, locationSettingList[chirpNum]);

    console.log('location', location);
    // location[3] 误差， 如果误差太大说明，这批信号到达时间中有几个是有问题的。
    if (location && location[3] < 10) {
        worker.postMessage({
            'code': 'location',
            'location': location,
            'timeStamp': timeStamp,
        })
    }
    // }
}

// 苏州定位
function suzhouProcess(inputList) {
    let timeStamp = new Date().getTime();
    inputListTemp.push.apply(inputListTemp, inputList);

    if (inputListTemp.length < sampleFrq) {
        return;
    }

    // 输入到inputListStore, 凑齐一秒的数据
    let leftLength = sampleFrq - inputListStore.length
    console.log("leftLength", leftLength);
    inputListStore.push.apply(inputListStore, inputListTemp.slice(0, leftLength));
    inputListTemp = inputListTemp.slice(leftLength);





    // 滤波    17-19 二维区域， 19-21 二维区域， 21-23 一维区域
    let res = filterSignal_suzhou(inputListStore, chirpFilterParameterList);


    // 保留数据，时间偏移的时候重新把数据放到input
    let inputListStoreKeep = inputListStore.slice(0);

    inputListStore = [];

    // 左上二维区域
    // 中上二维区域
    // 中下一维区域
    let allTdoaList = [];
    frqDetectList_suzhou.forEach((detect, index) => {
        let tdoaX = detect.getTDOAInfoWithList(res.filteredSignalList[index]);
        tdoaX = tdoaX.filter(item => item.tdoa > 0);
        allTdoaList.push(tdoaX);
    });

    let locations = [];

    allTdoaList.forEach((tdoaInfo, index) => {
        if (index == 0 || index == 1) {
            // 取出所有到达时间
            let tdoas = [];
            tdoaInfo.forEach((item) => {
                if (item.tdoa > 0) {
                    tdoas.push(item.tdoa);
                }
            })
            console.log(index, index, tdoas);
            let tdoaTimeList = tdoas.map
                // console.log("locationSettingList_suzhou[index]", locationSettingList_suzhou[index]);
            for (let i = 0; i < tdoas.length; i++) {
                let location = fftUtils.calculateLocation([tdoas[i]], locationSettingList_suzhou[index], index);
                console.log(index, index, 'location', location);
                // location[3] 误差， 如果误差太大说明，这批信号到达时间中有几个是有问题的。
                if (location && location[3] < 10) {
                    if (locations.length > 0) {
                        if (location[3] < locations[0][3]) {
                            locations[0] = location
                        }
                    } else {
                        locations.push(location);
                    }
                } else if (location) {
                    console.log("位置误差太大", location);
                }
            }
        } else if (index == 2) {
            let fftutil1d = frqDetectList_suzhou[index];
            let tdoas = tdoaInfo;
            console.log("p22", tdoas);
            let distances = fftutil1d.getDistance(fftutil1d.getTimeDelta(tdoas));
            if (distances && distances.length > 0) {
                let setting1d = frequenceSettingList_suzhou[2];
                let res = fftUtils.calculateCoordinate(setting1d.lngStart, setting1d.lngEnd, setting1d.latStart, setting1d.latEnd, distances[0] / setting1d.totalLength)
                locations.push([res.lng, res.lat]);
            }
        }
    })

    worker.postMessage({
        'code': 'location',
        'location': locations,
        'type': "suzhou",
        'timeStamp': timeStamp,
    })

}

function checkAllAreaClose(locations) {
    let resloc = [locations.x, locations.y];
    let areaCloseFlag = false;
    let areaCloseInfo = null;
    for (let i = 0; i < frequenceSettingList_shengbo.length; i++) {
        let closeArray = frequenceSettingList_shengbo[i].closeCoordinate;
        // console.log("closeArray:", closeArray);
        for (let j = 0; j < closeArray.length; j++) {
            resloc = areaClose(resloc, [closeArray[j][0], closeArray[j][1]], [closeArray[j][2], closeArray[j][3]], closeArray[j][4], closeArray[j][5]);
            if (resloc[0] != locations.x || resloc[1] != locations.y) {
                areaCloseFlag = true;
                break;
            }
        }
        if (areaCloseFlag) {
            break
        }
    }
    if (areaCloseFlag) {
        // console.log("areaClose effective:", "(", locations.x + ", " + locations.y, ")->(", resloc[0] + ", " + resloc[1] + ")");
        locations.x = resloc[0];
        locations.y = resloc[1];
        let x1 = resloc[2];
        let y1 = resloc[3];
        let x2 = resloc[4];
        let y2 = resloc[5];
        if (x1 != null && y1 != null && x2 != null && y2 != null) {
            console.log("(x1, y1):(" + x1 + ", " + y1 + ")" + ", (x2, y2):(" + x2 + ", " + y2 + ")");
            areaCloseInfo = "吸附区域";
            console.log("areaCloseInfo:", areaCloseInfo);
        }
        if ((x1, y1) == (24, 2.9) && (x2, y2) == (24, -3.15)) {
            areaCloseInfo = "楼层-1一维1";
            console.log("areaCloseInfo:", areaCloseInfo);
        } else if ((x1, y1) == (0, 6.99) && (x2, y2) == (11.9, 6.99)) {
            areaCloseInfo = "楼层1一维1";
            console.log("areaCloseInfo:", areaCloseInfo);
        }
    }
    return areaCloseInfo;
}

// 省博物馆定位
let shengboLastIndex = null;
let haveTdoaFlagGlobal = true;
let outputFloorString = { "-1": "通用层", "0": "-1层", "1": "1层", "2": "2层", "3": "2层小房间", "4": "大厅" };
let tdoaNumber = 5; // 总计小于5个定位，且是17单频，认为在大厅
let shengboFloorChange = false;

function shengboProcess(inputList, fuseImu = false) {
    let timeStamp = new Date().getTime();
    inputListTemp.push.apply(inputListTemp, inputList);

    if (inputListTemp.length < sampleFrq) {
        return;
    }

    // 输入到inputListStore, 凑齐一秒的数据, 如果 inputListStore.length 大于 48000 代表上次的数据因为楼层切换未处理
    let leftLength = Math.max(sampleFrq - inputListStore.length, 0);
    console.log("leftLength", leftLength);
    inputListStore.push.apply(inputListStore, inputListTemp.slice(0, leftLength));
    inputListTemp = inputListTemp.slice(leftLength);

    // 是否需要根据单频判断区域
    if (shengboSetting["autoFloorRec"] != 0 && haveTdoaFlagGlobal) {
        let judgeRes = judgeShengboFloor(inputListStore);
        // 单频信号阈值 todo 需要数据确定
        // console.log("judgeRes", judgeRes.meanList);
        // console.log("judgeRes, signalMaxAndIndex", judgeRes.signalMaxAndIndex);
        let shengboSingleTh = 0.001;
        if (judgeRes.signalMaxAndIndex && judgeRes.signalMaxAndIndex.max > shengboSingleTh) {
            // 更新配置
            if (shengboLastIndex != judgeRes.signalMaxAndIndex.index) {
                console.log("检测单频频率变化", judgeRes.signalMaxAndIndex, judgeRes.meanList);
                updateShengboSetting(shengboSetting["settings"][judgeRes.signalMaxAndIndex.index + 1]);
                shengboLastIndex = judgeRes.signalMaxAndIndex.index;
                shengboFloorChange = true;
                inputListStore = [];
                return;
            }
        }
    }
    // 滤波    17-19 二维区域， 19-21 二维区域， 21-23 一维区域
    let res = filterSignal_shengbo(inputListStore);
    inputListStore = [];

    // frqDetectList_shengbo settings should filterSignal_shengbo
    let allTdoaList = [];
    frqDetectList_shengbo.forEach((detect, index) => {
        let tdoaX = detect.getTDOAInfoWithList(res.filteredSignalList[index]);
        tdoaX = tdoaX.filter(item => item.tdoa > 0);
        allTdoaList.push(tdoaX);
    });

    let initDeviation = 8;
    // deviation：似然值偏差，只采用deviation<100的结果
    let locations = {
        // timestamp: timeStamp + timeDiff,
        deviation: initDeviation
    };

    let haveTdoaFlag = 0;
    allTdoaList.forEach((tdoaInfo, index) => {
        // 取出所有到达时间
        let tdoas = [];
        tdoaInfo.forEach((item) => {
                if (item.tdoa > 0) {
                    tdoas.push(item.tdoa);
                }
            })
            // console.log(index, index, tdoas);
        let tdoaTimeList = tdoas.map
            // console.log("locationSettingList_shengbo[index]", locationSettingList_shengbo[index]);
        for (let i = 0; i < tdoas.length; i++) {
            haveTdoaFlag++;
            // if (tdoas.length != locationSettingList_shengbo[index].beaconsLocation.length) {
            //     console.error("到达时间与基站数量不符合");
            //     continue;
            // }
            let location = null;
            // -1层使用新的定位逻辑
            if (shengboLastIndex == 0) {
                location = fftUtils.calculateLocationC64New([tdoas[i]], locationSettingList_shengbo[index], index);
            } else {
                location = fftUtils.calculateLocationC64([tdoas[i]], locationSettingList_shengbo[index], index);
            }
            // let location = fftUtils.calculateLocation([tdoas[i]], locationSettingList_shengbo[index], index);
            // console.log(index, index, 'location', location);
            // location[3] 误差， 如果误差太大说明，这批信号到达时间中有几个是有问题的。
            if (location && location[3] < locations.deviation) {
                // 只输出一个位置，比较似然值偏差
                locations = {
                    timestamp: recordStartTime,
                    x: location[0],
                    y: location[1],
                    z: location[2],
                    deviation: location[3],
                    timeQueue: location[4],
                    tdoasNumber: tdoas.length,
                }
                console.log("Locations-timestamp=" + locations.timestamp);
            }
        }
    });
    // console.log("haveTdoaFlag", haveTdoaFlag);
    haveTdoaFlagGlobal = (haveTdoaFlag > tdoaNumber);
    // 判断是否在大厅里面
    if (shengboSetting["autoFloorRec"] != 0 && shengboLastIndex == 0 && shengboLastIndex != 4 && haveTdoaFlag < tdoaNumber) {
        // todo 大厅的序号
        // updateShengboSetting(shengboSetting["settings"][3]);
        console.log("检测到大厅");
        shengboLastIndex = 4;
        locations = {
            timestamp: 0,
            x: 0,
            y: 0,
            z: 0,
            deviation: 0,
        }
        let outRes = {
            'code': 'location',
            'location': locations,
            'type': "shengbo",
            'timeStamp': 0,
        };
        outRes["floorString"] = outputFloorString[shengboLastIndex];
        worker.postMessage(outRes);
        locations = null;
    }
    if (locations != null && locations.deviation < initDeviation) {
        locationSettingList_shengbo.forEach(item => {
            item.radius = 2.5;
        });

        continue_err_count = 0;
        if (locations.deviation < initDeviation) {
            locationSettingList_shengbo.forEach(item => {
                item.lastCoordinate = [locations.x, locations.y, locations.z, locations.deviation, locations.timestamp];
            });
        }

        // previous, now
        outputLocList.push([locations.x, locations.y, locations.z, locations.deviation, locations.timestamp]);
        // 计算移动均值
        let xList = outputLocList.map(item => item[0]);
        let yList = outputLocList.map(item => item[1]);
        // console.log("xList", xList);
        if (acousticSmoothFlag == 1) {
            locations.x = avg(xList);
            locations.y = avg(yList);
        }
        if (outputLocList.length >= maNumber) {
            // 删除第一个location
            outputLocList.splice(0, 1);
        }

        // console.log("after shengbo locations", locations);

        if (fuseImu) {
            // console.log("start limit");
            // console.log(lastPosition);
            // console.log(locations);
            // console.log(stepList);
            if (lastPosition.timestamp > 0) {
                locations = limitedByStep(lastPosition, locations);
                // checkAllAreaClose(locations);
            }
            lastPosition = locations;
        }
        let areaCloseInfo = checkAllAreaClose(locations);
        // areaCloseInfo "楼层-1一维1"
        // console.log("locations before 一维增强", locations);
        // if (areaCloseInfo != null && locations.timeQueue) {
        //     let params = shengboEnhanceMap[areaCloseInfo];
        //     // console.log("locations.timeQueue[params.index2] - locations.timeQueue[params.index1]", locations.timeQueue[params.index2] - locations.timeQueue[params.index1])
        //     // 高度减去手机的高度1.2
        //     let dis = fftUtils.getDistanceWithHeight(locations.timeQueue[params.index2] - locations.timeQueue[params.index1], params.height - 1.2, params.length, params.timeInterval);
        //     // console.log("使用一维增强dis", dis);
        //     let point = fftUtils.calculateCoordinate(params.x1, params.x2, params.y1, params.y2, dis / params.length);
        //     console.log("使用一维增强的位置", point);
        //     locations.x = point.lng;
        //     locations.y = point.lat;
        // }
        // if (areaCloseInfo != null && shengboEnhanceMap[areaCloseInfo] && locations.timeQueue && locations.tdoasNumber) {
        //
        //     let params = shengboEnhanceMap[areaCloseInfo];
        //     // if(locations.tdoasNumber != params.tdoasNumber) {
        //     //     console.log("基站数量不符合")
        //     //     return;
        //     // }
        //     // console.log("locations.timeQueue[params.index2] - locations.timeQueue[params.index1]", locations.timeQueue[params.index2] - locations.timeQueue[params.index1])
        //     // 高度减去手机的高度1.2
        //     let dis = fftUtils.getDistanceWithHeight(locations.timeQueue[params.index2] - locations.timeQueue[params.index1], params.height - 1.2, params.length, params.timeInterval);
        //     // console.log("使用一维增强dis", dis);
        //     let point = fftUtils.calculateCoordinate(params.x1, params.x2, params.y1, params.y2, dis / params.length);
        //     console.log("使用一维增强的位置", point);
        //     locations.x = point.lng;
        //     locations.y = point.lat;
        // }
        if (DEBUG) {
            debugData.acousticLocation.push(locations);
        }
        if ((areaCloseInfo != null) || (areaCloseInfo == null && shengboFloorChange)) {
            if (areaCloseInfo == null && shengboFloorChange) {
                shengboFloorChange = false;
            }
            let outRes = {
                'code': 'location',
                'location': locations,
                'type': "shengbo",
                'timeStamp': timeStamp,
            }
            if (shengboLastIndex != null) {
                outRes["floorString"] = outputFloorString[shengboLastIndex];
            } else {
                outRes["floorString"] = outputFloorString[-1];
            }
            worker.postMessage(outRes);

        } else {
            outputLocList.push([null, null, null, null, null]);
            if (outputLocList.length >= maNumber) {
                outputLocList.splice(0, 1);
            }
            continue_err_count += 1;
            if (continue_err_count >= 1) {
                continue_err_count = 0;
                outputLocList = [];
                locationSettingList_shengbo.forEach(item => {
                    item.radius = 10;
                });
            }
        }
    } else if (locations != null && locations.deviation >= initDeviation) {
        locationSettingList_shengbo.forEach(item => {
            item.radius = 10;
        });
    }
}



// 湖州研究院定位
let yanjiuyuanLastIndex = null;

let frqDetect1_yanjiuyuan = new fftUtils('frqDetect1_yanjiuyuan');
let frqDetect2_yanjiuyuan = new fftUtils('frqDetect2_yanjiuyuan');
let frqDetect3_yanjiuyuan = new fftUtils('frqDetect3_yanjiuyuan');

let frqDetectList_yanjiuyuan = [frqDetect1_yanjiuyuan, frqDetect2_yanjiuyuan, frqDetect3_yanjiuyuan];

let frequenceSetting1_yanjiuyuan = null;
let frequenceSetting2_yanjiuyuan = null;
let frequenceSetting3_yanjiuyuan = null;
let frequenceSettingList_yanjiuyuan = [frequenceSetting1_yanjiuyuan, frequenceSetting2_yanjiuyuan, frequenceSetting3_yanjiuyuan];



function yanjiuyuanProcess(inputList, fuseImu = false) {
    let timeStamp = new Date().getTime();

    inputListTemp.push.apply(inputListTemp, inputList);

    if (inputListTemp.length < sampleFrq) {
        return;
    }

    // 输入到inputListStore, 凑齐一秒的数据, 如果 inputListStore.length 大于 48000 代表上次的数据因为楼层切换未处理
    let leftLength = Math.max(sampleFrq - inputListStore.length, 0);
    console.log("leftLength", leftLength);
    inputListStore.push.apply(inputListStore, inputListTemp.slice(0, leftLength));
    inputListTemp = inputListTemp.slice(leftLength);


    // 滤波    17-19 二维区域， 19-21 二维区域， 21-23 一维区域
    let res = filterSignal_shengbo(inputListStore);
    inputListStore = [];


    // frqDetectList_yanjiuyuan settings should filterSignal_yanjiuyuan
    let allTdoaList = [];
    frqDetectList_yanjiuyuan.forEach((detect, index) => {
        let tdoaX = detect.getTDOAInfoWithList(res.filteredSignalList[index]);
        workerConsole(tdoaX)
        tdoaX = tdoaX.filter(item => item.tdoa > 0);
        allTdoaList.push(tdoaX);
    });

    let initDeviation = 100;
    // deviation：似然值偏差，只采用deviation<100的结果
    let locations = {
        // timestamp: timeStamp + timeDiff,
        deviation: initDeviation
    };

    let haveTdoaFlag = 0;
    let needSmooth = false;
    let tobeSmoothedLocations = [];
    let neededSmoothArea = [{xmin:0,xmax:4.4,ymin:2.4,ymax:4.4}]
    // neededSmoothArea = yanjiuyuanSetting?.["settings"][0]
    function isNeededSmooth(x,y){
        neededSmoothArea.forEach((item)=>{
            if(x>=item.xmin && x<=item.xmax && y>=item.ymin && y<=item.ymax){
                return true;
            }
        })
        return false;
    }
    allTdoaList.forEach((tdoaInfo, index) => {
        // 取出所有到达时间
        let tdoas = [];
        tdoaInfo.forEach((item) => {
                if (item.tdoa > 0) {
                    tdoas.push(item.tdoa);
                }
            })
            // console.log(index, index, tdoas);
        let tdoaTimeList = tdoas.map
            // console.log("locationSettingList_yanjiu[index]", locationSettingList_yanjiu[index]);
        for (let i = 0; i < tdoas.length; i++) {
            haveTdoaFlag++;
            // if (tdoas.length != locationSettingList_yanjiuyuan[index].beaconsLocation.length) {
            //     console.error("到达时间与基站数量不符合");
            //     continue;
            // }
            let location = null;
            // -1层使用新的定位逻辑
            if (yanjiuyuanLastIndex == 0) {
                location = fftUtils.calculateLocationC64New([tdoas[i]], locationSettingList_yanjiuyuan[index], index);
            } else {
                location = fftUtils.calculateLocationC64([tdoas[i]], locationSettingList_yanjiuyuan[index], index);
            }
            // let location = fftUtils.calculateLocation([tdoas[i]], locationSettingList_shengbo[index], index);
            // console.log(index, index, 'location', location);
            // location[3] 误差， 如果误差太大说明，这批信号到达时间中有几个是有问题的。
            // 根据区域平滑
            if (location && location[3]<100 && isNeededSmooth(location[x],location[y])){
                needSmooth = true;
                console.log('添加缓存数组',tobeSmoothedLocations)
                tobeSmoothedLocations.push({
                    timestamp: recordStartTime,
                    x: location[0],
                    y: location[1],
                    z: location[2],
                    deviation: location[3],
                    timeQueue: location[4],
                    tdoasNumber: tdoas.length,
                })
            }

            if (location && location[3] < locations.deviation) {
                // 只输出一个位置，比较似然值偏差
                locations = {
                    timestamp: recordStartTime,
                    x: location[0],
                    y: location[1],
                    z: location[2],
                    deviation: location[3],
                    timeQueue: location[4],
                    tdoasNumber: tdoas.length,
                }
                console.log("Locations-timestamp=" + locations.timestamp);
            }
        }
    });

     // 如果进入需要平滑的区域，输出似然值偏差比较小的两个的平均值
    if(needSmooth && tobeSmoothedLocations.length >=2){
        tobeSmoothedLocations.sort((a,b)=>b[3]-a[3])
        firstLocation = tobeSmoothedLocations[0]
        secondLocation = tobeSmoothedLocations[1]
        locations = {
            timestamp: recordStartTime,
            x: (firstLocation.x+secondLocation.x)/2,
            y: (firstLocation.y+secondLocation.y)/2,
            z: (firstLocation.z+secondLocation.z)/2,
            deviation: firstLocation.deviation,
            timeQueue: firstLocation.timeQueue,
            tdoasNumber: firstLocation.tdoasNumber,
        }

    }

    // console.log("haveTdoaFlag", haveTdoaFlag);
    haveTdoaFlagGlobal = (haveTdoaFlag > tdoaNumber);

    if (locations != null && locations.deviation < initDeviation) {
        locationSettingList_yanjiuyuan.forEach(item => {
            item.radius = 2.5;
        });

        continue_err_count = 0;
        if (locations.deviation < initDeviation) {
            locationSettingList_yanjiuyuan.forEach(item => {
                item.lastCoordinate = [locations.x, locations.y, locations.z, locations.deviation, locations.timestamp];
            });
        }

        // previous, now
        outputLocList.push([locations.x, locations.y, locations.z, locations.deviation, locations.timestamp]);
        // 计算移动均值
        let xList = outputLocList.map(item => item[0]);
        let yList = outputLocList.map(item => item[1]);
        // console.log("xList", xList);
        if (acousticSmoothFlag == 1) {
            locations.x = avg(xList);
            locations.y = avg(yList);
        }
        if (outputLocList.length >= maNumber) {
            // 删除第一个location
            outputLocList.splice(0, 1);
        }

        if (fuseImu) {
            if (lastPosition.timestamp > 0) {
                locations = limitedByStep(lastPosition, locations);
            }
            lastPosition = locations;
        }
        if (DEBUG) {
            debugData.acousticLocation.push(locations);
        }
        let outRes = {
            'code': 'location',
            'location': locations,
            'type': "yanjiuyuan",
            'timeStamp': timeStamp,
        }
        worker.postMessage(outRes);
    } else if (locations != null && locations.deviation >= initDeviation) {
        locationSettingList_yanjiuyuan.forEach(item => {
            item.radius = 10;
        });
    }
}

function yanjiuyuanProcessNew(inputList,fuseImu){
    // todo 移动平均 / IMU
    let subLocationList = []
    let finalLocation = {}
    let initDeviation = 100;
    let tobeSmoothedLocations = [];
    let timeStamp = new Date().getTime();
    // 改为配置文件配置
    let neededSmoothArea = [{xmin:0,xmax:4.4,ymin:2.4,ymax:4.4}]
    function isNeededSmooth(x,y){
        neededSmoothArea.forEach((item)=>{
            if(x>=item.xmin && x<=item.xmax && y>=item.ymin && y<=item.ymax){
                return true;
            }
        })
        return false;
    }
    let allTdoas = {}
    frqDetectList_yanjiuyuan?.slice(0,2).forEach((detectUtil,index)=>{
        
        let {subLocation,tdoas} = subTwoDProcess(inputList,detectUtil,frequenceSettingList_yanjiuyuan[index],locationSettingList_yanjiuyuan[index],index);
        if(tdoas!=null){
            // workerConsole(allDistances)
            allTdoas[index] = tdoas
        }
        // 如果在交接区域求出解，并且似然偏差小于100
        if (subLocation != null && subLocation[3] < 100 && isNeededSmooth(subLocation[0],subLocation[1])){
            tobeSmoothedLocations.push({
                x: subLocation[0],
                y: subLocation[1],
                z: subLocation[2],
                deviation: subLocation[3],
                timeQueue: subLocation[4],
            });
        }
        if(subLocation != null && subLocation[3] < initDeviation){
            finalLocation = {
                x: subLocation[0],
                y: subLocation[1],
                z: subLocation[2],
                deviation: subLocation[3],
                timeQueue: subLocation[4],
            }
            initDeviation = subLocation[3]
        }

    })
    // 取边角四个基站
    let spLocation = null;

    if(allTdoas?.['0'] && allTdoas?.['1']){
        console.log('allTdoas',allTdoas)
        // workerConsole('allDistance')
        // workerConsole(allDistances)
        // let spDistances = [allDistances['0'][0],allDistances['0'][3],allDistances['1'][0],allDistances['1'][3]]
        // let spSettings = locationSettingList_yanjiuyuan[2]
        // spLocation = fftUtils.locate(spDistances,spSettings)
    }

    // 交接区域平均过渡
    if(subLocationList && subLocationList.length >= 2 ){
        workerConsole('交接区域过渡')
        firstLocation = tobeSmoothedLocations[0]
        secondLocation = tobeSmoothedLocations[1]
        fisrtWegiht = firstLocation.deviation/(firstLocation.deviation+secondLocation.deviation)
        secondWegiht = secondLocation.deviation/(firstLocation.deviation+secondLocation.deviation)
        finalLocation = {
            // x: (firstLocation.x+secondLocation.x)/2,
            // y: (firstLocation.y+secondLocation.y)/2,
            // z: (firstLocation.z+secondLocation.z)/2,
            x: firstLocation.x*fisrtWegiht + secondLocation.x*fisrtWegiht,
            y: firstLocation.y*fisrtWegiht + secondLocation.y*fisrtWegiht,
            z: firstLocation.z*fisrtWegiht + secondLocation.z*fisrtWegiht,
            deviation: firstLocation.deviation,
            timeQueue: firstLocation.timeQueue,
        }
        workerConsole(finalLocation)
    }


            // // previous, now
            // outputLocList.push([finalLocation.x, finalLocation.y, finalLocation.z, finalLocation.deviation, finalLocation.timestamp]);
            // // 计算移动均值
            // let xList = outputLocList.map(item => item[0]);
            // let yList = outputLocList.map(item => item[1]);
            // // console.log("xList", xList);
            // if (acousticSmoothFlag == 1) {
            //     locations.x = avg(xList);
            //     locations.y = avg(yList);
            // }
            // if (outputLocList.length >= maNumber) {
            //     // 删除第一个location
            //     outputLocList.splice(0, 1);
            // }
    
            // if (fuseImu) {
            //     if (lastPosition.timestamp > 0) {
            //         locations = limitedByStep(lastPosition, locations);
            //     }
            //     lastPosition = locations;
            // }

    let outRes = {
        'code': 'location',
        'location': finalLocation,
        'type': "yanjiuyuan",
        'timeStamp': timeStamp,
    }
    worker.postMessage(outRes);
}

function subTwoDProcess(inputData,detectUtil,subFreqSettings,subLocationsSettings,subIndex){
    //todo补上移动平均
        // workerConsole("twodProcess")
        let tdoaInfo = detectUtil.getTDOAInfoWithList(inputData);
        // worker.postMessage({
        //     'code': 'tdoaInfo',
        //     'freq': subFreqSettings?.frequencyStart+'-'+subFreqSettings?.frequencyEnd,
        //     tdoaInfo,
        // })
        // workerConsole('freq:'+subFreqSettings?.frequencyStart+'-'+subFreqSettings?.frequencyEnd+tdoaInfo)

        // 取出所有到达时间
        let tdoas = [];
        tdoaInfo.forEach((item) => {
            if (item.tdoa > 0) {
            tdoas.push(item.tdoa);
        }
        })

        let costStartTime = new Date().getTime();
        let location = null;
        let finalTdoas = null;
        if (subFreqSettings?.acousticC64Flag == 1) {
            location = fftUtils.calculateLocationC64New(tdoas, subLocationsSettings,subIndex);
        } else {
            // let res = fftUtils.calculateLocationYanjiuyuan(tdoas, subLocationsSettings,subIndex);
            if(res){
                // console.log(res)
                location = res.mleResult
                finalTdoas = res.tdoas
            }
        }

        if ((new Date().getTime() - costStartTime) > 1) {
            console.log("cal costTime", (new Date().getTime() - costStartTime));
        }
        if(location!=null){
            if (location != null) {
                subLocationsSettings.lastCoordinate = location;
            }
            workerConsole(
                'freq:'+subFreqSettings?.frequencyStart/1000+'-'+subFreqSettings?.frequencyEnd/1000+';locations:'+location[0].toFixed(2)+','+location[1].toFixed(2)+','+location[3].toFixed(2)
            )
        }

        return {subLocation:location,tdoas:finalTdoas}

}

function judgeCangkuPassage(allTdoaList, filteredSignalList) {
    let allTdoas = [];
    allTdoaList.forEach((tdoaInfo, index) => {
        // 取出所有到达时间
        let tdoas = [];
        tdoaInfo.forEach((item) => {
            if (item.tdoa > 0) {
                tdoas.push(item.tdoa);
            }
        })
        allTdoas.push(tdoas);
    })
    let choosedIndex = 0;
    let globalCount = 0;
    allTdoas.forEach((tdoas, index) => {
        let count = 0;
        for (let i = 0; i < tdoas.length; i++) {
            let tdoa = tdoas[i];
            let isFirst = true;
            for (let j = 0; j < allTdoas.length; j++) {
                if(j == index) {
                    continue;
                }
                if (!findNearTdoa(tdoa, allTdoas[j])) {
                    isFirst = false;
                }
            }
            if (isFirst) {
                count++;
            }
        }
        if (count > globalCount) {
            globalCount = count;
            choosedIndex = index;
        }
    });
    return choosedIndex;
}

function judgeCangkuPassageWithDB(allTdoaList, filteredSignalList, filteredSignalListLast) {
    let allTdoas = [];
    allTdoaList.forEach((tdoaInfo, index) => {
        // 取出所有到达时间
        let tdoas = [];
        tdoaInfo.forEach((item) => {
            if (item.tdoa > 0) {
                tdoas.push(item.tdoa);
            }
        })
        allTdoas.push(tdoas);
    })
    let choosedIndex = 0;
    let globalMax = 0;


    allTdoas.forEach((tdoas, index) => {
        for (let i = 0; i < tdoas.length; i++) {
            let maxDB = 0;
            if (fract(tdoas[i]) > 0.8 && i == 0) {
                let twoSignalList = filteredSignalListLast[index].concat(filteredSignalList[index]);
                maxDB = getSingnalMaxDB(tdoas[i], twoSignalList);
            } else {
                maxDB = getSingnalMaxDB(tdoas[i], filteredSignalList[index]);
            }
            if (maxDB > globalMax) {
                globalMax = maxDB;
                choosedIndex = index;
            }
        }
    });
    return choosedIndex;
}

function getSingnalMaxDB(tdoa, signalList, windowSize = 0.15) {
    let startIndex = Math.max((fract(tdoa) - windowSize) * 48000, 0);
    let endIndex = Math.min((fract(tdoa) + windowSize) * 48000, signalList.length);
    let maxAndIndex = getAbsMaxAndIndex(signalList.slice(startIndex, endIndex));
    return maxAndIndex.max;
}

function getSignalMeanDB(tdoa, signalList, windowSize = 0.15) {
    let maxDB = 0;
    let startIndex = Math.max((fract(tdoa) - windowSize) * 48000, 0);
    let endIndex = Math.min((fract(tdoa) + windowSize) * 48000, signalList.length);
    let absMean = getAbsMean(signalList.slice(startIndex, endIndex));
    return absMean;
}

function getSignalSingleMeanDB(tdoa, signalList, start = -0.01, end = 0.01) {
    let maxDB = 0;
    let startIndex = Math.min(Math.max((fract(tdoa) + start) * 48000, 0), signalList.length);
    let endIndex = Math.max(Math.min((fract(tdoa) + end) * 48000, signalList.length), 0);
    let absMean = getAbsMean(signalList.slice(startIndex, endIndex));
    return absMean;
}




function findNearTdoa(tdoa, tdoas) {
    let res = true;
    if (tdoa == null || tdoas == null) {
        console.log("findNearTdoa tdoa || tdoas 为 null");
        res = false;
        return res;
    }
    for (let i = 0; i < tdoas.length; i++) {
        let tdoai = tdoas[i];
        if (tdoai < tdoa + 0.0001 && tdoai > tdoa - 0.05) {
            res = false;
        }
    }
    return res;
}


let resSingleLast = null;
let resLast = null;
let lastResy = null;
function calculateVertical(allTdoaList, judgedIndex, isFront) {
    let resy = -1;
    let tempIndex = judgedIndex
    if (judgedIndex == allTdoaList.length - 1) {
        tempIndex = judgedIndex - 1
    } else if (judgedIndex == 0) {
        tempIndex = judgedIndex + 1
    }
    if (allTdoaList[tempIndex + 1].length == 0 || allTdoaList[tempIndex - 1].length == 0) {
        return lastResy == null ? frequenceSettingList_cangku[judgedIndex].coordinate[0][1] : lastResy;
    }
    let timediff = allTdoaList[tempIndex + 1][0].tdoa - allTdoaList[tempIndex - 1][0].tdoa;
    if(!isFront) {
        let yIndex1 = Math.min(allTdoaList[tempIndex + 1].length - 1, 2);
        let yIndex2 = Math.min(allTdoaList[tempIndex - 1].length - 1, 2);
        timediff = allTdoaList[tempIndex + 1][yIndex1].tdoa - allTdoaList[tempIndex - 1][yIndex2].tdoa
        // timediff = allTdoaList[tempIndex + 1][2].tdoa - allTdoaList[tempIndex - 1][2].tdoa
    }
    if(timediff > 0.5 || timediff < -0.5) {
        console.log("y轴时间差距过大")
        console.log("tempIndex", tempIndex
            ,"calculateVertical timediff", timediff
            ,"allTdoaList[tempIndex + 1]", allTdoaList[tempIndex + 1]
            ,"allTdoaList[tempIndex - 1]", allTdoaList[tempIndex - 1]);
        return lastResy == null ? frequenceSettingList_cangku[judgedIndex].coordinate[0][1] : lastResy;
    }
    let heightdiff = frequenceSettingList_cangku[tempIndex + 1].coordinate[0][1] - frequenceSettingList_cangku[tempIndex - 1].coordinate[0][1]
    resy = fftUtils.getDistanceWithHeight(timediff,  1, heightdiff, 0, 0.1)
    resy = resy + frequenceSettingList_cangku[tempIndex - 1].coordinate[0][1]
    console.log("tempIndex", tempIndex
        ,"calculateVertical timediff", timediff
        ,"allTdoaList[tempIndex + 1]", allTdoaList[tempIndex + 1]
        ,"allTdoaList[tempIndex - 1]", allTdoaList[tempIndex - 1]
        ,"resy", resy);
    lastResy = resy;
    return resy;
}

let lastJudgedIndex = null;
function cangkuProcess(inputList) {
    let timeStamp = new Date().getTime();
    inputListTemp.push.apply(inputListTemp, inputList);
    if (inputListTemp.length < sampleFrq) {
        return;
    }

    // 输入到inputListStore, 凑齐一秒的数据
    let leftLength = sampleFrq - inputListStore.length
    console.log("leftLength", leftLength);
    inputListStore.push.apply(inputListStore, inputListTemp.slice(0, leftLength));
    inputListTemp = inputListTemp.slice(leftLength);
    let t1 = new Date().getTime();
    let res = filterSignal_cangku(inputListStore);

    let resSingle = filterSignalSingle_cangku(inputListStore);
    if (!resSingleLast || !resLast) {
        resLast = res;
        resSingleLast = resSingle;
        return;
    }
    console.log("滤波时间：", new Date().getTime() - t1)


    let allTdoaList = [];
    let t2 = new Date().getTime();
    frqDetectList_cangku.forEach((detect, index) => {
        // if(lastJudgedIndex != null ) {
        //     let tempindex = Math.max(1, Math.min(lastJudgedIndex, 2));
        //     if(Math.abs(tempindex - index) > 1.9) {
        //         allTdoaList.push([]);
        //         return;
        //     }
        // }
        let tdoaX = detect.getTDOAInfoWithList(res.filteredSignalList[index]);
        tdoaX = tdoaX.filter(item => item.tdoa > 0);
        // console.log("过滤到达时间后", tdoaX);
        allTdoaList.push(tdoaX);
    });
    console.log("剔除前的allTdoaList", allTdoaList)
    console.log("计算到达时间：", new Date().getTime() - t2)
    for (let j = 0; j < allTdoaList.length; j++) {
        // 先过滤下， 相近点剔除
        if(allTdoaList[j].length > 1) {
            for (let i = 1; i < allTdoaList[j].length; i++) {
                let tempi_1 = allTdoaList[j][i - 1].tdoa
                let tempi = allTdoaList[j][i].tdoa
                if(tempi - tempi_1 < 0.1) {
                    allTdoaList[j].splice(i, 1);
                    i--;
                }
            }
        }
    }
    console.log("剔除后的allTdoaList", allTdoaList)
    // 保留数据，时间偏移的时候重新把数据放到input
    let inputListStoreKeep = inputListStore.slice(0);
    inputListStore = [];
    if (!isTimeAligned) {
        let timeOffsetGlobal =  0;
        let flag = false;
        allTdoaList.forEach((tdoaInfo, index) => {
            // 取出所有到达时间
            let tdoas = [];
            tdoaInfo.forEach((item) => {
                if (item.tdoa > 0) {
                    tdoas.push(item.tdoa);
                }
            })
            if (tdoas.length == 0) {
                console.log("一秒内未检测到tdoa信号");
                return;
            }
            if (tdoas.length > 1) {
                flag = true;
            }
            let i = 1;
            for (i = 1; i < tdoas.length; i++) {
                let curTdoa = tdoas[ i];
                let preTdoa = tdoas[i - 1];
                if (curTdoa - preTdoa > timeGap) {
                    // 需要偏移的时间，curTdoa 取小数
                    timeOffsetGlobal = Math.max(fract(curTdoa), timeOffsetGlobal);
                    // console.log("时间对齐", timeOffsetGlobal);
                    break;
                }
            }
            if (tdoas.length > 0 && tdoas[0] > 0.450) {
                timeOffsetGlobal = Math.max(fract(tdoas[0]), timeOffsetGlobal);
            }
        });
        if(timeOffsetGlobal > 0) {
            inputListStore.push.apply(inputListStore, inputListStoreKeep.slice((timeOffsetGlobal - 0.250) * sampleFrq))
            frqDetectList_cangku.forEach(item => {
                item.clear();
            })
            console.log('timeOffsetGlobal', timeOffsetGlobal);
            console.log('时间未对齐');
            // isTimeAligned = true;
        } else {
            if (flag) {
                isTimeAligned = true;
            }
        }
        if (isTimeAligned) {
            console.log('时间已经对齐');
        }
        resLast = null;
        resSingleLast = null;
        return;
    }
    let location = null;


    // 判断在哪条通道
    let judgedIndex = judgeCangkuPassageWithDB(allTdoaList,res.filteredSignalList, resLast.filteredSignalList);

    lastJudgedIndex = judgedIndex;
    // console.log("allTdoaList", allTdoaList)
    console.log("judgedIndex", judgedIndex)
    // console.log("allTdoaList[judgedIndex]", allTdoaList[judgedIndex])



    console.log("剔除后的allTdoaList[judgedIndex]", allTdoaList[judgedIndex])

    let showYDisatance = 3.5
    let middleDistance = 6 // todo 中间问题判断
    if (allTdoaList[judgedIndex].length <= 1) {
        console.log("到达时间个数小于1",allTdoaList[judgedIndex]);
    } else if (allTdoaList[judgedIndex].length == 2) {
        let distance = fftUtils.getDistanceWithHeight(
            allTdoaList[judgedIndex][1].tdoa - allTdoaList[judgedIndex][0].tdoa, 1,  frequenceSettingList_cangku[judgedIndex].totalLength, frequenceSettingList_cangku[judgedIndex].timeInterval, 0.1
        )
        // 判断在在前半部分还是后半部分
        // let db1 = getSingnalDB(allTdoaList[judgedIndex][0].tdoa, res.filteredSignalList[judgedIndex]);
        // let db2 = getSingnalDB(allTdoaList[judgedIndex][1].tdoa, res.filteredSignalList[judgedIndex]);
        let db1 = 0;
        if (allTdoaList[judgedIndex][0].tdoa > 0.85) {
            db1 = getSignalSingleMeanDB(allTdoaList[judgedIndex][0].tdoa, resSingleLast.filteredSignalList[0].concat(resSingle.filteredSignalList[0]), -0.2, -0.1);
        } else {
            db1 = getSignalSingleMeanDB(allTdoaList[judgedIndex][0].tdoa, resSingle.filteredSignalList[0], -0.2, -0.1);
        }
        let db2 = getSignalSingleMeanDB(allTdoaList[judgedIndex][1].tdoa, resSingle.filteredSignalList[0], 0.1, 0.2)
        // let db1 = allTdoaList[judgedIndex][0].tdoa;
        // let db2 = allTdoaList[judgedIndex][1].tdoa;
        let ydistance = calculateVertical(allTdoaList, judgedIndex, db1 > db2);
        if(db1 > db2) {
        // if(db2 - db1 > 0.15){
            // 计算横向（y轴坐标）距离， 利用边接


            if (distance < showYDisatance) {
                location = [distance, ydistance];
            } else {
                location = [distance, frequenceSettingList_cangku[judgedIndex].coordinate[0][1]];
            }

        } else {

            if (distance > frequenceSettingList_cangku[judgedIndex].coordinate[0][0] -showYDisatance) {
                location = [distance + frequenceSettingList_cangku[judgedIndex].coordinate[0][0], ydistance];
            } else {
                location = [distance + frequenceSettingList_cangku[judgedIndex].coordinate[0][0], frequenceSettingList_cangku[judgedIndex].coordinate[0][1]];
            }

        }
    } else if(allTdoaList[judgedIndex].length == 3) {
        // 判断在在前半部分还是后半部分
        // let db1 = getSignalMeanDB(allTdoaList[judgedIndex][0].tdoa, res.filteredSignalList[judgedIndex]);
        // let db2 = getSignalMeanDB(allTdoaList[judgedIndex][2].tdoa, res.filteredSignalList[judgedIndex])
        let db1 = 0;
        if (allTdoaList[judgedIndex][0].tdoa > 0.85) {
            db1 = getSignalSingleMeanDB(allTdoaList[judgedIndex][0].tdoa, resSingleLast.filteredSignalList[0].concat(resSingle.filteredSignalList[0]), -0.2, -0.1);
        } else {
            db1 = getSignalSingleMeanDB(allTdoaList[judgedIndex][0].tdoa, resSingle.filteredSignalList[0], -0.2, -0.1);
        }
        let db2 = getSignalSingleMeanDB(allTdoaList[judgedIndex][Math.min(allTdoaList[judgedIndex].length - 1, 2)].tdoa, resSingle.filteredSignalList[0], 0.1, 0.2)
        // let db1 = allTdoaList[judgedIndex][0].tdoa
        // let db2 = allTdoaList[judgedIndex][2].tdoa
        if (lastAcLoc && (lastAcLoc.x > middleDistance || lastAcLoc.x < frequenceSettingList_cangku[judgedIndex].coordinate[1][0] - middleDistance)) {
            //直接用两头的到达时间算
            let timeDiff = allTdoaList[judgedIndex][2].tdoa - allTdoaList[judgedIndex][0].tdoa
            let distance = fftUtils.getDistanceWithHeight(
                timeDiff, 1,
                frequenceSettingList_cangku[judgedIndex].coordinate[1][0],
                frequenceSettingList_cangku[judgedIndex].timeInterval * 2,
                0.1
            )

            if (distance < showYDisatance) {
                let ydistance = calculateVertical(allTdoaList, judgedIndex, db1 > db2);
                location = [distance, ydistance];
            } else {
                location = [distance, frequenceSettingList_cangku[judgedIndex].coordinate[0][1]];
            }
        } else {
            if(db1 > db2) {
                // if(db2 - db1 > 0.3) {
                let distance = fftUtils.getDistanceWithHeight(
                    allTdoaList[judgedIndex][1].tdoa - allTdoaList[judgedIndex][0].tdoa, 1,  frequenceSettingList_cangku[judgedIndex].totalLength, frequenceSettingList_cangku[judgedIndex].timeInterval, 0.1
                );

                if (distance < showYDisatance) {
                    let ydistance = calculateVertical(allTdoaList, judgedIndex, db1 > db2);
                    location = [distance, ydistance];
                } else {
                    location = [distance, frequenceSettingList_cangku[judgedIndex].coordinate[0][1]];
                }
            } else {
                let distance = fftUtils.getDistanceWithHeight(
                    allTdoaList[judgedIndex][2].tdoa - allTdoaList[judgedIndex][1].tdoa, 1,  frequenceSettingList_cangku[judgedIndex].totalLength, frequenceSettingList_cangku[judgedIndex].timeInterval, 0.1
                );
                if (distance > frequenceSettingList_cangku[judgedIndex].coordinate[0][0] -showYDisatance) {
                    let ydistance = calculateVertical(allTdoaList, judgedIndex, db1 > db2);
                    location = [distance + frequenceSettingList_cangku[judgedIndex].coordinate[0][0], ydistance];
                } else {
                    location = [distance + frequenceSettingList_cangku[judgedIndex].coordinate[0][0], frequenceSettingList_cangku[judgedIndex].coordinate[0][1]];
                }
            }
        }


    } else {
        console.log("到达时间大于4个,需要筛选出3个", allTdoaList[judgedIndex]);
        // todo
    }
    resLast = res;
    resSingleLast = resSingle;
    if (location) {
        // 暂时不用限制跳动
        if(false && acLocNum >= 3) {
            if (Math.abs(location[0] - lastAcLoc.x) <= 3) {
                lastAcLoc = {
                    timestamp: recordStartTime,
                    x: location[0],
                    y: location[1],
                    z: 0,
                    deviation: 0,
                }
            } else {
                lastAcLoc = {
                    timestamp: recordStartTime,
                    x: lastAcLoc.x,
                    y: location[1],
                    z: 0,
                    deviation: 0,
                }
            }
        } else {
            lastAcLoc = {
                timestamp: recordStartTime,
                x: location[0],
                y: location[1],
                z: 0,
                deviation: 0,
            }

            if (lastFuseLoc == null) {
                lastFuseLoc = {
                    timestamp: recordStartTime,
                    x: location[0],
                    y: location[1],
                    z: 0,
                    deviation: 0,
                }
            } else if (Math.abs(lastAcLoc.x - lastFuseLoc.x) < limitDis) {
                lastFuseLoc = {
                    timestamp: recordStartTime,
                    x: (location[0] + lastFuseLoc.x) / 2,
                    y: (location[1] + lastFuseLoc.y) / 2,
                    z: 0,
                    deviation: 0,
                }
                limitDis = 1.5;
            } else {
                limitDis += 1.5;
            }
            acLocNum += 1;
        }
    }
    worker.postMessage({
        'code': 'location',
        'location': lastAcLoc,
        'type': "cangku",
        'timeStamp': timeStamp,
    });
}

//  省博配置更新
let locationSettingList_shengbo = new Array(3).fill(null);

// 湖州研究院配置更新
let locationSettingList_yanjiuyuan = new Array(3).fill(null);
function updateYanjiuyuanSetting(settings) {
    console.log('settings---',settings)
    for (let i = 0; i < frequenceSettingList_yanjiuyuan.length; i++) {
        frequenceSettingList_yanjiuyuan[i] = settings[i];
        locationSettingList_yanjiuyuan[i] = getLocationSetting(settings[i].coordinate, settings[i])
    }
    // 更新二维解算定位配置
    console.log("frequenceSettingList_yanjiuyuan", frequenceSettingList_yanjiuyuan);
    frqDetectList_yanjiuyuan.forEach((detect, index) => {
        // detect.updateSettings(frequenceSettingList_yanjiuyuan[index]);
        detect.updateSettings({
            frequencyStart : frequenceSettingList_yanjiuyuan[index]['frequencyStart'],
            frequencyEnd : frequenceSettingList_yanjiuyuan[index]['frequencyEnd'],
            timeIntervals:frequenceSettingList_yanjiuyuan[index]['timeIntervals']
        });
    })
    resetFuseCache();
    outputLocList = [];
    continue_err_count = 0;
}

function updateShengboSetting(settings) {

    for (let i = 0; i < frequenceSettingList_shengbo.length; i++) {
        frequenceSettingList_shengbo[i] = settings[frequenceSettingList_shengbo.length - 1 - i];
        locationSettingList_shengbo[i] = getLocationSetting(settings[frequenceSettingList_shengbo.length - 1 - i].coordinate, settings[frequenceSettingList_shengbo.length - 1 - i])
    }
    // 更新二维解算定位配置


    console.log("frequenceSettingList_shengbo", frequenceSettingList_shengbo);
    frqDetectList_shengbo.forEach((detect, index) => {
        // detect.updateSettings(frequenceSettingList_shengbo[index]);
    })

    resetFuseCache();
    outputLocList = [];
    continue_err_count = 0;
}

function updateCangKuSetting(settings) {

    for (let i = 0; i < frequenceSettingList_cangku.length; i++) {
        frequenceSettingList_cangku[i] = settings[frequenceSettingList_cangku.length - 1 - i];
        // locationSettingList_shengbo[i] = getLocationSetting(settings[frequenceSettingList_cangku.length - 1 - i].coordinate, settings[frequenceSettingList_cangku.length - 1 - i])
    }
    // // 更新二维解算定位配置
    //
    //
    // console.log("frequenceSettingList_cangku", frequenceSettingList_cangku);
    frqDetectList_cangku.forEach((detect, index) => {
        detect.updateSettings(frequenceSettingList_cangku[index]);
    })
}
let shengboSetting;
let cangkuSetting;
let yanjiuyuanSetting;

worker.onMessage((res) => {
    switch (res.code) {
        case "reset":
            {
                lastPosition = { timestamp: 0, x: 0, y: 0 };
                stepList = [];
                imuDataList = [];
                if (DEBUG) {
                    debugData.stepList = pdr.getSteps(debugData.imuDataList, imuSteps, 9.8, 0.15);
                    // debugData.imuDataList = [];
                    worker.postMessage({
                        code: "debug",
                        data: debugData,
                    });
                    for (let k in debugData) {
                        debugData[k] = [];
                    }
                }
                break;
            }
        case 'frameBuffer1DThreeBeacon':
            {
                let frameBuffer = res.data;
                let inputList = fftUtils.getSingleLeftFromArrayStatic(frameBuffer)
                oneDProcessThreeBeacon(inputList);
                break;
            }
        case 'frameBuffer1D':
            {
                let frameBuffer = res.data;
                let inputList = fftUtils.getSingleLeftFromArrayStatic(frameBuffer)
                oneDProcess(inputList);
                break;
            }
        case 'frameBuffer2d':
            {
                let frameBuffer = res.data;
                let chartData = res.chartData.data;
                let inputData = fftUtils.getSingleLeftFromArrayStatic(frameBuffer);
                // let tdoaInfo = beaconCluster2D.getTDOAInfoWithList(inputList);

                // x, y, z
                let locations = [];
                let tmpZ = acousticHeight;
                for (let i = 0; i < chartData.length; i++) {
                    locations.push([...chartData[i], tmpZ]); // x, y, tmpZ
                }


                twoDProcess(inputData, locations)

                break;
            }
        case 'frameBuffer_stadium':
            {
                let frameBuffer = res.data;
                let inputList = fftUtils.getSingleLeftFromArrayStatic(frameBuffer);
                stadiumProcess(inputList);
                break;
            }
        case 'frameBuffer_suzhou':
            {
                let frameBuffer = res.data;
                let inputList = fftUtils.getSingleLeftFromArrayStatic(frameBuffer);
                suzhouProcess(inputList);
                break;
            }
        case 'frameBuffer_shengbo':
            {
                let frameBuffer = res.data;
                let inputList = fftUtils.getSingleLeftFromArrayStatic(frameBuffer);
                shengboProcess(inputList, res.needFuse);
                break;
            }
        case 'frameBuffer_cangku':
        {
            let frameBuffer = res.data;
            let inputList = fftUtils.getSingleLeftFromArrayStatic(frameBuffer);
            cangkuProcess(inputList);
            break;
        }
        case 'frameBuffer_yanjiuyuan':
            {
                let frameBuffer = res.data;
                let inputList = fftUtils.getSingleLeftFromArrayStatic(frameBuffer);
                yanjiuyuanProcessNew(inputList);
                break;
            }
        case 'inputDataList': // 处理（双声道, 48000 采样）音频文件的直接输入
            {
                // console.log('处理前',res.data)
                let inputData = fftUtils.getSingleLeftFromList(res.data);
                // console.log('处理后',inputData)

                let locType = res.locType;

                if (locType == "一维定位三基站") {
                    oneDProcessThreeBeacon(inputData);
                } else if (locType == "一维定位") {
                    oneDProcess(inputData);
                } else if (locType == "二维定位") {
                    let chartData = res.chartData.data;
                    // 获取tdoa, 改成单声道

                    // x, y, z
                    let locations = [];
                    let tmpZ = acousticHeight;
                    for (let i = 0; i < chartData.length; i++) {
                        locations.push([...chartData[i], tmpZ]); // x, y, tmpZ
                    }

                    // twoDProcess(tdoaInfo, locations);
                    twoDProcess(inputData, locations);
                } else if (locType == "体育馆定位") {
                    stadiumProcess(inputData);
                    break;
                } else if (locType == "苏州定位") {
                    let inputData_suzhou = fftUtils.getSingleFromList(res.data);
                    suzhouProcess(inputData_suzhou);
                    break;
                } else if (locType == "省博定位") {
                    // getSingleFromList 是单声道
                    let inputDatatemp = fftUtils.getSingleLeftFromList(res.data);
                    shengboProcess(inputDatatemp, res.needFuse);
                } else if (locType == "仓库定位") {
                    cangkuProcess(inputData);
                }else if (locType == "湖州研究院定位") {
                    yanjiuyuanProcessNew(inputData);
                    // yanjiuyuanProcess(inputData);
                }
                break;
            }
            // 刷新配置
        case 'updateSetting':
            let locType = res.locType;
            console.log('worker updateSetings',res);
            if (locType == "一维定位三基站" && res.beaconCluster1 != null && res.beaconCluster2 != null) {
                beaconCluster1.updateSettings(res.beaconCluster1);
                beaconCluster2.updateSettings(res.beaconCluster2);
                settings1 = res.beaconCluster1;
                settings2 = res.beaconCluster2;
                alpha = settings1.imuAlpha; // settings1.imuAlpha must be same for confusing
            } else if (locType == "一维定位" && res.beaconCluster1D != null) {
                beaconCluster1D.updateSettings(res.beaconCluster1D);
                settings1D = res.beaconCluster1D;
                alpha = settings1D.imuAlpha;
                imuSteps = settings1D.imuSteps;
                imuMaxDrift = settings1D.imuMaxDrift;
                acousticMaxDrift = settings1D.acousticMaxDrift;
                acousticC64Flag = settings1D.acousticC64Flag;
                acousticHeight = settings1D.acousticHeight;
            } else if (locType == "二维定位" && res.beaconCluster2D != null) {
                beaconCluster2D.updateSettings(res.beaconCluster2D);
                settings2D = res.beaconCluster2D;
                alpha = settings2D.imuAlpha;
                imuSteps = settings2D.imuSteps;
                imuMaxDrift = settings2D.imuMaxDrift;
                acousticMaxDrift = settings2D.acousticMaxDrift;
                acousticC64Flag = settings2D.acousticC64Flag;
                acousticHeight = settings2D.acousticHeight;
                acousticSmoothFlag = settings2D.acousticSmoothFlag;
                acousticMapLimitFlag = settings2D.acousticMapLimitFlag;
                acousticImuStaticFlag = settings2D.acousticImuStaticFlag;
                // 更新配置后， 重置历史位置和移动平均
                outputLocList = [];
                lastCoordinate = null;
            } else if (locType == "苏州定位" && res.setting != null) {
                // 设置二维基站位置参数
                console.log("苏州定位", res.setting);
                let coordinateList = res.setting.coordinate;
                alpha = res.setting.imuAlpha;
                locationSettingList_suzhou = [];
                let locations1 = []
                for (let i = 0; i < 4; i++) {
                    if (coordinateList[i].length <= 2) {
                        coordinateList[i].push(1.5);
                    }
                    let t = coordinateList[i].slice(0);
                    locations1.push(t);
                }
                console.log("location1", locations1);
                locationSettingList_suzhou.push(getLocationSetting(locations1))

                let locations2 = []
                for (let i = 4; i < 8; i++) {
                    if (coordinateList[i].length <= 2) {
                        coordinateList[i].push(1.5);
                    }
                    let t = coordinateList[i].slice(0);
                    locations2.push(t);
                }

                locationSettingList_suzhou.push(getLocationSetting(locations2))
                console.log("locationSettingList_suzhou", locationSettingList_suzhou);
                // 更新一维定位的长度参数
                frequenceSetting3_suzhou.totalLength = Math.abs(coordinateList[8][0] - coordinateList[9][0]);
                frequenceSetting3_suzhou.lngStart = coordinateList[8][0];
                frequenceSetting3_suzhou.lngEnd = coordinateList[9][0];
                frequenceSetting3_suzhou.latStart = coordinateList[8][1];
                frequenceSetting3_suzhou.latEnd = coordinateList[9][1];
                frqDetectList_suzhou[2].updateSettings(frequenceSetting3_suzhou);
            } else if (locType == "省博定位" && res.setting != null) {
                // 设置省博定位位置参数
                console.log("省博定位", res.setting);
                shengboSetting = res.setting;
                // res.setting[0] 在哪一层用单频区分, 目前只用0
                updateShengboSetting(res.setting["settings"][1]); // autoFloorRec为0时不区分单频，1为区分单频
            } else if (locType == "仓库定位" && res.setting != null) {
                // 设置省博定位位置参数
                console.log("仓库定位", res.setting);
                cangkuSetting = res.setting;
                alpha = res.commonParameters.alpha;
                updateCangKuSetting(res.setting["settings"][0]);
            }else if (locType == "湖州研究院定位" && res.setting != null) {
                // 设置湖州定位位置参数
                console.log("湖州研究院定位", res.setting);
                yanjiuyuanSetting = res.setting;
                updateYanjiuyuanSetting(res.setting["settings"][0]);
            }
            break;
        case 'updateRecordTime':
            if (res.recordStartTime != null) {
                recordStartTime = res.recordStartTime;
            }
            break;
        case "pdr":
            imuDataList.push(res.imuData);
            stepList = pdr.getSteps(imuDataList, imuSteps, 9.8);
            let pdrTrack;
            if (res.locationType=="1D"){
                pdrTrack = pdr.getTrack1D(stepList, startPosition, alpha);
            }
            else{
                pdrTrack = pdr.getTrack(stepList, startPosition, alpha,res.locationType);
            }
            if (pdrTrack.length > 5) {
                let startTime = pdrTrack[pdrTrack.length - 5].timestamp;
                let spliceLength = 0;
                for (let i = 0; i < imuDataList.length; i++) {
                    if (imuDataList[i].timestamp <= startTime) {
                        spliceLength++;
                    }
                }
                imuDataList.splice(0, spliceLength);
                startPosition = pdrTrack[pdrTrack.length - 5];
            }

            track = [];
            for (let i = Math.max(pdrTrack.length - 5, 0); i < pdrTrack.length; i++) {
                track.push([pdrTrack[i].x, pdrTrack[i].y]);
            }
            worker.postMessage({
                "code": "pdr_track",
                "track": track,
            });
            break;
        case "fuse":
            if (res.dataType === "imu") {
                imuDataList.push(res.imuData);
                stepList = pdr.getSteps(imuDataList, imuSteps, 9.8);
            } else if (res.dataType === "imuDataList") {
                imuDataList = res.imuDataList;
                stepList = pdr.getSteps(imuDataList, imuSteps, 9.8);
            } else if (res.dataType === "acloc") {
                aclocTrack.push(res.aclocPosition);
                // let startPosition = { timestamp: 0, x: 0, y: 0 };
                if (startPosition.timestamp === 0) {
                    // break;
                    startPosition.timestamp = res.aclocPosition.timestamp;
                    startPosition.x = res.aclocPosition.x;
                    startPosition.y = res.aclocPosition.y;
                }
            }
            isStatic = pdr.isStatic(imuDataList, 30);
            if (res.acoOnly) {
                console.log(isStatic);
                if (isStatic || aclocTrack.length == 0) {
                    worker.postMessage({
                        "code": "fused-track",
                        "track": [
                            [lastPosition.x, lastPosition.y]
                        ],
                    });
                } else {
                    lastPosition = aclocTrack[aclocTrack.length - 1];
                    worker.postMessage({
                        "code": "fused-track",
                        "track": [
                            [lastPosition.x, lastPosition.y]
                        ],
                    });
                }

                break;
            }
            if (res.dataType === "startPosition") {
                startPosition = res.startPosition;
                // startPosition = { timestamp: 0, x: 0, y: 0 };
                stepList = [];
                imuDataList = [];
                aclocTrack = [];
                track = [];
                fakeAclocTrack = false;
            }
            if (startPosition.timestamp === 0) {
                break;
            }

            let fusedTrack = fuse.exkalmandme(aclocTrack, stepList, alpha, 100, startPosition, imuMaxDrift); // startPosition设置初始值
            // let fusedTrack = fuse.weightedMean(aclocTrack, stepList, alpha, 100, startPosition); // startPosition设置初始值
            if (aclocTrack.length === 0) {
                fusedTrack = pdr.getTrack(stepList, startPosition, alpha);
            }
            if (fusedTrack.length > 5) {
                let startTime = fusedTrack[fusedTrack.length - 5].timestamp;
                let spliceLength = 0;
                for (let i = 0; i < imuDataList.length; i++) {
                    if (imuDataList[i].timestamp <= startTime) {
                        spliceLength++;
                    }
                }
                imuDataList.splice(0, spliceLength);

                spliceLength = 0;
                for (let i = 0; i < aclocTrack.length; i++) {
                    if (aclocTrack[i].timestamp <= startTime) {
                        spliceLength++;
                    }
                }
                aclocTrack.splice(0, spliceLength);

                startPosition = fusedTrack[fusedTrack.length - 5];
                lastPosition = fusedTrack[fusedTrack.length - 1];
            }

            track = [];
            // for (let i = Math.max(fusedTrack.length - 5, 0); i < fusedTrack.length; i++) {
            //     track.push([fusedTrack[i].x, fusedTrack[i].y]);
            // }
            for (let i = Math.max(fusedTrack.length - 1, 0); i < fusedTrack.length; i++) {
                track.push([fusedTrack[i].x, fusedTrack[i].y]);
            }

            if (fakeAclocTrack && stepList.length > 0 &&
                (aclocTrack.length === 0 ||
                    aclocTrack[aclocTrack.length - 1].timestamp < stepList[stepList.length - 1].timestamp - 500)
            ) {
                if (fusedTrack.length > 0) {
                    aclocTrack.push({
                        timestamp: new Date().getTime(),
                        x: fusedTrack[fusedTrack.length - 1].x,
                        y: fusedTrack[fusedTrack.length - 1].y,
                        conf: 1, // 误差值（反置信度）
                    });
                } else {
                    aclocTrack.push({
                        timestamp: new Date().getTime(),
                        x: 0,
                        y: 0,
                        conf: 1, // 误差值（反置信度）
                    });
                }
            }
            worker.postMessage({
                "code": "fused-track",
                "track": track,
            });
            break;
        case "timeCalibrate":
            timeDiff = res.timestamp - new Date().getTime();
            console.log("set timeDiff=" + timeDiff);
            break;
        case "updateStepList":
            if (res.dataType == "imuDataList") {
                imuDataList = [...imuDataList, ...res.imuDataList];
            } else if (res.dataType == "imuData") {
                imuDataList.push(res.imuData);
            }
            if (res.locationType == "仓库定位") {
                imu1DLocation();
            }
            break
        default:
            break;
    }
})

function imu1DLocation(){
    if (imuDataList.length<10){
        return;
    }
    let new_stepList = pdr.getSteps(imuDataList, 0.35, 9.8, 0.7);
    if (new_stepList.length<1){
        return;
    }
    let splice_num =0;
    for(let i=0;i<imuDataList.length;i++){
        if (imuDataList[i].timestamp<new_stepList[new_stepList.length-1].timestamp){
            splice_num+=1;
        }
        else{
            break;
        }
    }
    imuDataList.splice(0,splice_num);
    stepList = [...stepList, ...new_stepList];
    splice_num =0;
    for (let i = 0; i < stepList.length; i++) {
        if (lastFuseLoc != null && stepList[i].timestamp < lastFuseLoc.timestamp) {
            splice_num += 1;
        } else {
            break;
        }
    }
    stepList.splice(0,splice_num);

    let pdrTrack;
    if (lastFuseLoc == null) {
        pdrTrack = pdr.getTrack(stepList, {
            timestamp: 0,
            x: 0,
            y: 0,
            deviation: 0
        }, alpha);
    } else {
        pdrTrack = pdr.getTrack(stepList, lastFuseLoc, alpha);
    }
    pdrTrack = getLimitTrackByPassageway(pdrTrack);
    if (pdrTrack.length > 0) {
        let newImuLoc = pdrTrack[pdrTrack.length - 1];
        if (lastImuLoc != null && Math.abs(newImuLoc.x - lastImuLoc.x) > 1.5) {
            newImuLoc.x = (lastImuLoc.x + newImuLoc.x) / 2;
        }

        newImuLoc.x = Math.min(newImuLoc.x, 23);
        newImuLoc.x = Math.max(newImuLoc.x, 0);

        lastImuLoc = newImuLoc;
        if (lastFuseLoc != null) {
            if (!hasInitIMUY) {
                newImuLoc.y = lastFuseLoc.y;
                hasInitIMUY = true;
            }
            worker.postMessage({
                'code': 'location',
                'location': newImuLoc,
                'type': 'Fusion',
                'timeStamp': newImuLoc,
            });
            lastFuseLoc.timestamp = newImuLoc.timestamp;
            lastFuseLoc.x = newImuLoc.x;
            lastFuseLoc.y = newImuLoc.y;
        }
    }
}

function getMaxAndIndex(a) {
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

function getAbsMaxAndIndex(a) {
    if (!a || a.length == 0) {
        return {
            index: -1,
            max: -1
        }
    }
    let indexOfMax = 0;
    let tempMax = Math.abs(a[0]);
    for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i]) > tempMax) {
            tempMax = Math.abs(a[i]);
            indexOfMax = i;
        }
    }

    return {
        "index": indexOfMax,
        "max": tempMax
    }
}

function getAbsMean(a) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += Math.abs(a[i]);
    }
    let mean = sum / a.length;

    return mean;
}

// 判断区域编号, type 1 使用单频滤波器，type 2 使用chirp滤波器
function getJudgedNumber(signal, filterParameterList, type = 1) {
    let res = {};
    // 滤波后的信号
    let filteredSignalList = [];

    // filterParameterList.forEach(prameter => {
    //     filteredSignalList.push(fftUtils.FIRFilter(signal, prameter));
    // })
    // console.log("切比雪夫");
    if (type == 1) {
        signalFilterList.forEach((bp) => {
            let output = new Array(signal.length);
            for (let i = 0; i < signal.length; i++) {
                output[i] = bp.filter(signal[i]);
            }
            filteredSignalList.push(output);
        })
    } else if (type == 2) {
        chirpFilterList.forEach((bp) => {
            let output = new Array(signal.length);
            for (let i = 0; i < signal.length; i++) {
                output[i] = bp.filter(signal[i]);
            }
            filteredSignalList.push(output);
        })
    }

    // 暂存平均值
    let filteredSignalMeanList = [];


    for (let i = 0; i < filteredSignalList.length; i++) {
        filteredSignalMeanList.push(getAbsMean(filteredSignalList[i]));
    }

    let signalMaxAndIndex = getMaxAndIndex(filteredSignalMeanList);
    res.signalMaxAndIndex = signalMaxAndIndex;
    res.meanList = filteredSignalMeanList;
    res.filteredSignalList = filteredSignalList;
    return res;
}

function judgeShengboFloor(signal) {
    let res = {};
    // 滤波后的信号
    let filteredSignalList = [];

    shengboFilterList.forEach((bp) => {
        let output = new Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            output[i] = bp.filter(signal[i]);
        }
        filteredSignalList.push(output);
    })

    // 暂存平均值
    let filteredSignalMeanList = [];

    for (let i = 0; i < filteredSignalList.length; i++) {
        filteredSignalMeanList.push(getAbsMean(filteredSignalList[i]));
    }

    let signalMaxAndIndex = getMaxAndIndex(filteredSignalMeanList);
    res.signalMaxAndIndex = signalMaxAndIndex;
    res.meanList = filteredSignalMeanList;
    res.filteredSignalList = filteredSignalList

    return res;


}

function filterSignal_suzhou(signal, filterParameterList) {
    let res = {};
    // 滤波后的信号
    let filteredSignalList = [];

    chirpFilterList_suzhou.forEach((bp) => {
        let output = new Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            // 未滤波
            // output[i] = bp.filter(signal[i]);
            output[i] = signal[i];
        }
        filteredSignalList.push(output);
    })
    res.filteredSignalList = filteredSignalList;
    return res;
}

function filterSignal_shengbo(signal) {
    let res = {};
    // 滤波后的信号
    let filteredSignalList = [];

    chirpFilterList_shengbo.forEach((bp) => {
        let output = new Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            // output[i] = bp.filter(signal[i]);
            output[i] = signal[i];
        }
        filteredSignalList.push(output);
    })
    res.filteredSignalList = filteredSignalList;
    return res;
}


function filterSignal_yanjiuyuan(signal) {
    let res = {};
    // 滤波后的信号
    let filteredSignalList = [];

    chirpFilterList_yanjiuyuan.forEach((bp) => {
        let output = new Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            // output[i] = bp.filter(signal[i]);
            output[i] = signal[i];
            // console.log(signal[i])
        }
        filteredSignalList.push(output);
    })
    res.filteredSignalList = filteredSignalList;
    return res;
}

function filterSignal_cangku(signal) {
    let res = {};
    // 滤波后的信号
    let filteredSignalList = [];

    chirpFilterList_cangku.forEach((bp) => {
        let output = new Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            output[i] = bp.filter(signal[i]);
            // output[i] = signal[i];
        }
        filteredSignalList.push(output);
    })
    res.filteredSignalList = filteredSignalList;
    return res;
}

function filterSignalSingle_cangku(signal) {
    let res = {};
    // 滤波后的信号
    let bp = fftUtils.createBandPassFilter(48000, 16, 18800, 19200);
    let filteredSignalList = [];
    let output = new Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
        output[i] = bp.filter(signal[i]);
        // output[i] = signal[i];
    }
    filteredSignalList.push(output);
    res.filteredSignalList = filteredSignalList;
    return res;
}

// 取数值小数
function fract(num) {
    return num - Math.trunc(num);
}

function getLocationSetting(locations, setting) {
    // x, y, z
    let height = setting != null ? setting.acousticHeight : 2.7;
    if (locations[0].length < 3) {
        for (let i = 0; i < locations.length; i++) {
            locations[i].push(height)
        }
    }
    let ranges = [
        [100, -1],
        [100, -1],
        [100, -1]
    ];

    for (let i = 0; i < locations.length; i++) {
        let loc = locations[i];
        for (let j = 0; j < 3; j++) {
            ranges[j][0] = Math.min(ranges[j][0], loc[j]);
            ranges[j][1] = Math.max(ranges[j][1], loc[j]);
        }
    }

    let settings = {
        period: 1.002, // 同一批信号首位间隔时间
        beaconsLocation: locations,
        locations: locations,
        xRange: ranges[0],
        yRange: ranges[1],
        zRange: ranges[2],
        totalLength: Math.max(ranges[0][1] - ranges[0][0], ranges[1][1] - ranges[1][0], ranges[2][1] - ranges[2][0]), // 暂时用x轴  的长度
        lastCoordinate: null,
        radius: 2.5,
        interval: 0.15,
        precision: 0.1,
        acousticMapLimitFlag: 1
    }
    if (setting && setting.limitPoly) {
        settings.limitPoly = setting.limitPoly;
    }
    return settings;
}
// let closeLen = 1;
// let point1 = [0, 6.892];
// let point2 = [12.5, 6.892];
// // let point3 = [12.5 / 2, (6.892 - closeLen / 2)];
// // let point3 = [13.5, 6.892];
// let point3 = [-1, 6.892];

// let point3AreaClose = areaClose(point3, point1, point2, closeLen);
// console.log("point3AreaClose:", point3AreaClose);
// for settings in all settings
// for closeCoordinateItem in closeCoordinate
// closeCoordinate([x, y], [closeCoordinate[0], closeCoordinate[1]], [closeCoordinate[2], closeCoordinate[3]], closeCoordinate[4])
function areaClose(point3, point1, point2, closeLen, closeCPFlag) {
    let x1 = point1[0];
    let y1 = point1[1];
    let x2 = point2[0];
    let y2 = point2[1];
    let x3 = point3[0];
    let y3 = point3[1];
    // (y4 - y3) * (y2 - y1) + (x4 - x3) * (x2 - x1) = 0 // 直线34和12垂直
    // (y4 - y1) * (x2 - x1) = (y2 - y1) * (x4 - x1) // 直线14和直线12平行
    // a1 * x + b1 * y = c1
    // a2 * x + b2 * y = c2
    let a1 = x2 - x1;
    let b1 = y2 - y1;
    let c1 = x3 * (x2 - x1) + y3 * (y2 - y1);
    let a2 = y2 - y1;
    let b2 = x1 - x2;
    let c2 = y1 * (x1 - x2) + x1 * (y2 - y1);
    let x4 = (c2 * b1 - c1 * b2) / (a2 * b1 - a1 * b2);
    let y4 = (c2 * a1 - c1 * a2) / (b2 * a1 - b1 * a2);
    // console.log("(x4,y4)->(", x4, ",", y4, ")");
    // 判断point4在线段12内
    let l12 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    let l14 = Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1));
    let l24 = Math.sqrt((x4 - x2) * (x4 - x2) + (y4 - y2) * (y4 - y2));
    let l34 = Math.sqrt((x4 - x3) * (x4 - x3) + (y4 - y3) * (y4 - y3));
    // 线段12内
    if (l14 + l24 == l12) {
        if (l34 <= closeLen) {
            // if (closeCPFlag == 1) {
            //     return [(x1 + x2) / 2, (y1 + y2) / 2];
            // } else {
            //     return [x4, y4];
            // }
            return [x4, y4, x1, y1, x2, y2]; // 是否吸附至中心点

        }
    }
    return [x3, y3, null, null, null, null];
}

function getlimitedRadius(startTime, endTime) {
    if (endTime == null) {
        console.log("时间为null");
        return 0;
    }
    if (stepList.length == 0) {
        return 0;
    }

    let discard_ts = 0;
    let step_length = 0;
    for (let i = 0; i < stepList.length; i++) {
        if (stepList[i].timestamp < startTime) {
            discard_ts = stepList[i].timestamp;
            continue;
        }
        if (stepList[i].timestamp > endTime) {
            if (i > 0) {
                step_length += stepList[i].step_length;
            }
            break;
        }
        step_length += stepList[i].step_length;
    }
    if (discard_ts >= imuDataList[0].timestamp) {
        // 弃用的index for imuDataList
        let discard_index = 0;
        for (let i = 0; i < imuDataList.length; i++) {
            if (discard_ts >= imuDataList[i].timestamp) {
                discard_index++;
            } else {
                break;
            }
        }
        imuDataList = imuDataList.splice(discard_index + 1);
    }
    return step_length;
}

function getlimitedRadius_V2(startTime, endTime) {
    if (stepList == null) {
        // not init imu
        return 1024;
    }
    if (stepList.length <= 1) {
        return 0;
    }

    let discard_ts = 0;
    let offset = {
        x: 0,
        y: 0,
    }
    for (let i = 0; i < stepList.length - 1; i++) {
        //起始点
        if (stepList[i].timestamp < startTime && stepList[i + 1].timestamp >= startTime) {
            discard_ts = stepList[i].timestamp;
            offset.x += stepList[i].angle_sin * stepList[i].step_length *
                (stepList[i + 1].timestamp - startTime) /
                (stepList[i + 1].timestamp - stepList[i].timestamp);
            offset.y += stepList[i].angle_cos * stepList[i].step_length *
                (stepList[i + 1].timestamp - startTime) /
                (stepList[i + 1].timestamp - stepList[i].timestamp);
        }
        //中间点
        else if (stepList[i].timestamp > startTime && stepList[i + 1].timestamp <= endTime) {

            offset.x += stepList[i].angle_sin * stepList[i].step_length;
            offset.y += stepList[i].angle_cos * stepList[i].step_length;
        }
        //结束点
        else if (stepList[i].timestamp < endTime && stepList[i + 1].timestamp >= endTime) {
            offset.x += stepList[i].angle_sin * stepList[i].step_length *
                (endTime - stepList[i].timestamp) /
                (stepList[i + 1].timestamp - stepList[i].timestamp);
            offset.y += stepList[i].angle_cos * stepList[i].step_length *
                (endTime - stepList[i].timestamp) /
                (stepList[i + 1].timestamp - stepList[i].timestamp);

            break;
        }
        //异常?
        else {
            continue;
        }
    }
    if (discard_ts >= imuDataList[0].timestamp) {
        // 弃用的index for imuDataList
        let discard_index = 0;
        for (let i = 0; i < imuDataList.length; i++) {
            if (discard_ts >= imuDataList[i].timestamp) {
                discard_index++;
            } else {
                break;
            }
        }
        imuDataList = imuDataList.splice(discard_index);
    }
    return Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));
}

function getPDROffset(startTime, endTime, alpha) {
    let result = { x: 0, y: 0, timestamp: 0 };
    let trans = [
        [Math.cos(-alpha * Math.PI / 180), -Math.sin(-alpha * Math.PI / 180)],
        [Math.sin(-alpha * Math.PI / 180), Math.cos(-alpha * Math.PI / 180)]
    ];

    if (stepList.length == 0) {
        return result;
    }

    for (let i = 0; i < stepList.length; i++) {
        if (stepList[i].timestamp < startTime) {
            continue;
        }
        if (stepList[i].timestamp > endTime) {
            if (i > 0) {
                let delta_y = stepList[i].step_length * Math.cos(stepList[i].angle_cos * Math.PI / 180);
                let delta_x = stepList[i].step_length * Math.sin(stepList[i].angle_sin * Math.PI / 180);

                let dx = delta_x * trans[0][0] + delta_y * trans[1][0];
                let dy = delta_x * trans[0][1] + delta_y * trans[1][1];

                result.x += dx;
                result.y += dy;
                result.timestamp = stepList[i].timestamp;
            }
            break;
        }
        let delta_y = stepList[i].step_length * Math.cos(stepList[i].angle_cos * Math.PI / 180);
        let delta_x = stepList[i].step_length * Math.sin(stepList[i].angle_sin * Math.PI / 180);

        let dx = delta_x * trans[0][0] + delta_y * trans[1][0];
        let dy = delta_x * trans[0][1] + delta_y * trans[1][1];

        result.x += dx;
        result.y += dy;
        result.timestamp = stepList[i].timestamp;
    }

    return result;
}

function limitedByStep(lastLocation, newLocation) {
    if (DEBUG_LOG) {
        worker.postMessage({
            code: "log",
            msg: "Start limitedByStep",
        });
    }
    stepList = pdr.getSteps(imuDataList, imuSteps, 9.8, 0.15);

    let radius = getlimitedRadius(lastLocation.timestamp, newLocation.timestamp);
    let acousticOffset = {
        x: newLocation.x - lastLocation.x,
        y: newLocation.y - lastLocation.y,
    };
    let acousticStepLength = Math.sqrt(Math.pow(acousticOffset.x, 2) + Math.pow(acousticOffset.y, 2));
    if (DEBUG_LOG) {
        worker.postMessage({
            code: "log",
            msg: "limited " + acousticStepLength + " vs " + radius,
        });
    }
    if (radius <= 0.3 && acousticStepLength <= 2) {
        tmpLocationSum.x += newLocation.x;
        tmpLocationSum.y += newLocation.y;
        tmpLocationSum.n += 1;
        return {
            timestamp: newLocation.timestamp,
            x: tmpLocationSum.x / tmpLocationSum.n,
            y: tmpLocationSum.y / tmpLocationSum.n,
        }

    } else {
        tmpLocationSum = {
            x: 0,
            y: 0,
            n: 0
        }
    }
    if (radius * 2 <= acousticStepLength) {
        // 用pdr预测定位
        // (last + pdrOffet) - new = pdrOffet - (new - last) = pdrOffet - acousticOffset
        // let PDROffset = getPDROffset(lastLocation.timestamp, newLocation.timestamp, 320);
        // if (PDROffset.timestamp > 0) {
        //     return {
        //         timestamp: PDROffset.timestamp,
        //         x: lastPosition.x + PDROffset.x,
        //         y: lastPosition.y + PDROffset.y,
        //         z: lastPosition.z,
        //         deviation: lastPosition.deviation,
        //     }
        // }

        // 根据偏移加权平均
        // let new_w = radius/acousticStepLength;
        // let last_w = 1 - new_w;
        // return {
        //     timestamp: last_w*lastLocation.timestamp+new_w*newLocation.timestamp,
        //     x: last_w*lastLocation.x+new_w*newLocation.x,
        //     y:last_w*lastLocation.y+new_w*newLocation.y,
        // }
        return lastLocation;
    } else {
        return newLocation;
    }
}

function ressetImuCache() {
    stepList = [];
    imuDataList = [];
}

function resetFuseCache() {
    ressetImuCache();

    startPosition = { timestamp: 0, x: 0, y: 0 };
    lastPosition = { timestamp: 0, x: 0, y: 0 };
}


function getLimit2y(y) {
    if (y < 2) return 0;
    if (y < 6) return 4;
    if (y < 10) return 8;
    if (y < 14) return 12;
    if (y < 18) return 16;
    return 20;
}

function getLimitTrackByPassageway(srcTrack) {
    let dstTrack = [];
    let offset = 0;
    for (let i = 0; i < srcTrack.length; i++) {
        let position = srcTrack[i];
        if (position.x < 2 || position.x > 18) {
            // y is unlimited
            position.y -= offset;
        } else {
            // y is limited
            let dstY = getLimit2y(position.y - offset);
            offset = position.y - dstY;
            position.y = dstY;
        }
        dstTrack.push(position);
    }
    return dstTrack;
}
