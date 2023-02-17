// app.js
App({
    onLaunch() {

    },
    store: {
        recorderManager: null, //小程序全局录音管理
        startRecorderFlag: false, //开始录音标志
        worker: null, //声波定位算法进程
    }
})