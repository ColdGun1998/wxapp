// index.js
// 获取应用实例
const app = getApp()

Page({
    data: {
        //声波定位参数
        startRecorderFlag: false,
        waitAccel: true,
        imuTimestamp: 0,
        acceleration: null,
        orientation: null,

        positionData: [0, 0, 0],
        recordResult: '',

        // 地图参数：
        mapWidth: 8300,
        mapHeight: 10800,
    },
    getChartData2D() {
        return {
            "series": [{
                    "name": "beacon坐标",
                    "data": [
                        [
                            0,
                            0
                        ],
                        [
                            0,
                            9.533
                        ],
                        [
                            0,
                            16.713
                        ],
                        [
                            11.142,
                            17.209
                        ],
                        [
                            11.142,
                            9.733
                        ],
                        [
                            11.142,
                            0
                        ]

                    ]
                },
                {
                    "name": "定位位置",
                    "data": [
                        [
                            0.1,
                            0
                        ],
                    ]
                }
            ]
        }
    },

    testWithFile() {
        let DEBUGDOWNLOADSERVER = 'http://192.168.124.8:8080/';
        let url =
            DEBUGDOWNLOADSERVER +
            "static/data/acoustic_loc/20220215/Recording%20%23202.wav";
        console.log("url:" + url);
        wx.downloadFile({
            url: url, //仅为示例，并非真实的资源
            success: (res) => {
                // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，文件是否work需确认
                if (res.statusCode == 200) {
                    console.log("成功下载文件" + res.tempFilePath);
                    this.readFile(res.tempFilePath, 0);
                }
            },
        });
    },

    // 文件读取
    readFile(filePath, countNumber) {

        if (countNumber == null) return;
        // if (countNumber >= 1000) return;
        const fs = wx.getFileSystemManager();
        fs.readFile({
            filePath: `${filePath}`,
            encoding: "binary",
            position: 44 + countNumber * 9600, // wav header byte 44
            length: 9600,
            success: (res) => {
                let inputList = [];
                for (let i = 0; i < res.data.length; i++) {
                    inputList.push(res.data.charCodeAt(i));
                }
                let chartData = this.getChartData2D();
                app.store.worker.postMessage({
                    code: "inputDataList",
                    data: inputList.slice(0),
                    locType: "二维定位",
                    chartData: JSON.parse(JSON.stringify(chartData.series[0])),
                });
                this.readFile(filePath, countNumber + 1);
            },
            fail(res) {
                console.log(res);
            },
        });
    },
    onLoad() {
        //声波定位
        this.initRecorder()
            // this.startRecorder()
        this.initSensorListening()
    },
    onUnload() {
        //停止录音定位
        this.stopRecorder()
        this.stopSensorListening()
    },
    /*
      声波定位
    */
    // 初始录音定位
    initRecorder() {
        app.store.recorderManager = wx.getRecorderManager()
        app.store.recorderManager.onFrameRecorded((res) => {
            const {
                frameBuffer
            } = res
            console.log("onFrameRecorded: " + JSON.stringify(res));
            this.setData({
                recordResult: JSON.stringify(res)
            })


            if (app.store.worker) {
                let chartData = this.getChartData2D();
                app.store.worker.postMessage({
                    'code': 'frameBuffer2d',
                    'data': frameBuffer.slice(0),
                    'chartData': JSON.parse(JSON.stringify(chartData.series[0])),
                });
            }
        })

        app.store.recorderManager.onStart(() => {
            console.log('recorder start')
        })
        app.store.recorderManager.onPause(() => {
            console.log('recorder pause')
        })
        app.store.recorderManager.onStop((res) => {
            console.log('recorder stop', res)
        })

        app.store.recorderManager.onError(() => {
            console.log('recorder onError')
        })

    },

    // 开始录音定位
    startRecorder() {
        let testWithFileFlag = true;
        if (app.store.startRecorderFlag) {
            return
        }
        let that = this;
        app.store.startRecorderFlag = true

        app.store.worker = wx.createWorker('workers/worker.js', {
            useExperimentalWorker: true
        })
        app.store.worker.onProcessKilled(() => {
            // 重新创建一个worker
            app.store.worker = wx.createWorker("workers/worker.js", {
                useExperimentalWorker: true
            });
            // 定位监听回调
            console.log('定位监听回调');
            that.initWorkerListener();
        })
        if (app.store.worker) {
            let setting2D = {
                vMaxTh: 0.5,
                vRatioTh: 0.3,
                pMaxTh: 2047,
                maxRatioTh: 5,
                frequencyStart: 17000,
                frequencyEnd: 19000,
                durationTime: 0.03,
                totalLength: 8.4,
                soundSpeed: 340,
                lngStart: 1588,
                lngEnd: 1529,
                latStart: 286,
                latEnd: 403,
                timeInterval: 0.15,
                coordinate: this.getChartData2D()["series"][0]["data"],
                imuAlpha: 0,
                imuSteps: 0.5,
                imuMaxDrift: 3,
                acousticMaxDrift: 2.5,
                acousticC64Flag: 0,
                acousticHeight: 2.7,
                acousticSmoothFlag: 1,
                acousticMapLimitFlag: 1,
                acousticImuStaticFlag: 1,
            }
            app.store.worker.postMessage({
                    code: "updateSetting",
                    locType: "二维定位",
                    beaconCluster2D: setting2D,
                })
                // 定位监听回调
            console.log('定位监听回调');
            that.initWorkerListener()
        }
        if (testWithFileFlag) {
            this.testWithFile();
        } else {
            let param = {
                format: "pcm",
                duration: 600000,
                numberOfChannels: 2,
                sampleRate: 48000,
                encodeBitRate: 320000,
                frameSize: 36
            }
            app.store.recorderManager.start(param)
        }
        this.setData({
            startRecorderFlag: app.store.startRecorderFlag
        })
    },

    //监听定位数据回调
    initWorkerListener() {
        console.log(app.store.worker);
        if (app.store.worker) {
            app.store.worker.onMessage(res => {
                // console.log(res);
                switch (res.code) {
                    case 'location':
                        if (res.location != null) {
                            console.log("location:", res.location);
                        }
                        break;
                    case 'coordinate':
                        console.log("coordinate:", res.coordinate);
                        this.setData({
                                positionData: res.coordinate
                            })
                            //位置坐标返回，执行移动动画


                        break;
                    default:
                        break;
                }
            });
        }
    },

    // 停止录音定位
    stopRecorder() {
        app.store.startRecorderFlag = false
        app.store.recorderManager.stop()
        if (app.store.worker != null) {
            app.store.worker.terminate()
            app.store.worker = null
        }

        this.setData({
            startRecorderFlag: app.store.startRecorderFlag
        })
    },

    initSensorListening() {
        //加速度计 20ms/次
        wx.startAccelerometer({
            interval: "game",
        });

        // 设备方向
        wx.startDeviceMotionListening({
            interval: "game",
        });

        wx.onAccelerometerChange((res) => {
            if (this.waitAccel === true) {
                this.imuTimeStamp = new Date().getTime();
                this.acceleration = {
                    timestamp: this.imuTimeStamp,
                    x: res.x,
                    y: res.y,
                    z: res.z,
                };
                this.waitAccel = false;
            }
        });

        wx.onDeviceMotionChange((res) => {
            if (this.waitAccel === false) {
                this.orientation = {
                    timestamp: this.imuTimeStamp,
                    alpha: res.alpha,
                    beta: res.beta,
                    gamma: res.gamma,
                };
                this.imuData = {
                    timestamp: this.imuTimeStamp,
                    alpha: this.orientation.alpha,
                    beta: this.orientation.beta,
                    gamma: this.orientation.gamma,
                    x: this.acceleration.x,
                    y: this.acceleration.y,
                    z: this.acceleration.z,
                };
                console.log('imuData: ' + this.imuData)
                app.worker.postMessage({
                    code: "fuse",
                    dataType: "imu",
                    imuData: this.imuData,
                });
                this.waitAccel = true;
            }
        });
    },

    stopSensorListening() {
        wx.stopAccelerometer();
        wx.stopDeviceMotionListening();
        wx.offDeviceMotionChange();
        wx.offAccelerometerChange();

        this.imuData = {
            orientation: [],
            acceleration: [],
        };
    },
})