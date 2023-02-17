// app.js



let commonSetting = {
    "vMaxTh": 0.2,
    "vRatioTh": 0.3,
    "pMaxTh": 2047,
    "maxRatioTh": 1.5,
    "durationTime": 0.04,
    "soundSpeed": 340,
    "timeInterval": 0.150,
}

let baseSetting1 = {
    ...commonSetting,
    "frequencyStart": 17000,
    "frequencyEnd": 18500,
}

let baseSetting2 = {
    ...commonSetting,
    "frequencyStart": 21000,
    "frequencyEnd": 23000,
}
// 每组，组内的距离
let coordinateList = [
    [[0,0], [15,0], [30,0]],
    [[0,0], [30,0], [60,0]],
    [[0,0], [34.55,0], [64.5,0]],
    [[0,0], [23,0], [62,0]],
    [[0,0], [30,0], [71.5,0]],
]


// 每组， 经纬度
let lnglatList = [
    [[115.86981470, 28.69670330], [115.86988550, 28.69687183], [115.86988250, 28.69686700]],
    [[115.87628483, 28.70429217], [115.87628517, 28.70429283], [115.87614133, 28.70405433]],
    [[115.87784250, 28.70731450], [115.87797167, 28.70755400], [115.87797117, 28.70755467]],
    [[115.88186167, 28.71444633], [115.88202300, 28.71472217], [115.88225540, 28.71487140]],
    [[115.88315700, 28.72471783], [115.88310950, 28.72508633], [115.88311150, 28.72509117]]
]

// 每组 距离跑道中心
let heightList = [
    [3, 3],
    [7, 9],
    [10.5, 9.5],
    [8.5, 7.5],
    [3, 3],
]


let settingList = [];

for (let i = 0; i < coordinateList.length; i++) {
    let setting1 = {...baseSetting1};
    let setting2 = {...baseSetting2};
    let coordinates = coordinateList[i];
    let lnglats = lnglatList[i];
    setting1["coordinate"] = [coordinates[0], coordinates[1]]
    setting2["coordinate"] = [coordinates[1], coordinates[2]]

    setting1["lngStart"] = lnglats[0][0]
    setting1["lngEnd"] = lnglats[1][0]
    setting1["latStart"] = lnglats[0][1]
    setting1["latEnd"] = lnglats[1][1]

    setting2["lngStart"] = lnglats[1][0]
    setting2["lngEnd"] = lnglats[2][0]
    setting2["latStart"] = lnglats[1][1]
    setting2["latEnd"] = lnglats[2][1]

    setting1["totalLength"] = coordinates[1][0] - coordinates[0][0]
    setting2["totalLength"] = coordinates[2][0] - coordinates[1][0]


    setting1.height = heightList[i][0];
    setting2.height = heightList[i][1];

    settingList.push([setting1, setting2])
}

console.log(settingList);

// 基站序号和单频频率关系
//基站群频率(19.4,19.7,20.0,20.3,20.6)和编号(0,1,2,3,4)
// settingList[0]       19250 - 19550
// settingsList[1]      19550 - 19850
// settingsList[2]      19850 - 20150
// settingsList[3]      20150 - 20450
// settingsList[4]      20450 - 20750

App({
    onLaunch() {

    },
    store: {
        launchShow: true,
        recorderManager: null, //小程序全局录音管理
        startRecorderFlag: false, //开始录音标志
        worker: null,
        tdoa1: 0,
        tdoa2: 0,
        distance1: '',
        distance2: '',
        setting1: {
            "vMaxTh": 0.5,
            "vRatioTh": 0.3,
            "pMaxTh": 1900,
            "maxRatioTh": 8,
            "frequencyStart": 17000,
            "frequencyEnd": 18500,
            "durationTime": 0.04,
            "totalLength": 12,
            "soundSpeed": 340,
            "lngStart": 120.000600,
            "lngEnd": 120.000700,
            "latStart": 30.000600,
            "latEnd": 30.000600,
            "timeInterval": 0.150,
            "coordinate": [
                [0, 0],
                [12, 0]
            ]
        },
        setting2: {
            "vMaxTh": 0.5,
            "vRatioTh": 0.3,
            "pMaxTh": 1900,
            "maxRatioTh": 8,
            "frequencyStart": 21000,
            "frequencyEnd": 23000,
            "durationTime": 0.04,
            "totalLength": 12,
            "soundSpeed": 340.0,
            "lngStart": 120.000700,
            "lngEnd": 120.000800,
            "latStart": 30.000600,
            "latEnd": 30.000600,
            "timeInterval": 0.150,
            "coordinate": [
                [15, 0],
                [27, 0]
            ]
        },
        settingList: settingList,
    }
})
