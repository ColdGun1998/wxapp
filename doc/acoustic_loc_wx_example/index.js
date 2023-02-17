// index.js
// 获取应用实例
const app = getApp()

Page({
    data: {
        startRecorderFlag: false,
        waitAccel: true,
        imuTimestamp: 0,
        acceleration: null,
        orientation: null,
    },
    onLoad() {
        this.initRecorder()
        this.startRecorder()
        this.initSensorListening()
    },

    onUnload() {
        this.stopRecorder()
        this.stopSensorListening()
    },

    // 初始录音定位
    initRecorder() {
        app.store.recorderManager = wx.getRecorderManager()
        app.store.recorderManager.onFrameRecorded((res) => {
            const { frameBuffer } = res
            if (app.store.worker) {
                app.store.worker.postMessage({
                    'code': 'frameBuffer',
                    'data': frameBuffer.slice(0)
                });
            }
        })
    },

    // 开始录音定位
    startRecorder() {
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
            that.initWorkerListener();
        })
        if (app.store.worker) {
            this.initWorkerListener()
        }

        let param = {
            format: "pcm",
            duration: 600000,
            numberOfChannels: 2,
            sampleRate: 48000,
            encodeBitRate: 320000,
            frameSize: 36
        }
        app.store.recorderManager.start(param)

        this.setData({
            startRecorderFlag: app.store.startRecorderFlag
        })
    },

    initWorkerListener() {
        if (app.store.worker) {
            app.store.worker.onMessage(res => {
                switch (res.code) {
                    case 'coordinate':
                        console.log("coordinate", res.coordinate);
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