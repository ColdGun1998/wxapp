var appconfig = {
    //////////////////////////////////////////////////////////////////////////
    // 小程序配置（使用该产品多个小程序，配置不同）

    wechatAppName: '商户家园',
    wechatAppID: 'wxf18e5f3bb2c7d6b2',
    domain: 'guangda',
    // domain: 'jian',
    url: '.stp.intourism.cn/',

    // wechatAppName: '光大银行',
    // wechatAppID: 'wx7df5d90a093f38d7',
    // domain: 'devoffn',
    // url: '.test.cebbank.com/',

    //////////////////////////////////////////////////////////////////////////
    // 项目配置
    projectName: 'sgpmobile',
    projectApiPath: 'sgpapi',
    companyInfoKey: 'companyInfo',
    userInfoKey: 'userInfo',

    //////////////////////////////////////////////////////////////////////////
    // 变量配置
    baseAppUrl: "",
    baseAppApiUrl: '',
    serviceImImageUrl: '',
    servicePhoneImageUrl: '',

    //////////////////////////////////////////////////////////////////////////
    // 初始化变量，在app.js的onLaunch函数中调用
    init() {
        this.baseAppUrl = 'https://' + this.domain + this.url + this.projectName + '/#/home'
        this.baseAppApiUrl = 'https://' + this.domain + this.url + this.projectApiPath + '/'
        this.serviceImImageUrl = 'https://' + this.domain + this.url + this.projectName + '/static/image/service_im.png'
        this.servicePhoneImageUrl = 'https://' + this.domain + this.url + this.projectName + '/static/image/service_phone.png'
    }
}

export default appconfig
