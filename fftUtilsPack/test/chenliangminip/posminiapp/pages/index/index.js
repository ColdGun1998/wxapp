// index.js
// 获取应用实例
const app = getApp()

Page({
    data: {
        startRecorderFlag: false,
        tdoa1: 0,
        tdoa2: 0,
        distance1: '', // 距离0ms延时基站的距离
        distance2: '', // 距离150ms延时基站的距离
        discount1: 0,
        discount2: 0,
        coordinate1: '',
        coordinate2: '',
        indexInfo: ''

    },
    onLoad() {
        this.initRecorder()
        console.log('==============================')
        console.log(new Date().getTime())
    },

    // 初始化录音定位
    initRecorder() {
        app.store.recorderManager = wx.getRecorderManager()
        app.store.recorderManager.onFrameRecorded((res) => {
            const { frameBuffer } = res
            if (app.store.worker) {
                app.store.worker.postMessage({
                    'code': 'frameBuffer1DThreeBeacon',
                    'data': frameBuffer.slice(0)
                });
            }
        })
    },

    testWithFile() {
        let DEBUGDOWNLOADSERVER = 'http://192.168.124.8:8080/';
        let url =
            DEBUGDOWNLOADSERVER +
            "static/data/acoustic_loc/nanchang/4zp.wav";
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
                app.store.worker.postMessage({
                    code: "inputDataList",
                    data: inputList.slice(0),
                    locType: "一维定位三基站",
                    // chartData: JSON.parse(JSON.stringify(this.chartData.series[0])),
                });
                this.readFile(filePath, countNumber + 1);
            },
            fail(res) {
                console.log(res);
            },
        });
    },

    // 开始录音定位
    startRecorder() {
        let testWithFileFlag = false;
        if (app.store.startRecorderFlag) {
            return
        }
        let that = this;
        app.store.startRecorderFlag = true

        app.store.worker = wx.createWorker('static/workers/worker.js', {
            useExperimentalWorker: true
        })
        app.store.worker.onProcessKilled(() => {
            // 重新创建一个worker
            app.store.worker = wx.createWorker("static/workers/worker.js", {
                useExperimentalWorker: true
            });
            that.initWorkerListener();
            app.store.worker.postMessage({
                code: "updateSetting",
                locType: "一维定位三基站",
                beaconCluster1: app.store.setting1,
                beaconCluster2: app.store.setting2,
                allSettings: app.store.settingList,
            });
        })
        if (app.store.worker) {
            this.initWorkerListener()
            app.store.worker.postMessage({
                code: 'updateSetting',
                locType: "一维定位三基站",
                beaconCluster1: app.store.setting1,
                beaconCluster2: app.store.setting2,
                allSettings: app.store.settingList,
            })
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

    initWorkerListener() {
        if (app.store.worker) {
            app.store.worker.onMessage(res => {
                switch (res.code) {
                    case 'tdoaInfo':
                        res.tdoaInfo.forEach((x) => {
                            if (x.tdoa > 0) {
                                console.log("tdoa1", x.tdoa);
                                app.store.tdoa1 = x.tdoa
                                if (x.tdoa > 0) {
                                    this.setData({ tdoa1: x.tdoa })
                                }
                            }
                        })
                        res.tdoaInfo2.forEach((x) => {
                            if (x.tdoa > 0) {
                                console.log("tdoa2", x.tdoa);
                                app.store.tdoa2 = x.tdoa
                                if (x.tdoa > 0) {
                                    this.setData({ tdoa2: x.tdoa })
                                }
                            }
                        })
                        break;
                    case 'distances_nanchang':
                        console.log("distances1", res.distances1);
                        console.log("distances2", res.distances2);
                        app.store.distances1 = JSON.stringify(res.distances1)
                        app.store.distances2 = JSON.stringify(res.distances2)
                        if (res.distances1.length > 0) {
                            this.setData({ distances1: app.store.distances1 })
                        }
                        if (res.distances2.length > 0) {
                            this.setData({ distances2: app.store.distances2 })
                        }
                        // this.setData({ discount1: res.distances1.length, discount2: res.distances2.length, distances1: app.store.distances1, distances2: app.store.distances2 })
                        break;
                    case 'coordinate':
                        console.log("coordinate1", res.coordinate1);
                        console.log("coordinate2", res.coordinate2);
                        let c1 = JSON.stringify(res.coordinate1)
                        let c2 = JSON.stringify(res.coordinate2)
                        if (res.coordinate1.length > 0) {
                            this.setData({ coordinate1: c1 })
                        }
                        if (res.coordinate2.length > 0) {
                            this.setData({ coordinate2: c2 })
                        }

                        break;
                    case 'clusterIndex':
                        console.log("clusterIndex 检测结果", res.clusterIndex);

                        let indexInfo = res.clusterIndex.filter(item => item != null);
                        if (indexInfo.length > 0) {
                            this.setData({ indexInfo: JSON.stringify(indexInfo) })
                        }
                        break;
                    case 'console':
                        console.log(res.content);
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

})