(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pagesSetting-settings2d-settings2d"],{"12e4":function(t,i,o){"use strict";var e=o("4ea4");Object.defineProperty(i,"__esModule",{value:!0}),i.default=void 0;var s=e(o("53ca"));o("a15b"),o("ac1f"),o("466d"),o("1276"),o("acd8");var a=e(o("f75a")),n=o("4579"),r={data:function(){return{setting2D:null,positionSele:!0,positionlist:[{id:0,onename:"频率范围设置",oneliststare:!1,positiontwo:[{twoid:0,twoname:"参考信号起始频率(Hz)",twoliststare:!1,twoparameter:0,disable:!1},{twoid:1,twoname:"参考信号终止频率(Hz)",twoliststare:!1,twoparameter:0,disable:!1},{twoid:2,twoname:"参考信号长度(s)",twoliststare:!1,twoparameter:0,disable:!1},{twoid:3,twoname:"声速(m/s)",twoliststare:!1,twoparameter:0,disable:!0}]},{id:1,onename:"基站数量设置",oneliststare:!1,positiontwo:[{twoid:0,twoname:"基站数量",twoliststare:!1,twoparameter:6,disable:!1}]},{id:2,onename:"基站位置设置:x,y,z(m)",oneliststare:!1,positiontwo:[]},{id:3,onename:"惯导设置",oneliststare:!1,positiontwo:[{twoid:0,twoname:"Alpha角度",twoliststare:!1,twoparameter:0,disable:!1},{twoid:1,twoname:"步长",twoliststare:!1,twoparameter:.5,disable:!1},{twoid:2,twoname:"融合偏移距离限制(m)",twoliststare:!1,twoparameter:3,disable:!1}]},{id:4,onename:"声波设置",oneliststare:!1,positiontwo:[{twoid:0,twoname:"声波偏移距离限制(m)",twoliststare:!1,twoparameter:2.5,disable:!1},{twoid:1,twoname:"开启C64(1开启 0关闭)",twoliststare:!1,twoparameter:0,disable:!1},{twoid:2,twoname:"声波基站高度(m)",twoliststare:!1,twoparameter:2,disable:!1},{twoid:3,twoname:"vMaxTh",twoliststare:!1,twoparameter:.5,disable:!1},{twoid:4,twoname:"vRatioTh",twoliststare:!1,twoparameter:.3,disable:!1},{twoid:5,twoname:"pMaxTh",twoliststare:!1,twoparameter:2047,disable:!1},{twoid:6,twoname:"maxRatioTh",twoliststare:!1,twoparameter:5,disable:!1},{twoid:7,twoname:"开启滑动平均(1开启 0关闭)",twoliststare:!1,twoparameter:0,disable:!1},{twoid:8,twoname:"开启地图限制(1开启 0关闭)",twoliststare:!1,twoparameter:0,disable:!1},{twoid:9,twoname:"开启IMU静止判断(1开启 0关闭)",twoliststare:!1,twoparameter:0,disable:!1}]}]}},onLoad:function(){this.commonInit()},methods:{onelist:function(t){var i=this.positionlist;0==i[t]["oneliststare"]?i[t]["oneliststare"]=!0:i[t]["oneliststare"]=!1},twolist:function(t,i){var o=this.positionlist[t].positiontwo[i]["twoliststare"],e=this.positionlist[t].positiontwo[i]["disable"];0==e&&(this.positionlist[t].positiontwo[i]["twoliststare"]=0==o)},cancel:function(t,i){this.positionlist[t].positiontwo[i]["twoliststare"]=!1},confirm:function(t,i){var o=this.fixSetting(t,i,this.twoparameter);o&&""!==this.twoparameter&&(this.positionlist[t].positiontwo[i]["twoparameter"]=this.twoparameter,console.log(this.setting2D),uni.$emit("updateSettingEvent",{setting2D:this.setting2D,locType:n.LocationSceneTypeArrayType2D}),this.twoparameter="",uni.setStorageSync("setting2D",this.setting2D)),this.positionlist[t].positiontwo[i]["twoliststare"]=!1,this.refreshUI()},_input:function(t){this.twoparameter=t.detail.value},commonInit:function(){this.setting2D=a.default.setting2D,this.refreshUI()},refreshUI:function(){var t=uni.getStorageSync("setting2D",this.setting2D);this.positionlist[0].positiontwo[0]["twoparameter"]=t.frequencyStart,this.positionlist[0].positiontwo[1]["twoparameter"]=t.frequencyEnd,this.positionlist[0].positiontwo[2]["twoparameter"]=t.durationTime,this.positionlist[0].positiontwo[3]["twoparameter"]=t.soundSpeed,this.positionlist[1].positiontwo[0]["twoparameter"]=t.coordinate.length,this.positionlist[2].positiontwo=[];for(var i=0;i<t.coordinate.length;i++){console.log("setting2D.coordinate[",i+"]",t.coordinate[i]);var o={twoid:i,twoname:"基站"+(i+1),twoliststare:!1,twoparameter:t.coordinate[i].join(","),disable:!1};this.positionlist[2].positiontwo.push(o)}this.positionlist[3].positiontwo[0]["twoparameter"]=t.imuAlpha,this.positionlist[3].positiontwo[1]["twoparameter"]=t.imuSteps,this.positionlist[3].positiontwo[2]["twoparameter"]=t.imuMaxDrift,this.positionlist[4].positiontwo[0]["twoparameter"]=t.acousticMaxDrift,this.positionlist[4].positiontwo[1]["twoparameter"]=t.acousticC64Flag,this.positionlist[4].positiontwo[2]["twoparameter"]=t.acousticHeight,this.positionlist[4].positiontwo[3]["twoparameter"]=t.vMaxTh,this.positionlist[4].positiontwo[4]["twoparameter"]=t.vRatioTh,this.positionlist[4].positiontwo[5]["twoparameter"]=t.pMaxTh,this.positionlist[4].positiontwo[6]["twoparameter"]=t.maxRatioTh,this.positionlist[4].positiontwo[7]["twoparameter"]=t.acousticSmoothFlag,this.positionlist[4].positiontwo[8]["twoparameter"]=t.acousticMapLimitFlag,this.positionlist[4].positiontwo[9]["twoparameter"]=t.acousticImuStaticFlag},fixSetting:function(t,i,o){if(this.setting2D=uni.getStorageSync("setting2D",this.setting2D),o){if(0==t&&(0==i&&(this.setting2D.frequencyStart=o),1==i&&(this.setting2D.frequencyEnd=o),2==i&&(this.setting2D.durationTime=o),3==i&&(this.setting2D.soundSpeed=o)),1==t&&0==i){if(!(o>=4&&o<=6))return!1;this.beaconNumber=o,console.log("beaconNumber",this.beaconNumber),this.positionlist[2].positiontwo=[],this.setting2D.coordinate=[];for(var e=0;e<this.beaconNumber;e++){var a={twoid:e,twoname:"基站"+(e+1),twoliststare:!1,twoparameter:0,disable:!1};this.positionlist[2].positiontwo.push(a),this.setting2D.coordinate.push([0,0]),console.log("坐标列表",this.positionlist[2].positiontwo),console.log("setting2D.coordinate1",this.setting2D.coordinate),console.log(this.positionlist[2].positiontwo[i]["twoparameter"])}}if(2==t&&(console.log("twoparameter",o),console.log("twoparameter  typeof",(0,s.default)(o)),i>=0&&i<this.setting2D.coordinate.length)){var n=/^[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?\,[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?$/,r=o.match(n);if(console.log("beacon_reg",r),null==r)return wx.showToast({title:"请输入正确的二维坐标点，如： 1,2",icon:"none",duration:1e3}),!1;var l=o.split(",");2==l.length&&(this.setting2D.coordinate[i][0]=parseFloat(l[0]),this.setting2D.coordinate[i][1]=parseFloat(l[1]))}return 3==t&&(0==i&&(this.setting2D.imuAlpha=parseFloat(o)),1==i&&(this.setting2D.imuSteps=parseFloat(o)),2==i&&(this.setting2D.imuMaxDrift=parseFloat(o))),4==t&&(0==i&&(this.setting2D.acousticMaxDrift=parseFloat(o)),1==i&&(this.setting2D.acousticC64Flag=parseFloat(o)),2==i&&(this.setting2D.acousticHeight=parseFloat(o)),3==i&&(this.setting2D.vMaxTh=parseFloat(o)),4==i&&(this.setting2D.vRatioTh=parseFloat(o)),5==i&&(this.setting2D.pMaxTh=parseFloat(o)),6==i&&(this.setting2D.maxRatioTh=parseFloat(o)),7==i&&(this.setting2D.acousticSmoothFlag=parseFloat(o)),8==i&&(this.setting2D.acousticMapLimitFlag=parseFloat(o)),9==i&&(this.setting2D.acousticImuStaticFlag=parseFloat(o))),!0}}}};i.default=r},"44a4":function(t,i,o){"use strict";o.r(i);var e=o("832c"),s=o("a767");for(var a in s)["default"].indexOf(a)<0&&function(t){o.d(i,t,(function(){return s[t]}))}(a);o("c047");var n,r=o("f0c5"),l=Object(r["a"])(s["default"],e["b"],e["c"],!1,null,"3688e9f0",null,!1,e["a"],n);i["default"]=l.exports},"48e8":function(t,i,o){var e=o("24fb");i=e(!1),i.push([t.i,"uni-page-body[data-v-3688e9f0]{background:#fff}.position-group[data-v-3688e9f0]{width:100%;height:auto}.settings_one[data-v-3688e9f0]{width:100%;height:auto}.settings-one-label[data-v-3688e9f0]{width:100%;height:%?110?%;line-height:%?110?%;background:#fff;box-sizing:border-box;padding:0 3%;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;flex-direction:row;-webkit-box-pack:justify;-webkit-justify-content:space-between;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;align-items:center;border-bottom:1px #eaeaea solid}.settings-one-label uni-text[data-v-3688e9f0]{font-size:15px;color:#2ebbfe}.settings_two[data-v-3688e9f0]{width:100%;height:auto;-webkit-transition:all .5s;transition:all .5s}.settings_two .shade[data-v-3688e9f0]{width:100%;height:100%;position:fixed;top:0;left:0;background-color:rgba(0,0,0,.1)}.settings_two .shade .popup[data-v-3688e9f0]{width:%?500?%;height:%?300?%;position:fixed;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%);background-color:#fff;padding:%?20?%}.settings_two .shade .popup uni-text[data-v-3688e9f0]{font-size:%?24?%}.settings_two .shade .popup uni-input[data-v-3688e9f0]{margin:%?20?% auto;border-bottom:1px solid #000}.settings_two .shade .popup uni-button[data-v-3688e9f0]{margin:%?30?%;width:25%;height:%?50?%;font-size:%?20?%;color:#000;float:left}.settings-two-label[data-v-3688e9f0]{width:100%;height:%?110?%;line-height:%?110?%;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;flex-direction:row;-webkit-box-pack:justify;-webkit-justify-content:space-between;justify-content:space-between;box-sizing:border-box;padding:0 3%;border-bottom:1px #eee solid}.settings-two-label .paraName[data-v-3688e9f0]{font-size:12px;color:#333}.settings-two-label .parameter[data-v-3688e9f0]{font-size:12px;color:#333}.oneshow .settings_two[data-v-3688e9f0]{display:block}.onehide .settings_two[data-v-3688e9f0]{display:none}.shadeshow .shade[data-v-3688e9f0]{display:block}.shadehide .shade[data-v-3688e9f0]{display:none}body.?%PAGE?%[data-v-3688e9f0]{background:#fff}",""]),t.exports=i},"832c":function(t,i,o){"use strict";var e;o.d(i,"b",(function(){return s})),o.d(i,"c",(function(){return a})),o.d(i,"a",(function(){return e}));var s=function(){var t=this,i=t.$createElement,o=t._self._c||i;return o("v-uni-view",{staticClass:"content"},[o("v-uni-view",{staticClass:"position-group"},t._l(t.positionlist,(function(i,e){return o("v-uni-view",{key:e,staticClass:"settings_one",class:i.oneliststare?"oneshow":"onehide"},[o("v-uni-view",{staticClass:"settings-one-label",on:{click:function(i){arguments[0]=i=t.$handleEvent(i),t.onelist(e)}}},[o("v-uni-text",[t._v(t._s(i.onename))])],1),t._l(i.positiontwo,(function(i,s){return o("v-uni-view",{key:s,staticClass:"settings_two",class:i.twoliststare?"shadeshow":"shadehide"},[o("v-uni-view",{staticClass:"settings-two-label",on:{click:function(i){arguments[0]=i=t.$handleEvent(i),t.twolist(e,s)}}},[o("v-uni-text",{staticClass:"paraName"},[t._v(t._s(i.twoname))]),o("v-uni-text",{staticClass:"parameter"},[t._v(t._s(i.twoparameter))])],1),o("v-uni-view",{staticClass:"shade"},[o("v-uni-view",{staticClass:"popup"},[o("v-uni-text",[t._v(t._s(i.twoname))]),1==i.disable?o("v-uni-input",{attrs:{type:"text",disabled:"disablad",value:i.twoparameter},on:{input:function(i){arguments[0]=i=t.$handleEvent(i),t._input.apply(void 0,arguments)}}}):o("v-uni-input",{attrs:{type:"text",value:i.twoparameter},on:{input:function(i){arguments[0]=i=t.$handleEvent(i),t._input.apply(void 0,arguments)}}}),o("v-uni-button",{on:{click:function(i){arguments[0]=i=t.$handleEvent(i),t.cancel(e,s)}}},[t._v("取消")]),o("v-uni-button",{on:{click:function(i){arguments[0]=i=t.$handleEvent(i),t.confirm(e,s)}}},[t._v("确认")])],1)],1)],1)}))],2)})),1)],1)},a=[]},a767:function(t,i,o){"use strict";o.r(i);var e=o("12e4"),s=o.n(e);for(var a in e)["default"].indexOf(a)<0&&function(t){o.d(i,t,(function(){return e[t]}))}(a);i["default"]=s.a},c047:function(t,i,o){"use strict";var e=o("cefb"),s=o.n(e);s.a},cefb:function(t,i,o){var e=o("48e8");"string"===typeof e&&(e=[[t.i,e,""]]),e.locals&&(t.exports=e.locals);var s=o("4f06").default;s("f752cc1e",e,!0,{sourceMap:!1,shadowMode:!1})}}]);