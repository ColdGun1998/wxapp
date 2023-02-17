const fftUtilClass = require('../../dist/fftUtil');
const path = require('path');
const fs = require('fs');

fftUtil = new fftUtilClass();
// 生成基准信号
const signalRef = fftUtil.generateSignalRef()

// x, y, z
let locations = [
    [
        0,
        0,
        2
    ],
    [
        0,
        3.5,
        2
    ],
    [
        0,
        8.8,
        2
    ],
    [
        3.5,
        8.8,
        2
    ],
    [
        3.5,
        3.5,
        2
    ],
    [
        3.5,
        0,
        2
    ]
]

let ranges = [
    [100, -1],
    [100, -1],
    [100, -1]
];

for (let i = 0; i < locations.length; i++) {
    let loc = locations[i];
    for(let j = 0; j < 3; j++) {
        ranges[j][0] = Math.min(ranges[j][0], loc[j]);
        ranges[j][1] = Math.max(ranges[j][1], loc[j]);
    }
}

let settings = {
    period: 1.002,  // 同一批信号首位间隔时间
    beaconsLocation: locations,
    locations: locations,
    xRange: ranges[0],
    yRange: ranges[1],
    zRange: ranges[2],
    totalLength: Math.max(ranges[0][1] - ranges[0][0], ranges[1][1] - ranges[1][0], ranges[2][1] - ranges[2][0]), // 暂时用x轴的长度
    lastCoordinate: null,
    radius: 3,
    interval: 0.15,
    precision: 0.2,
}

let result = fftUtilClass.calculateLocation([3.324, 3.475, 3.623, 3.789, 3.938, 4.074], settings);
console.log(result)
