<template>
  <div class="recoder-container flex">
    <view class="uni-form-item uni-column userid-box">
      <picker @change="examinationType" :range="examinationTypeArray">
        <label>用户id：</label>
        <label class="">{{ examinationTypeArrayType }}</label>
      </picker>
    </view>
    <view class="uni-form-item uni-column userid-box">
      <picker @change="LocationSceneType" :range="LocationSceneTypeArray">
        <label>定位场景：</label>
        <label class="">{{ LocationSceneTypeArrayType }}</label>
      </picker>
    </view>
    <view class="uni-form-item uni-column userid-box">
      <picker @change="LocationType" :range="LocationTypeArray">
        <label>定位类型：</label>
        <label class="">{{ LocationTypeArrayType }}</label>
      </picker>
    </view>
    <!-- 未录音状态 -->
    <div class="voice-pre flex" v-if="recodeStatus == 0" @click="startRecorder">
      <img src="../../static/images/voice-pre.png" alt />
    </div>
    <!-- 录音中状态 -->
    <div class="voice-ing flex" v-if="recodeStatus == 1" @click="stopRecorder">
      <div class="icon"></div>
    </div>
    <!-- 录音完成 -->
    <div class="voice-complete-play flex" v-if="recodeStatus == 2">
      <div class="left flex" @click="playVoice">
        <div class="operate-icon flex">
          <img v-if="playStatus == 0" src="../../static/images/stop.png" alt />
          <img v-else src="../../static/images/b-ing.png" alt />
        </div>
        <div class="flow flex">
          <img
            v-if="playStatus == 0"
            src="../../static/images/brd-defalut.png"
            alt
          />
          <img v-else src="../../static/images/flow.gif" alt />
        </div>
        <div class="voice-total-time">{{ duration }}"</div>
      </div>
      <div class="right-label" @click="removeRecoder">删除重新录制</div>
    </div>
    <!-- <div id="fengmap" class="fengmap"></div> -->
    <!-- <canvas type="webgl" id="fengmap" class="fengmap" bindtouchstart
    ="touchStart" bindtouchmove="touchMove" bindtouchend="touchEnd"></canvas>
    <canvas type="2d" id="overlay" style="display:none"></canvas> -->
    <div style="background-image:url(https://img-blog.csdnimg.cn/f2cb04df6e0149bcbbb75590ce53760c.png);background-repeat: no-repeat;background-size: cover;">
    <view class="charts-box">
      <!-- scatter是散点坐标 -->
      <qiun-data-charts
        v-if="chartskey"
        type="scatter"
        :chartData="chartData"
        background="none"
        :animation="false"
      />
    </view>
    </div>
    <div class="buttons-area">
      {{ consoleText }}
    </div>

    <!-- setting -->
    <view class="floatbtn" @click="changeMenu">
      <text> 更多 </text>
    </view>
    <view v-if="menushow" class="menuarea">
      <view class="mask" @click="changeMenu"> </view>
      <view class="menulist">
        <view class="" @click="toSettings"> 设置 </view>
        <view class="" @click="toAbout"> 关于 </view>
        <view class="" @click="toScanSettingCode"> 扫描设置二维码 </view>
        <view class="" @click="toShowSettingCode"> 分享设置二维码 </view>
      </view>
    </view>
    <div>
      <canvas
        class="canvas-code"
        canvas-id="settingQrcode"
        style="background:#fff;width: 200px;height: 200px;"
      />
    </div>
  </div>
</template>

<script>


// import { fengmap } from '../../Utils/fengmap.miniprogram.min.js';

import QRCode from "../../Utils/qrcode.js";
import fftUtils from "../../Utils/fftUtil";
import {
  SIGNAL_LENGTH,
  IMSERVER,
  DEBUGDOWNLOADSERVER,
  DEBUGUPLOADSERVER,
  LocationSceneTypeArrayType1DThreeBeacon,
  LocationSceneTypeArrayType1D,
  LocationSceneTypeArrayType2D,
  LocationSceneTypeArrayTypeStadium,
  LocationSceneTypeArrayTypeSuzhou,
  LocationSceneTypeArrayTypeShengBo,
  LocationSceneTypeArrayTypeCangKu,
  LocationSceneTypeArrayTypeYanjiuyuan
} from "../../Utils/constant";
import {formatDate} from "../../Utils/dateUtils";
// import fengmap from "../../fengmap/fengmap.map.min"; //核心包
// import "../../fengmap/fengmap.analyser.min"; //分析器
// import "../../fengmap/fengmap.plugin.min"; //插件包
// import "../../fengmap/fengmap.effect.min"; //特效包
// import "../../fengmap/fengmap.plugins-compositemarker.min"; //复合标注包
// import "../../fengmap/fengmap.plugins-mapedit.min"; //绘图包
// import "../../fengmap/fengmap.plugins-track-player.min"; //轨迹回放包

// const initFengmap = ()=>{
//   var map;
//     var options = {
//         container: document.getElementById('fengmap'),
//         appName: '蜂鸟研发SDK_2_0',
//         key: '57c7f309aca507497d028a9c00207cf8',
//         mapID: '1513361948621471746',
//         themeID: '1581910231660457986',
//         level: 2,
//         mapZoom: 19.5,
//     }
//     map = new fengmap.FMMap(options);
//     map.on('loaded', function () {

//         // 指北针控件
//         var scrollCompassCtlOpt = {
//             position: fengmap.FMControlPosition.RIGHT_TOP,
//             offset: {
//                 x: -20,
//                 y: 80
//             },

//         };
//         var compass = new fengmap.FMCompass(scrollCompassCtlOpt);
//         compass.addTo(map);

//         compass.on('click', function () {
//             map.setRotation({
//                 rotation: 0,
//                 animate: true,
//                 duration: 0.3,
//                 finish: function () { console.log('setRotation'); }
//             })
//         });

//         // 缩放控件
//         var scrollZoomCtlOpt = {
//             position: fengmap.FMControlPosition.RIGHT_TOP,
//             offset: {
//                 x: -20,
//                 y: 510
//             },

//         };
//         var toolbar = new fengmap.FMZoomControl(scrollZoomCtlOpt);
//         toolbar.addTo(map)

//         // 楼层控件
//         var scrollFloorCtlOpt = {
//             position: fengmap.FMControlPosition.RIGHT_TOP,
//             floorButtonCount: 5,
//             offset: {
//                 x: -20,
//                 y: 150
//             },
//             viewModeControl: true,
//             floorModeControl: true,
//             needAllLayerBtn: true

//         };
//         scrollFloorControl = new fengmap.FMToolbar(scrollFloorCtlOpt);
//         scrollFloorControl.addTo(map)

//         // 比例尺控件
//         var scrollScaleBarCtlOpt = {
//             fontSize: 18,
//             height: 30,
//             position: fengmap.FMControlPosition.LEFT_BOTTOM,
//             offset: {
//                 x: 20,
//                 y: -20
//             },

//         };
//         var scaleBar = new fengmap.FMScaleBar(scrollScaleBarCtlOpt);
//         scaleBar.addTo(map)
//     });
// }

// 一维定位setting1和setting2
const setting1 = {
  vMaxTh: 0.5,
  vRatioTh: 0.3,
  pMaxTh: 2047,
  maxRatioTh: 1.5,
  frequencyStart: 19000,
  frequencyEnd: 21000,
  durationTime: 0.03,
  totalLength: 30,
  soundSpeed: 340,
  lngStart: 1588,
  lngEnd: 1529,
  latStart: 286,
  latEnd: 403,
  timeInterval: 0.15,
  coordinate: [
    [0, 0],
    [30, 0],
  ],
  height: 1,
  imuAlpha: 0,
};

const setting2 = {
  vMaxTh: 0.5,
  vRatioTh: 0.3,
  pMaxTh: 2047,
  maxRatioTh: 1.5,
  frequencyStart: 21000,
  frequencyEnd: 23000,
  durationTime: 0.03,
  totalLength: 30,
  soundSpeed: 340.0,
  lngStart: 1529,
  lngEnd: 1472,
  latStart: 403,
  latEnd: 512,
  timeInterval: 0.15,
  coordinate: [
    [30, 0],
    [60, 0],
  ],
  height: 1,
  imuAlpha: 0,
};

// 纯一维定位setting1D
const setting1D = {
  vMaxTh: 0.5,
  vRatioTh: 0.3,
  pMaxTh: 2047,
  maxRatioTh: 5,
  frequencyStart: 17000,
  frequencyEnd: 19000,
  durationTime: 0.03,
  totalLength: 24,
  soundSpeed: 340,
  lngStart: 1588,
  lngEnd: 1529,
  latStart: 286,
  latEnd: 403,
  timeInterval: 0.15, // !!! now for 0.15*2 !!!
  coordinate: [
    [0, 0],
    [24, 0],
  ],
  imuAlpha: 0,
  imuSteps: 0.5,
  imuMaxDrift: 3,
  acousticMaxDrift: 2.5,
  acousticC64Flag: 0,
  acousticHeight: 2.7,
};

// 二维定位setting2D
const setting2D = {
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
  coordinate: [
    [0, 0],
    [0, 7.72],
    [5.63, 7.72],
    [12.4, 7.72],
    [12.34, 0],
    [5.32, 0],
  ],
  imuAlpha: 0,
  imuSteps: 0.5,
  imuMaxDrift: 3,
  acousticMaxDrift: 2.5,
  acousticC64Flag: 0,
  acousticHeight: 2.7,
  acousticSmoothFlag: 0,
  acousticMapLimitFlag: 0,
  acousticImuStaticFlag: 0,
};

const settingCangKu = {
  settings: [
    [
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 21000,
        frequencyEnd: 23000,
        durationTime: 0.03,
        totalLength: 11.5,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [11.5, 16.5],
          [23, 16.5],
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 2.7,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 19000,
        frequencyEnd: 21000,
        durationTime: 0.03,
        totalLength: 11.5,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [11.5, 11],
          [23, 11],
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],
        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 2.7,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
        acousticHaveVerticalFlag: true,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 17000,
        frequencyEnd: 19000,
        durationTime: 0.03,
        totalLength: 11.5,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [11.5, 5.5],
          [23, 5.5],
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],
        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 2.7,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
        acousticHaveVerticalFlag: true,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 15000,
        frequencyEnd: 17000,
        durationTime: 0.03,
        totalLength: 11.5,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [11.5, 0],
          [23, 0],
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],
        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 2.7,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
    ],
  ],
};

// 苏州定位settingSuzhou
const settingSuzhou = {
  coordinate: [
    [0, 0],
    [0, 15.2],
    [5.847, 15.2],
    [5.847, 0],
    [0, 33.4],
    [0, 15.2],
    [5.847, 15.2],
    [6, 33.4],
    [20.24, 28.35],
    [7.24, 28.35],
  ],
  imuAlpha: 0,
};

// 省博定位settingShengBo
const settingShengBo = {
  autoFloorRec: 1,
  settings: [
    // setting_universal
    // shengbo_c2
    [
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 21000,
        frequencyEnd: 23000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [26.17, -5.797], // C1
          [26.17, 1.632], // C2
          [19.2, -2.297], // C3
          [19.2, -5.797], // C4
          [22.78, -5.797], // C5
          [22.75, 1.632], // C6
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [
          [26.17, -5.797], //C1
          [26.17, 1.632], //C2
          [22.75, 1.632], //C6
          [19.2, -2.297], //C3
          [19.2, -5.797], //C4
          [22.78, -5.797], //C5
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [
          [0, 0, 0, 6.47, 1, -1], // Q1 A1-A2
          [0, 6.47, 8.94, 6.47, 1, -1], // Q2 A2-A3
          [8.94, 6.47, 8.94, 1.632, 1, -1], // Q2-Q3 Q2.5 A3-A4'(8.94, 1.632)
          [8.94, 1.632, 26.17, 1.632, 1, -1], // Q3 A4'(8.94, 1.632)-B2
          [26.17, 1.632, 26.17, -5.797, 1, 1], // Q4 B2-C1
          [22.78, -5.797, 19.2, -5.797, 1, -1], // Q5 C5-C4
          [19.2, -5.797, 19.2, -2.297, 1, -1], // Q6 C4-C3
          [17.76, -1.657, 6.76, -1.657, 1, -1], // Q7 B6-B5
          [6.76, 0, 0, 0, 0.5, -1], // Q8 A5-A1
          [3.38, 3.35, 7.85, 3.35, 1, -1], // Q9 A3+A5//2
        ],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.1,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 19000,
        frequencyEnd: 21000,
        durationTime: 0.03,
        totalLength: 11.5,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [26.17, -1.628], // B1
          [26.17, 1.632], // B2
          [17.76, 1.632], // B3
          [8.94, 2.39], // B4
          [6.76, -1.657], // B5
          [17.76, -1.657], // B6
        ],
        limitPoly: [
          [26.17, -1.628], //B1
          [26.17, 1.632], //B2
          [17.76, 1.632], //B3
          [8.94, 2.39], //B4
          [6.76, -1.657], //B5
          [17.76, -1.657], //B6
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.1,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 17000,
        frequencyEnd: 19000,
        durationTime: 0.03,
        totalLength: 11.5,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [0, 0], // A1
          [0, 6.47], // A2
          [8.94, 6.47], // A3
          [8.94, 2.39], // A4
          [6.76, 0], // A5
        ],
        limitPoly: [
          [0, 0], // A1
          [0, 6.47], // A2
          [8.94, 6.47], // A3
          [8.94, 2.39], // A4
          [6.76, 0], // A5
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.73,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
    ],
    // shengbo_c-1
    [
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 21000,
        frequencyEnd: 23000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [24, -3.15],
          [24, 2.9],
          [18.29, 2.9],
          [12.756, 3.476],
          [12.756, -0.378],
          [20.29, -0.378],
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [
          [24, 2.9, 24, -3.15, 1, -1], // Q1
          [0, 3.476, 18.29, 2.9, 1, -1], // Q2
          [18.29, 2.9, 24, 2.9, 1, -1], // Q3
          [0, 0, 12.756, -0.378, 1, -1], // Q4
          [0, 0, 0, 3.476, 1, 1], // Q5
          [20.29, -0.378, 12.756, -0.378, 1, -1], // Q6
        ],
        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 4.23,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 19000,
        frequencyEnd: 21000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [24, -3.15],
          [24, 2.9],
          [18.29, 2.9],
          [12.756, 3.476],
          [12.756, -0.378],
          [20.29, -0.378],
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [
          [24, -3.15],
          [20.29, -0.378],
          [12.756, -0.378],
          [12.756, 3.476],
          [18.29, 2.9],
          [24, 2.9],
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 4.23,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
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
        coordinate: [
          [0, 0],
          [0, 3.476],
          [6.847, 3.476],
          [12.756, 3.476],
          [12.756, -0.378],
          [6.847, -0.378],
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [
          [0, 0],
          [0, 3.476],
          [6.847, 3.476],
          [12.756, 3.476],
          [12.756, -0.378],
          [6.847, -0.378],
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 4.23,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
    ],
    // shengbo_c1
    [
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 21000,
        frequencyEnd: 23000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [26.27, -3.6],
          [26.27, 3.02],
          [20.57, 3.02],
          [12.41, 3.14],
          [12.41, -1.07],
          [20.57, -1.07],
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [
          [26.27, -3.6], //C1
          [20.57, -1.07], //C6
          [12.41, -1.07], //C5
          [12.41, 3.14], //C4
          [20.57, 3.02], //C3
          [26.27, 3.02], //C2
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [
          [0, 0, 0, 6.99, 1, -1], // Q1
          [0, 6.99, 11.9, 6.99, 1, -1], // Q2
          [11.9, 6.99, 12.41, 3.14, 1, -1], // Q2-Q3 Q2.5
          [13.41, 3.14, 26.27, 3.02, 1, -1], // Q3
          [26.27, 3.02, 26.27, -3.6, 1, 1], // Q4
          [20.57, -1.07, 12.41, -1.07, 1, -1], // Q5
          [12.41, -1.07, 0, 0, 1, -1], // Q5-Q6 Q5.5 B5-A1
          [11.41, 2.14, 4.82, 3.22, 0.5, 1], // Q6
        ],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 4.6,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 19000,
        frequencyEnd: 21000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [3.82, 0],
          [3.82, 4.22],
          [12.41, 3.14],
          [12.41, -1.07],
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [
          [3.82, 0],
          [3.82, 4.22],
          [12.41, 3.14],
          [12.41, -1.07],
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 4.6,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
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
        coordinate: [
          [0, 0],
          [3.82, 0],
          [3.82, 4.22],
          [0, 6.99],
          [11.9, 6.99],
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [
          [0, 0], //A1
          [0, 6.99], //A4
          [11.9, 6.99], //A5
          [12.41, 3.14], //B4
          [3.82, 4.22], //A3
          [3.82, 0], //A2
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 4.6,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
    ],
    // shengbo_c2
    [
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 21000,
        frequencyEnd: 23000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [26.17, -5.797], // C1
          [26.17, 1.632], // C2
          [19.2, -2.297], // C3
          [19.2, -5.797], // C4
          [22.78, -5.797], // C5
          [22.75, 1.632], // C6
        ],
        // 多边形限制，要按找几何位置顺时针或逆时针输入位置， coordinate 已经满足的话，就不用设置limitPoly
        limitPoly: [
          [26.17, -5.797], //C1
          [26.17, 1.632], //C2
          [22.75, 1.632], //C6
          [19.2, -2.297], //C3
          [19.2, -5.797], //C4
          [22.78, -5.797], //C5
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [
          [0, 0, 0, 6.47, 1, -1], // Q1 A1-A2
          [0, 6.47, 8.94, 6.47, 1, -1], // Q2 A2-A3
          [8.94, 6.47, 8.94, 1.632, 1, -1], // Q2-Q3 Q2.5 A3-A4'(8.94, 1.632)
          [8.94, 1.632, 26.17, 1.632, 1, -1], // Q3 A4'(8.94, 1.632)-B2
          [26.17, 1.632, 26.17, -5.797, 1, 1], // Q4 B2-C1
          [22.78, -5.797, 19.2, -5.797, 1, -1], // Q5 C5-C4
          [19.2, -5.797, 19.2, -2.297, 1, -1], // Q6 C4-C3
          [17.76, -1.657, 6.76, -1.657, 1, -1], // Q7 B6-B5
          [6.76, 0, 0, 0, 0.5, -1], // Q8 A5-A1
          [3.38, 3.35, 7.85, 3.35, 1, -1], // Q9 A3+A5//2
        ],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.1,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 19000,
        frequencyEnd: 21000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [26.17, -1.628], // B1
          [26.17, 1.632], // B2
          [17.76, 1.632], // B3
          [8.94, 2.39], // B4
          [6.76, -1.657], // B5
          [17.76, -1.657], // B6
        ],
        limitPoly: [
          [26.17, -1.628], //B1
          [26.17, 1.632], //B2
          [17.76, 1.632], //B3
          [8.94, 2.39], //B4
          [6.76, -1.657], //B5
          [17.76, -1.657], //B6
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.1,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
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
        coordinate: [
          [0, 0], // A1
          [0, 6.47], // A2
          [8.94, 6.47], // A3
          [8.94, 2.39], // A4
          [6.76, 0], // A5
        ],
        limitPoly: [
          [0, 0], // A1
          [0, 6.47], // A2
          [8.94, 6.47], // A3
          [8.94, 2.39], // A4
          [6.76, 0], // A5
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],

        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.73,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
    ],
    // shengbo_c2_small_room
    [
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 21000,
        frequencyEnd: 23000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [27.56, -12.77], //D3
          [23.56, -12.77], //D4
          [23.56, -17.79], //D5
          [27.56, -17.79], //D6
        ],
        limitPoly: [
          [27.56, -12.77], //D3
          [27.56, -17.79], //D6
          [23.56, -17.79], //D5
          [23.56, -12.77], //D4
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [
          [27.56, -12.77, 27.56, -17.79, 1, -1], // Q9
          [27.56, -17.79, 23.56, -17.79, 1, -1], // Q10
          [23.56, -17.79, 23.56, -12.77, 1, -1], // Q11
          [23.56, -12.77, 27.56, -12.77, 1, -1], // Q12
        ],
        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.1,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
        vMaxTh: 0.5,
        vRatioTh: 0.3,
        pMaxTh: 2047,
        maxRatioTh: 5,
        frequencyStart: 19000,
        frequencyEnd: 21000,
        durationTime: 0.03,
        totalLength: 8.4,
        soundSpeed: 340,
        lngStart: 1588,
        lngEnd: 1529,
        latStart: 286,
        latEnd: 403,
        timeInterval: 0.15,
        coordinate: [
          [27.56, -12.77], //D3
          [23.56, -12.77], //D4
          [23.56, -17.79], //D5
          [27.56, -17.79], //D6
        ],
        limitPoly: [
          [27.56, -12.77], //D3
          [27.56, -17.79], //D6
          [23.56, -17.79], //D5
          [23.56, -12.77], //D4
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],
        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.1,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
      {
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
        coordinate: [
          [27.56, -12.77], //D3
          [23.56, -12.77], //D4
          [23.56, -17.79], //D5
          [27.56, -17.79], //D6
        ],
        limitPoly: [
          [27.56, -12.77], //D3
          [27.56, -17.79], //D6
          [23.56, -17.79], //D5
          [23.56, -12.77], //D4
        ],
        // (x1,y1,x2,y2,l)
        closeCoordinate: [],
        imuAlpha: 0,
        imuSteps: 0.5,
        imuMaxDrift: 3,
        acousticMaxDrift: 2.5,
        acousticC64Flag: 0,
        acousticHeight: 3.1,
        acousticSmoothFlag: 0,
        acousticMapLimitFlag: 1,
        acousticImuStaticFlag: 0,
      },
    ],
  ],
};

// const wxfengmap = ()=>{
//   // 获取canvas
//   wx.createSelectorQuery().select('#fengmap').node().exec((res) => {
//   const canvas = res[0].node;
//   console.log('获取到canvas',canvas)
//   wx.createSelectorQuery().select("#overlay").node().exec((tempRes) => {
//     const tmpCanvas = tempRes[0].node;

//     var mapOptions = {
//       container: canvas, // 必要，webgl画布
//       tempCanvas: tmpCanvas, // 必要，2d画布
//       appName: '蜂鸟研发SDK_2_0',
//       key: '57c7f309aca507497d028a9c00207cf8',
//     };

//     //初始化地图对象
//     fmap = new fengmap.FMMap(mapOptions);
//   })
// })

// }


const settingYanjiuyuan = {
  settings: [
    [
    {
  vMaxTh: 0.5,
  vRatioTh: 0.3,
  pMaxTh: 2000,
  maxRatioTh: 0,
  frequencyStart: 17000,
  frequencyEnd: 19000,
  durationTime:  0.03,
  totalLength: 9.85,
  soundSpeed: 340,
  lngStart: 120.000600,
  lngEnd: 120.000700,
  latStart: 30,
  latEnd: 30,
  timeIntervals: [0.15,0.15,0.15,0.15],
  timeInterval:0.15,
  coordinate: [
          [0, 0],
          [0, 3.4],
          [4.4, 3.4],
          [4.4, 0],
  ],
  imuAlpha: 0,
  imuSteps: 0.5,
  imuMaxDrift: 3,
  acousticMaxDrift: 2.5,
  acousticC64Flag: 0,
  acousticHeight: 2.7,
  acousticSmoothFlag: 0,
  acousticMapLimitFlag: 0,
  acousticImuStaticFlag: 0,
},
{
  vMaxTh: 0.5,
  vRatioTh: 0.3,
  pMaxTh: 2000,
  maxRatioTh: 0,
  frequencyStart: 19000,
  frequencyEnd: 21000,
  durationTime:  0.03,
  totalLength: 9.85,
  soundSpeed: 340,
  lngStart: 120.000600,
  lngEnd: 120.000700,
  latStart: 30,
  latEnd: 30,
  timeIntervals: [0.15,0.15,0.15,0.15],
  timeInterval:0.15,
  coordinate: [
  [0,8.6],
  [0, 3.4],
  [4.4, 3.4],
  [4.4, 8.6],
  ],
  imuAlpha: 0,
  imuSteps: 0.5,
  imuMaxDrift: 3,
  acousticMaxDrift: 2.5,
  acousticC64Flag: 0,
  acousticHeight: 2.7,
  acousticSmoothFlag: 0,
  acousticMapLimitFlag: 0,
  acousticImuStaticFlag: 0,
},
{
  vMaxTh: 0.5,
  vRatioTh: 0.3,
  pMaxTh: 2000,
  maxRatioTh: 0,
  frequencyStart: 19000,
  frequencyEnd: 21000,
  durationTime:  0.03,
  totalLength: 9.85,
  soundSpeed: 340,
  lngStart: 120.000600,
  lngEnd: 120.000700,
  latStart: 30,
  latEnd: 30,
  timeIntervals: [0.15,0.15,0.15,0.15],
  timeInterval:0.15,
  coordinate: [
  [0,0],
          [4.4, 0],
          [0, 8.6],
          [4.4,8.6],
  ],
  imuAlpha: 0,
  imuSteps: 0.5,
  imuMaxDrift: 3,
  acousticMaxDrift: 2.5,
  acousticC64Flag: 0,
  acousticHeight: 2.7,
  acousticSmoothFlag: 0,
  acousticMapLimitFlag: 0,
  acousticImuStaticFlag: 0,
}
    ],
  ],
}
export default {
  setting1,
  setting2,
  setting1D,
  setting2D,
  settingSuzhou,
  settingShengBo,
  settingCangKu,
  settingYanjiuyuan,
  props: ["frequencystart"],
  components: {},
  data() {
    return {
      version: "develop", // 小程序版本状态，["release", "develop"]
      inited: false,
      menushow: false, //菜单

      audioValue: "", //录音内容
      duration: 0, //录音时长
      recodeStatus: 0, //录音状态 0:未录音,1:正在录音2:录音完成
      playStatus: 0, //播放状态 0:未播放,1:正在播放
      recoderAuthStatus: false, //录音授权状态
      recorderManager: null, // 音频管理器实例
      leftArray: [],
      lastFrame: [],
      lastfftFrame: [],
      socketStatus: null,
      signalRef: [],
      frameSequence: 1,
      chartData: {
        series: [
          {
            name: "基站",
            data: [],
          },
          {
            name: "声波",
            data: [],
          },
          {
            name: "IMU",
            data: [],
          },
          {
            name: "融合",
            data: [],
          },
        ],
      },
      worker: null, // worker线程监听上升沿波峰
      consoleText: "",
      timeStamps1: [],
      timeStamps2: [],
      startTime: null,
      examinationTypeArray: ["userId01", "userId02", "testFile"],
      examinationTypeIndex: 2,
      examinationTypeArrayType: "userId01",
      LocationSceneTypeArray: [
        "二维定位",
        "一维定位三基站",
        "一维定位",
        "体育馆定位",
        "苏州定位",
        "省博定位",
        "仓库定位",
        "湖州研究院定位",
      ],
      LocationSceneTypeIndex: 5,
      LocationSceneTypeArrayType: "湖州研究院定位",
      LocationTypeArray: ["声波", "IMU", "融合", "数据录制"],
      LocationTypeIndex: 0,
      LocationTypeArrayType: "声波",
      lastInfo2: [],
      count2: 0,
      isOneCluster: true,
      chartskey: true,

      imuTimestamp: 99,
      //imuTimestamp
      waitAccel: true,
      acceleration: {},
      orientation: {},
      imuData: {},
      imuDataList: [],
      lastLoc: null,
      lostCount: 0,
      lastDis: null,
      needFuse: false,
      recordStartTime: 0,
      fuseAcoOnly: true,
      commonParameters: {},
    };
  },
  onLoad() {
    // initFengmap();
    // wxfengmap();
    this.commonInit();
    // 打印日志在频幕上
    this.overrideConsole();
    // 检查录音权限
    this.getAuthSetting();
    let that = this;

    // 创建worker线程
    this.worker = wx.createWorker("static/workers/worker.js", {
      useExperimentalWorker: true,
    });
    // 监听worker被系统回收事件
    this.worker.onProcessKilled(() => {
      // 重新创建一个worker
      that.worker = wx.createWorker("static/workers/worker.js", {
        useExperimentalWorker: true,
      });
      that.initWorkerListener();
      that.updateSetting();
    });
    this.initWorkerListener();
    if (this.worker) {
      this.updateSetting();
    }
    // 初始化录音管理器
    this.initRecorderManager();
    this.storageData();
  },

  // 加了charts v-if强制重新刷新
  onShow() {
    this.getStorageData();
    console.log("onShow");
    if (!this.inited) {
      this.inited = true;
      return;
    }
    this.chartskey = false;
    setTimeout(() => {
      this.chartskey = true;
    }, 500);

    // this.updateSetting();
  },

  onUnload() {
    // 卸载页面
    console.log("卸载页面");
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  },
  methods: {
    storageData() {
      //一维三个基站
      if (!wx.getStorageSync("setting1" || !wx.getStorageSync("setting2"))) {
        uni.setStorageSync("setting1", setting1);
        uni.setStorageSync("setting2", setting2);
      }
      //一维
      if (!wx.getStorageSync("setting1D")) {
        uni.setStorageSync("setting1D", setting1D);
      }
      //二维
      if (!wx.getStorageSync("setting2D")) {
        uni.setStorageSync("setting2D", setting2D);
        console.log("setting2d", this.setting2D);
      }
      //苏州
      if (!wx.getStorageSync("settingSuzhou")) {
        uni.setStorageSync("settingSuzhou", settingSuzhou);
      }
      //省博物馆
      if (!wx.getStorageSync("settingShengBo")) {
        uni.setStorageSync("settingShengBo", settingShengBo);
      } else if (settingShengBo != !wx.getStorageSync("settingShengBo")) {
        uni.setStorageSync("settingShengBo", settingShengBo);
      }
      //湖州研究院
      if (!wx.getStorageSync("settingYanjiuyuan")) {
        uni.setStorageSync("settingYanjiuyuan", settingYanjiuyuan);
      } else if (settingYanjiuyuan != !wx.getStorageSync("settingYanjiuyuan")) {
        uni.setStorageSync("settingYanjiuyuan", settingYanjiuyuan);
      }
      // 仓库
      if (!wx.getStorageSync("settingCangKu")) {
        uni.setStorageSync("settingCangKu", settingCangKu);
      } else if (settingCangKu != !wx.getStorageSync("settingCangKu")) {
        uni.setStorageSync("settingCangKu", settingCangKu);
      }
    },
    getStorageData() {
      // 通用参数
      this.commonParameters = wx.getStorageSync("commonParameters");
      if(this.commonParameters == ""){
        this.commonParameters = {}
      }

      //一维三个基站
      this.setting1 = uni.getStorageSync("setting1", this.setting1);
      this.setting2 = uni.getStorageSync("setting2", this.setting2);
      if (
        this.LocationSceneTypeArrayType ==
        LocationSceneTypeArrayType1DThreeBeacon
      ) {
        this.chartData["series"][0]["data"][0] = this.setting1.coordinate[0];
        this.chartData["series"][0]["data"][1] = this.setting1.coordinate[1];
        this.chartData["series"][0]["data"][2] = this.setting2.coordinate[1];
        this.updateSetting();
      }

      //一维
      this.setting1D = uni.getStorageSync("setting1D", this.setting1D);
      if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayType1D) {
        this.chartData["series"][0]["data"] = this.setting1D.coordinate;
        this.updateSetting();
      }

      //二维
      this.setting2D = uni.getStorageSync("setting2D", this.setting2D);
      console.log("缓存的setting2d", this.setting2D);
      if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayType2D) {
        this.chartData["series"][0]["data"] = this.setting2D.coordinate;
        this.updateSetting();
      }

      //苏州
      this.settingSuzhou = uni.getStorageSync(
        "settingSuzhou",
        this.settingSuzhou
      );
      if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeSuzhou) {
        this.chartData["series"][0]["data"] = this.settingSuzhou.coordinate;
        this.updateSetting();
      }

      //浙江省博
      this.settingShengBo = uni.getStorageSync(
        "settingShengBo",
        this.settingShengBo
      );
      if (this.LocationSceneTypeArrayType == "省博定位") {
        let coordinates = [];
        for (let i = 0; i < this.settingShengBo["settings"][0].length; i++) {
          let coordinate = this.settingShengBo["settings"][0][i].coordinate;
          // console.log("coordinate:", coordinate);
          coordinates.push(...this.settingShengBo["settings"][0][i].coordinate);
        }
        console.log("coordinates:", coordinates);
        this.chartData["series"][0]["data"] = coordinates; // all coordinates
        this.updateSetting();
      }

      //湖州研究院
      // TODO 替换成湖州研究院的配置
       this.settingYanjiuyuan = uni.getStorageSync(
        "settingYanjiuyuan",
        this.settingYanjiuyuan
      );
      if (this.LocationSceneTypeArrayType == "湖州研究院定位") {
        let coordinates = [];
        for (let i = 0; i < this.settingYanjiuyuan["settings"][0].length; i++) {
          let coordinate = this.settingYanjiuyuan["settings"][0][i].coordinate;
          console.log("coordinate:", coordinate);
          coordinates.push(...this.settingYanjiuyuan["settings"][0][i].coordinate);
        }
        console.log("coordinates:", coordinates);
        this.chartData["series"][0]["data"] = coordinates; // all coordinates
        this.settingYanjiuyuan.settings[0][0].imuAlpha = this.commonParameters.alpha;
        this.updateSetting();
      }
      // 仓库
      this.settingCangKu = uni.getStorageSync(
        "settingCangKu",
        this.settingCangKu
      );
      if (this.LocationSceneTypeArrayType == "仓库定位") {
        let coordinates = [];
        for (let i = 0; i < this.settingCangKu["settings"][0].length; i++) {
          let coordinate = this.settingCangKu["settings"][0][i].coordinate;
          console.log("coordinate:", coordinate);
          coordinates.push(...this.settingCangKu["settings"][0][i].coordinate);
        }
        console.log("coordinates:", coordinates);
        this.chartData["series"][0]["data"] = coordinates; // all coordinates
        this.settingCangKu.settings[0][0].imuAlpha = this.commonParameters.alpha;
        this.updateSetting();
      }
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
          this.imuTimestamp = new Date().getTime();
          this.acceleration = {
            timestamp: this.imuTimestamp,
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
            timestamp: this.imuTimestamp,
            alpha: res.alpha,
            beta: res.beta,
            gamma: res.gamma,
          };
          this.imuData = {
            timestamp: this.imuTimestamp,
            alpha: this.orientation.alpha,
            beta: this.orientation.beta,
            gamma: this.orientation.gamma,
            x: this.acceleration.x,
            y: this.acceleration.y,
            z: this.acceleration.z,
          };
          if (this.LocationTypeArrayType === "融合" || this.LocationTypeArrayType == "IMU") {
            this.imuDataList.push(this.imuData);
            if (this.imuDataList.length >= 25) {
              this.worker.postMessage({
                code: "updateStepList",
                dataType: "imuDataList",
                locationType: this.LocationSceneTypeArrayType,
                imuDataList: this.imuDataList,
                acoOnly: this.fuseAcoOnly,
              });
              this.imuDataList = [];
            }
          } else if (this.LocationTypeArrayType === "数据录制") {
            this.imuDataList.push({
              timestamp: this.imuTimestamp,
              alpha: this.orientation.alpha,
              beta: this.orientation.beta,
              gamma: this.orientation.gamma,
              x: this.acceleration.x,
              y: this.acceleration.y,
              z: this.acceleration.z,
            });
          } else {
            this.worker.postMessage({
              code: "pdr",
              imuData: this.imuData,
            });
          }
          this.waitAccel = true;
        }
      });
    },
    uploadJsonData(data, fileName) {
      let fs = wx.getFileSystemManager();
      let filePath = `${wx.env.USER_DATA_PATH}` + "/" + fileName;
      let data_str = JSON.stringify(data);
      fs.writeFileSync(filePath, data_str, "utf8");
      wx.uploadFile({
        url:
          DEBUGUPLOADSERVER + "acoustic_loc/upload/" + "?filename=" + fileName,
        name: "file",
        filePath: filePath,
        formData: {
          type: "txt",
        },
        success(res) {
          console.log("上传文件成功");
        },
        fail(res) {
          console.log("上传文件失败" + res);
        },
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
    //设置
    changeMenu() {
      this.menushow = !this.menushow;
    },
    toScanSettingCode() {
      console.log("in scanCode");
      wx.scanCode({
        success: (res) => {
          let setting = JSON.parse(res.result);
          console.log(setting);
          this.worker.postMessage({
            code: "updateSetting",
            locType: this.LocationSceneTypeArrayType,
            setting: setting,
          });
        },
      });
    },
    toShowSettingCode() {
      let setting;

      if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayType2D) {
        setting = this.setting2D;
      } else if (
        this.LocationSceneTypeArrayType ==
        LocationSceneTypeArrayType1DThreeBeacon
      ) {
        // TODO
        setting = [this.setting1, this.setting2];
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayType1D
      ) {
        setting = this.setting1D;
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeSuzhou
      ) {
        setting = this.settingSuzhou;
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeShengBo
      ) {
        setting = this.settingShengBo;
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeCangKu
      ) {
        setting = this.settingCangKu;
      }else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeYanjiuyuan
      ) {
        setting = this.settingYanjiuyuan;
      }

      setting = JSON.stringify(setting);

      new QRCode("settingQrcode", {
        text: setting,
        width: 200,
        height: 200,
        padding: 12, // 生成二维码四周自动留边宽度，不传入默认为0
        correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
        callback: (res) => {
          wx.showShareImageMenu({
            path: res.path,
          });
        },
      });
    },
    toSettings() {
      console.log("toSettings in ");
      if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayType2D) {
        console.log("toSettings " + LocationSceneTypeArrayType2D);
        uni.navigateTo({ url: "../../pagesSetting/settings2d/settings2d" });
      } else if (
        this.LocationSceneTypeArrayType ==
        LocationSceneTypeArrayType1DThreeBeacon
      ) {
        console.log("toSettings " + LocationSceneTypeArrayType1DThreeBeacon);
        uni.navigateTo({
          url: "../../pagesSetting/settings1dThreeBeacon/settings1dThreeBeacon",
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayType1D
      ) {
        console.log("toSettings " + LocationSceneTypeArrayType1D);
        uni.navigateTo({ url: "../../pagesSetting/settings1d/settings1d" });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeSuzhou
      ) {
        console.log("toSettings " + LocationSceneTypeArrayTypeSuzhou);
        uni.navigateTo({
          url: "../../pagesSetting/settingsSuzhou/settingsSuzhou",
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeShengBo
      ) {
        console.log("toSettings " + LocationSceneTypeArrayTypeShengBo);
        uni.navigateTo({
          url: "../../pagesSetting/settingsShengBo/settingsShengBo",
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeYanjiuyuan
      ) {
        console.log("toSettings " + LocationSceneTypeArrayTypeYanjiuyuan);
        uni.navigateTo({
          url: "../../pagesSetting/settingsYanjiuyuan/settingsYanjiuyuan",
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeCangKu
      ) {
        console.log("toSettings " + LocationSceneTypeArrayTypeCangKu);
        uni.navigateTo({
          url: "../../pagesSetting/settingsCangKu/settingsCangKu",
        });
      } else {
        console.log("toSettings " + this.LocationSceneTypeArrayType + "未实现");
        return;
      }
    },
    toAbout() {
      console.log("toAbout in ");
      uni.navigateTo({
        url: "../../pagesSetting/about/about",
      });
    },

    examinationType(e) {
      this.examinationTypeIndex = e.target.value;
      this.examinationTypeArrayType = this.examinationTypeArray[
        this.examinationTypeIndex
      ];
      this.updateSetting();
    },

    LocationSceneType(e) {
      this.LocationSceneTypeIndex = e.target.value;
      this.LocationSceneTypeArrayType = this.LocationSceneTypeArray[
        this.LocationSceneTypeIndex
      ];
      if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayType2D) {
        console.log("LocationSceneType " + LocationSceneTypeArrayType2D);
        this.getStorageData();
      } else if (
        this.LocationSceneTypeArrayType ==
        LocationSceneTypeArrayType1DThreeBeacon
      ) {
        console.log(
          "LocationSceneType " + LocationSceneTypeArrayType1DThreeBeacon
        );
        this.getStorageData();
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayType1D
      ) {
        console.log("LocationSceneType " + LocationSceneTypeArrayType1D);
        this.getStorageData();
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeStadium
      ) {
        console.log("LocationSceneType " + LocationSceneTypeArrayTypeStadium);
        this.chartData = {
          series: [
            {
              name: "beacon坐标",
              data: [
                [5, 18],
                [0, 18],
                [0, 0],
                [10, 0],
                [10, 18],
                [15, 18],
                [20, 18],
                [20, 0],
                [10, 0],
                [10, 18],
                [25, 18],
                [20, 18],
                [20, 0],
                [30, 0],
                [30, 18],
              ],
            },
            {
              name: "定位位置",
              data: [[0.1, 0]],
            },
          ],
        };
        this.getStorageData();
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeSuzhou
      ) {
        console.log("LocationSceneType " + LocationSceneTypeArrayTypeSuzhou);
        this.getStorageData();
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeShengBo
      ) {
        console.log("LocationSceneType " + LocationSceneTypeArrayTypeShengBo);
        this.getStorageData();
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeYanjiuyuan
      ) {
        console.log("LocationSceneType " + LocationSceneTypeArrayTypeYanjiuyuan);
        this.getStorageData();
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeCangKu
      ) {
        console.log("LocationSceneType " + LocationSceneTypeArrayTypeCangKu);
        this.getStorageData();
      } else {
        console.log(
          "LocationSceneType " + this.LocationSceneTypeArrayType + "未实现"
        );
        return;
      }
      this.updateSetting();
    },

    LocationType(e) {
      this.LocationTypeIndex = e.target.value;
      this.LocationTypeArrayType = this.LocationTypeArray[
        this.LocationTypeIndex
      ];
      this.updateSetting();
    },

    // 常用初始化
    commonInit() {
      this.version = wx.getAccountInfoSync().miniProgram.envVersion;
    },

    updateSetting() {
      if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayType2D) {
        this.worker.postMessage({
          code: "updateSetting",
          locType: this.LocationSceneTypeArrayType,
          beaconCluster2D: this.setting2D,
        });
      } else if (
        this.LocationSceneTypeArrayType ==
        LocationSceneTypeArrayType1DThreeBeacon
      ) {
        this.worker.postMessage({
          code: "updateSetting",
          locType: this.LocationSceneTypeArrayType,
          beaconCluster1: this.setting1,
          beaconCluster2: this.setting2,
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayType1D
      ) {
        this.worker.postMessage({
          code: "updateSetting",
          locType: this.LocationSceneTypeArrayType,
          beaconCluster1D: this.setting1D,
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeSuzhou
      ) {
        this.worker.postMessage({
          code: "updateSetting",
          locType: this.LocationSceneTypeArrayType,
          setting: this.settingSuzhou,
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeShengBo
      ) {
        this.worker.postMessage({
          code: "updateSetting",
          locType: this.LocationSceneTypeArrayType,
          setting: this.settingShengBo,
        });
      } 
      else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeYanjiuyuan
      ) {
        console.log('worker send',this.settingYanjiuyuan)
        this.worker.postMessage({
          code: "updateSetting",
          locType: this.LocationSceneTypeArrayType,
          setting: this.settingYanjiuyuan, // TODO 
        });
      } else if (
        this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeCangKu
      ) {
        this.worker.postMessage({
          code: "updateSetting",
          locType: this.LocationSceneTypeArrayType,
          setting: this.settingCangKu,
          commonParameters: this.commonParameters,
        });
        if (Object.keys(this.commonParameters).length > 0) {
          uni.setStorageSync("commonParameters", this.commonParameters);
        }
      }
    },

    // 打印日志在频幕上
    overrideConsole() {
      if (console.log) {
        var old = console.log;
        let that = this;
        console.log = function() {
          that.consoleText +=
            new Date().format("hh:mm:ss") +
            " " +
            JSON.stringify(arguments) +
            "\n";
          old.apply(this, arguments);
        };
      }
    },
    // 开始录音
    startRecorder(index) {
      wx.showToast({
        title: "alpha=" + this.commonParameters.alpha,
        duration: 500,
      });
      let that = this;
      if (this.recoderAuthStatus) {
        if (this.examinationTypeArrayType === "testFile") {
          this.testWithFile();
          this.recodeStatus = 1;
          this.postStartRecordTime();
        } else {
          if (
            this.LocationTypeArrayType === "数据录制" ||
            this.LocationTypeArrayType === "融合" ||
            this.LocationTypeArrayType === "IMU"
          ) {
            this.initSensorListening();
          }

          this.recorderManagerStart();
          this.postStartRecordTime();
        }
      } else {
        wx.openSetting({
          success(res) {
            if (res.authSetting["scope.record"]) {
              that.recoderAuthStatus = true;
              that.recorderManagerStart();
            }
          },
        });
      }
    },
    //调用recorderManager.start开始录音
    recorderManagerStart() {
      this.recorderManager.start({
        format: "pcm",
        duration: 600000,
        numberOfChannels: 2,
        sampleRate: 48000,
        encodeBitRate: 320000,
        frameSize: 36,
      });
      this.recodeStatus = 1;
      // 主动调用抓拍接口
      // wx.request({
      //     url: 'http://118.25.35.105:8090/api/v1/snapshot', //仅为示例，并非真实的接口地址
      //     method: 'POST',
      //     data: {
      //
      //     },
      //     header: {
      //         'content-type': 'application/json' // 默认值
      //     },
      //     success: (res) => {
      //         console.log("抓拍 成功")
      //     },
      // });
    },
    // 播放录音
    playVoice(index) {
      if (this.playStatus == 0) {
        //未播放状态则点击播放
        if (!this.audioValue) {
          this.tip("请先录音！");
          return;
        }
        this.playStatus = 1;
        this.innerAudioContext.src = this.audioValue;
        this.innerAudioContext.play();
      } else {
        //正在播放状态,则点击暂停
        this.playStatus = 0;
        this.innerAudioContext.stop();
      }
    },
    // 结束录音
    stopRecorder(index) {
      this.recodeStatus = 2;
      this.recorderManager.stop();
      if (
        this.examinationTypeArrayType != "testFile" &&
        ["IMU", "融合", "数据录制"].includes(this.LocationTypeArrayType)
      ) {
        this.stopSensorListening();
      }
      this.worker.postMessage({
        code: "reset",
      });
      console.log("stopRecorder");
    },
    // 删除录音
    removeRecoder(index) {
      this.audioValue = "";
      this.recodeStatus = 0;
      this.playStatus = 0;
      this.duration = 0;

      this.imuDataList = [];
      this.chartData.series[1].data = [];

      this.worker.postMessage({
        code: "fuse",
        dataType: "startPosition",
        startPosition: {
          timestamp: 0,
          x: 0,
          y: 0,
        },
      });
    },
    // 获取权限设置
    getAuthSetting() {
      let that = this;
      uni.getSetting({
        success(res) {
          if (!res.authSetting["scope.record"]) {
            wx.authorize({
              scope: "scope.record",
              success() {
                that.recoderAuthStatus = true;
              },
              fail() {
                that.recoderAuthStatus = false;
              },
            });
          } else {
            that.recoderAuthStatus = true;
          }
        },
      });
    },

    // 格式化录音时间
    fmtRecoderTime(duration = 0) {
      duration = duration / 1000;
      const seconds = duration.toString().split(".")[0]; //取秒
      return seconds;
    },

    // 提示弹窗
    tip(msg) {
      uni.showModal({
        title: "提示",
        content: msg,
        showCancel: false,
      });
    },
    // 发送post请求， 解算位置
    async postLocationResolveRequest(params) {
      console.log("postLocationResolveRequest 参数", params);
      console.log("发送数据");
      uni.sendSocketMessage({
        data: JSON.stringify(params),
      });
    },
    initWorkerListener() {
      let self = this;
      if (this.worker) {
        this.worker.onMessage((res) => {
          switch (res.code) {
            case 'console':
              console.log('wconsole',res.context)
              break;
            case "tdoaInfo":
              if (res.tdoaInfo) {
                res.tdoaInfo.forEach((x) => {
                  if (x.tdoa > 0) {
                    console.log("worker rec tdoa1", {freq:res.freq,tdoa:x.tdoa});
                  }
                });
              }
              if (res.tdoaInfo2) {
                res.tdoaInfo2.forEach((x) => {
                  if (x.tdoa > 0) {
                    console.log("tdoa2", x.tdoa);
                  }
                });
              }
              break;
            case "distances1":
              res.distances.forEach((x) => {
                console.log("距离", x);
              });
              break;
            case "distances":
              //计算平均值
              let avg = function(array) {
                let sum = 0;
                for (var i = 0; i < array.length; i++) {
                  sum += array[i];
                }
                return sum / array.length;
              };
              if (res.distances1.length > 0) {
                console.log("distances1", res.distances1);
                let avgdis1 = avg(res.distances1);
                if (
                  avgdis1 > setting1.totalLength - 0.4 &&
                  avgdis1 < setting1.totalLength + 0.9
                ) {
                  if (
                    Math.abs(this.chartData.series[1].data[0][0] - avgdis1) >
                    0.3
                  ) {
                    this.chartData.series[1].data[0][0] = avgdis1;
                  }
                } else if (avgdis1 <= setting1.totalLength - 0.2) {
                  this.chartData.series[1].data[0][0] = avgdis1;
                }
                console.log(" 位置:", this.chartData.series[1].data[0][0]);
              }
              if (res.distances2.length > 0) {
                console.log("distances2", res.distances2);

                let avgdis2 = avg(res.distances2);
                if (avgdis2 > -0.4 && avgdis2 < 0.9) {
                  if (
                    Math.abs(
                      this.chartData.series[1].data[0][0] -
                        avgdis2 -
                        setting1.totalLength
                    ) > 0.3
                  ) {
                    this.chartData.series[1].data[0][0] = avgdis2;
                  }
                } else if (avgdis2 >= 0.9) {
                  this.chartData.series[1].data[0][0] =
                    avg(res.distances2) + setting1.totalLength;
                }
              }
              break;
            case "distances_nanchang": {
              //计算平均值
              let avg = function(array) {
                let sum = 0;
                for (var i = 0; i < array.length; i++) {
                  sum += array[i];
                }
                return sum / array.length;
              };
              if (res.distances1.length > 0) {
                console.log("distances1", res.distances1);
                let avgdis1 = avg(res.distances1);
                if (this.lastDis == null) {
                  this.chartData.series[1].data[0][0] = avgdis1;
                  this.lastDis = avgdis1;
                } else {
                  if (Math.abs(avgdis1 - this.lastDis) > 7) {
                    this.lostCount++;
                    if (this.lostCount > 2) {
                      this.lastDis = null;
                      this.lostCount = 0;
                    }
                  } else {
                    this.chartData.series[1].data[0][0] = avgdis1;
                    this.lastDis = avgdis1;
                    this.lostCount = 0;
                  }
                }
              }
              if (res.distances2.length > 0) {
                console.log("distances2", res.distances2);
                let avgdis2 = avg(res.distances2);
                console.log(
                  "avgdis2 + setting1.totalLength",
                  avgdis2 + setting1.totalLength
                );
                if (this.lastDis == null) {
                  this.chartData.series[1].data[0][0] =
                    avgdis2 + setting1.totalLength;
                  this.lastDis = avgdis2 + setting1.totalLength;
                } else {
                  if (
                    Math.abs(avgdis2 + setting1.totalLength - this.lastDis) > 7
                  ) {
                    this.lostCount++;
                    if (this.lostCount > 2) {
                      this.lastDis = null;
                      this.lostCount = 0;
                    }
                  } else {
                    this.chartData.series[1].data[0][0] =
                      avgdis2 + setting1.totalLength;
                    this.lastDis = avgdis2 + setting1.totalLength;
                    this.lostCount = 0;
                  }
                }
              }
              break;
            }
            case "coordinate":
              if (res.coordinate2 && res.coordinate2.length > 0) {
                let last = res.coordinate2[0];
              } else if (res.coordinate1 && res.coordinate1.length > 0) {
                let last = res.coordinate1[0];
              }
              break;
            case "clusterIndex":
              break;
            case "location":
              
              if (res.location != null) {
                // console.log('worker线程计算出定位结果,主线程收到:',res.location)
                if (res.type && res.type == "suzhou") {
                  let locations = res.location;
                  console.log("suzhou locations", locations);
                  for (let i = locations.length - 1; i >= 0; i--) {
                    let loc = locations[i];
                    if (this.lastLoc != null) {
                      if (
                        Math.abs(this.lastLoc[0] - loc[0]) < 4 &&
                        Math.abs(this.lastLoc[1] - loc[1]) < 4
                      ) {
                        // console.log(Math.abs(this.lastLoc[0] - loc[0]), Math.abs(this.lastLoc[0] - loc[0]));
                        // console.log("suzhou locations", loc);
                        this.chartData.series[1].data[0][0] = loc[0];
                        this.chartData.series[1].data[0][1] = loc[1];
                        this.lastLoc = [loc[0], loc[1]];
                      } else {
                        this.lostCount++;
                        if (this.lostCount == 3) {
                          this.lastLoc = null;
                          this.lostCount = 0;
                        }
                      }
                    } else {
                      this.chartData.series[1].data[0][0] = loc[0];
                      this.chartData.series[1].data[0][1] = loc[1];
                      this.lastLoc = [loc[0], loc[1]];
                    }
                  }
                } else if (res.type && res.type == "1D") {
                    this.chartData.series[1].data = [[res.location.x,0]];
                } else if (res.type && res.type == "shengbo") {
                  // 显示层的位置和坐标的位置
                  console.log(
                    "update the location as " + JSON.stringify(res.location)
                  );
                  console.log("楼层:" + res.floorString);
                  if (this.settingShengBo.autoFloorRec == 1) {
                    // let outputFloorString = { "-1": "通用层", "0": "-1层", "1": "1层", "2": "2层", "3": "2层小房间", "4": "大厅" };
                    let settingShengBoIndex = -1;
                    if (res.floorString == "通用层") {
                      settingShengBoIndex = 0;
                    } else if (res.floorString == "-1层") {
                      settingShengBoIndex = 1;
                    } else if (res.floorString == "1层") {
                      settingShengBoIndex = 2;
                    } else if (res.floorString == "2层") {
                      settingShengBoIndex = 3;
                    } else if (res.floorString == "2层小房间") {
                      settingShengBoIndex = 4;
                    } else if (res.floorString == "大厅") {
                      settingShengBoIndex = -1;
                    }
                    let coordinates = [];
                    if (settingShengBoIndex != -1) {
                      for (
                        let i = 0;
                        i <
                        this.settingShengBo["settings"][settingShengBoIndex]
                          .length;
                        i++
                      ) {
                        let coordinate = this.settingShengBo["settings"][
                          settingShengBoIndex
                        ][i].coordinate;
                        // console.log("coordinate:", coordinate);
                        coordinates.push(
                          ...this.settingShengBo["settings"][
                            settingShengBoIndex
                          ][i].coordinate
                        );
                      }
                    }
                    // console.log("coordinates:", coordinates);
                    this.chartData["series"][0]["data"] = coordinates; // all coordinates
                  }
                  this.chartData.series[1].data[0] = [
                    res.location.x,
                    res.location.y,
                  ];
                }else if (res.type && res.type == "yanjiuyuan"){
                  
                  // 显示层的位置和坐标的位置
                  //   this.chartData.series[1].data[0][0] = res.location[0];
                  //   this.chartData.series[1].data[0][1] = res.location[1];
                  if(JSON.stringify(res.location) != "{}"){
                    console.log("yanjiuyuan----location:", {x:res.location.x.toFixed(2),y:res.location.y.toFixed(2)});
                    this.chartData.series[1].data = [[res.location.x, res.location.y]];
                    if(this.examinationTypeArrayType == "userId01" || this.examinationTypeArrayType == "testFile") {
                      this.postLocation(res)
                    }
                  }
                }
                 else if (res.type && res.type == "cangku") {
                  console.log("cangku----location:", res.location);
                  // 显示层的位置和坐标的位置
                  //   this.chartData.series[1].data[0][0] = res.location[0];
                  //   this.chartData.series[1].data[0][1] = res.location[1];
                  this.chartData.series[1].data = [[res.location.x, res.location.y]];
                  if(this.examinationTypeArrayType == "userId01" || this.examinationTypeArrayType == "testFile") {
                    this.postLocation(res)
                  }
                }
                else if (res.type && res.type =="IMU"){
                  console.log("进入IMU循环")
                  this.chartData.series[2].data = [[res.location.x,0]];
                }
                else if(res.type && res.type =="Fusion"){
                  console.log("进入Fusion循环")
                  this.chartData.series[3].data = [[res.location.x, res.location.y]];
                } else {
                  // console.log("兜底")
                  
                  console.log("reslocation:",res.location)
                  this.chartData["series"][1]["data"][0] = [res.location[0],res.location[1]]
      
                  // console.log("更新图标数据：",this.chartData)
                





                }
              }
              break;
            case "console":
              // console.log(res.content);
              break;
            case "fused-track":
            case "pdr_track":
              this.chartData.series[1].data = res.track;
              break;
            case "log":
              this.consoleText =
                "[" +
                new Date().format("hh:mm:ss") +
                "]" +
                res.msg +
                "\n" +
                this.consoleText;
              break;
            case "debug":
              this.uploadJsonData(
                res.data,
                "debugData." + this.recordStartTime + ".json"
              );
              break;
            default:
              break;
          }
        });
      }
    },
    // 初始化录音管理器

    initRecorderManager() {
      const recorderManager = uni.getRecorderManager();
      this.recorderManager = recorderManager;
      recorderManager.onError((res) => {
        console.log(res);
      });
      let that = this;

      // 每帧进行计算
      recorderManager.onFrameRecorded((res) => {
        const { frameBuffer } = res;
        let code;
        if (this.worker) {
          if (this.LocationSceneTypeArrayType == LocationSceneTypeArrayType2D) {
            code = "frameBuffer2d";
          } else if (
            this.LocationSceneTypeArrayType ==
            LocationSceneTypeArrayType1DThreeBeacon
          ) {
            code = "frameBuffer1DThreeBeacon";
          } else if (
            this.LocationSceneTypeArrayType == LocationSceneTypeArrayType1D
          ) {
            code = "frameBuffer1D";
          } else if (
            this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeStadium
          ) {
            code = "frameBuffer_stadium";
          } else if (
            this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeSuzhou
          ) {
            code = "frameBuffer_suzhou";
          } else if (
            this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeShengBo
          ) {
            code = "frameBuffer_shengbo";
          } else if (
            this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeShengBo
          ) {
            code = "frameBuffer_yanjiuyuan";
          } else if (
            this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeYanjiuyuan
          ) {
            code = "frameBuffer_yanjiuyuan";
            this.LocationSceneTypeArrayType == LocationSceneTypeArrayTypeYanjiuyuan

          } else {
            console.log(
              "onFrameRecorded " + this.LocationSceneTypeArrayType + "未实现"
            );
            return;
          }

          let needFuse = false;
          if (this.LocationTypeArrayType == "融合") {
            needFuse = true;
          }

          this.worker.postMessage({
            code: "updateRecordTime",
            recordStartTime: this.imuTimestamp,
          });

          this.worker.postMessage({
            code: code,
            data: frameBuffer.slice(0),
            chartData: JSON.parse(JSON.stringify(that.chartData.series[0])), // chartData作为基站位置信息传输配置
            needFuse: needFuse,
          });
        }
      });

      // 监听录音结束，在这里获取到录音结果。
      recorderManager.onStop((res) => {
        console.log(res);
        const duration = this.fmtRecoderTime(res.duration); //获取录音时长
        console.log("录音时长:" + duration + "秒");
        this.duration = duration;

        // 录音文件的临时路径
        let fs = uni.getFileSystemManager();
        this.audioValue = res.tempFilePath;
        let version = this.version;
        console.log("version", version);
        if (this.LocationTypeArrayType === "数据录制") {
          wx.uploadFile({
            url:
              DEBUGUPLOADSERVER +
              "acoustic_loc/upload/" +
              "?filename=acoustic." +
              this.recordStartTime +
              ".pcm",
            name: "file",
            filePath: res.tempFilePath,
          });
          this.uploadJsonData(
            this.imuDataList,
            "imuData." + this.recordStartTime + ".json"
          );
        }
      });

      // 创建内部 audio 上下文 InnerAudioContext 对象。
      const innerAudioContext = wx.createInnerAudioContext();
      this.innerAudioContext = innerAudioContext;
      // 监听音频自然播放至结束的事件
      innerAudioContext.onEnded(() => {
        //音频自然播放至结束的事件的回调函数
        this.playStatus = 0; // 播放状态重置为未开始
      });
      innerAudioContext.onError((res) => {
        console.log(res);
      });
    },
    // 销毁当前组件音频实例
    destoryInnerAudioContext() {
      this.innerAudioContext.destroy();
      console.log("音频实例销毁");
    },

    downloadFile(url) {
      let filePath = null;
      console.log("start download " + url);
      wx.downloadFile({
        url: url, //仅为示例，并非真实的资源
        success: (res) => {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，文件是否work需确认
          if (res.statusCode === 200) {
            console.log("download" + res.tempFilePath);
            filePath = res.tempFilePath;
          }
        },
        fail(res) {
          console.log(res);
        },
      });
      return filePath;
    },
    json_load(filePath) {
      let result = [];
      const fs = wx.getFileSystemManager();
      fs.readFile({
        filePath: `${filePath}`,
        success: (res) => {
          result = JSON.parse(res.data);
        },
        fail(res) {
          console.log("json-load " + filePath + " failed");
          console.log(res);
        },
      });
      return result;
    },

    postLocation(res) {
        let tt = {
            "beaconId":"1",
            "seceneId":"2",
            "userId": this.examinationTypeArrayType,
            "xpos":res.location.x,
            "ypos":res.location.y,
            "zpos":0,
            "originX":res.location.x,
            "originY":res.location.y,
            "originZ":0,
            "timestamp": formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            "backup1":"backup1",
            "backup2":"backup2",
            "backup3":"backup3",
            "backup4":"backup4",
            "backup5":"backup5"
        };
        // console.log("tt", tt)
      wx.request({
        url: 'http://47.100.0.129:8066/infor/add',
        method:'POST',
        data: tt,
        dataType: "json",
        success: function(res) {
          console.log("postLocation success");
        },
        fail: function(err) {
          console.log("postLocation fail");
        }
      })
    },

    getTrackData(url, dataType) {
      const that = this;
      wx.request({
        url: url,
        data: {},
        method: "get",
        dataType: "json",
        success: function(res) {
          console.log(that);
          that.worker.postMessage({
            code: "fuse",
            dataType: dataType,
            data: res.data,
          });
        },
        fail: function(err) {
          console.log("submit fail");
        },
        complete: function() {
          console.log("submit comlete");
        },
      });
    },
    // 测试时, 从服务器下载音频文件单当做输入
    testWithFile() {
      let defaultSceneDataUrl = {
        [LocationSceneTypeArrayType1DThreeBeacon]: {
          url:
            DEBUGDOWNLOADSERVER +
            "static/data/acoustic_loc/standard/acoustic_1d_data.wav",
        },
        [LocationSceneTypeArrayType1D]: {
          url:
            DEBUGDOWNLOADSERVER +
            "static/data/acoustic_loc/1d/20220109/Recording%20%23119.wav",
        },
        [LocationSceneTypeArrayType2D]: {
          // url:
          //   DEBUGDOWNLOADSERVER +
          //   "static/data/acoustic_loc/standard/2022021903/acoustic.1645260001683.pcm",
          // imuDataUrl:
          //   DEBUGDOWNLOADSERVER +
          //   "static/data/acoustic_loc/standard/2022021903/imuData.1645260001683.json",
          url:
            DEBUGDOWNLOADSERVER +
            "static/data/acoustic_loc/standard/acoustic_2d_data.wav",
        },
        [LocationSceneTypeArrayTypeStadium]: {
          url:
            DEBUGDOWNLOADSERVER +
            "static/data/acoustic_loc/standard/stadium/forward_1.wav",
        },
        [LocationSceneTypeArrayTypeSuzhou]: {
          url: DEBUGDOWNLOADSERVER + "static/data/acoustic_loc/suzhou/Q.wav",
        },
        [LocationSceneTypeArrayTypeShengBo]: {
          url:
            DEBUGDOWNLOADSERVER +
            // "static/data/acoustic_loc/shengbo/c1/20220304_c1/audio/route3.wav",
            "static/data/acoustic_loc/shengbo/c2/20220328_c2/2_Recording%20%23129.wav",
          // "static/data/acoustic_loc/shengbo/c2/20220304_c2/audio/c2route4.wav",
          // "static/data/acoustic_loc/shengbo/c-1/0305/B1route3.wav",
          // url:
          //   DEBUGDOWNLOADSERVER +
          //   "static/data/acoustic_loc/temp/acoustic.1646468014392.pcm",
          // imuDataUrl:
          //   DEBUGDOWNLOADSERVER +
          //   "static/data/acoustic_loc/temp/imuData.1646468014392.json",
          //   url: "http://localhost:8088" + "/file/download/c2route4.wav"
          //   url: "http://localhost:8088" +  "/file/download/20200327100750.wav"
          // url: "http://localhost:8088" +  "/file/download/B1route3.wav"
          //   url: "http://localhost:8088" +  "/file/download/2022-03-2711-01-44.wav"
        },
        [LocationSceneTypeArrayTypeCangKu]: {
          // url: DEBUGDOWNLOADSERVER + "static/data/acoustic_loc/suzhou/Q.wav",
          // url: "http://localhost:8088" +  "/file/download/Recording1517stand.wav",
          url: "http://localhost:8088" +  "/file/download/B1517.wav",
          //   url: "http://localhost:8088" +  "/file/download/2022-03-2711-01-44.wav"
        },
        [LocationSceneTypeArrayTypeYanjiuyuan]:{
          url: "http://localhost:8088" +  "/file/download/yanjiuyuan.wav",
        }
      };
      if (defaultSceneDataUrl[this.LocationSceneTypeArrayType] === null) {
        return;
      }

      if (["融合", "声波"].includes(this.LocationTypeArrayType)) {
        console.log(defaultSceneDataUrl);
        console.log(defaultSceneDataUrl[this.LocationSceneTypeArrayType]);
        let url = defaultSceneDataUrl[this.LocationSceneTypeArrayType].url;
        let headLength = 44;
        if (url.substr(url.length - 3, 3) == "pcm") {
          headLength = 0;
        }
        console.log("从服务器 " + url + " 下载文件");
        wx.downloadFile({
          url: url, //仅为示例，并非真实的资源
          success: (res) => {
            // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，文件是否work需确认
            if (res.statusCode == 200) {
              console.log("成功下载文件" + res.tempFilePath);
              this.readFile(res.tempFilePath, 0, headLength);
            }
          },
        });
        //
      }

      if (["融合", "IMU"].includes(this.LocationTypeArrayType)) {
        let url =
          defaultSceneDataUrl[this.LocationSceneTypeArrayType].imuDataUrl;
        console.log("Get imuData from " + url);
        const that = this;
        wx.request({
          url: url,
          data: {},
          method: "get",
          dataType: "json",
          success: function(res) {
            that.worker.postMessage({
              code: "updateStepList",
              dataType: "imuDataList",
              imuDataList: res.data,
            });
            that.worker.postMessage({
              code: "timeCalibrate",
              timestamp: res.data[0].timestamp,
            });
          },
          fail: function(err) {
            console.log("submit fail");
          },
          complete: function() {
            console.log("submit comlete");
          },
        });
      }
    },
    // 文件读取
    readFile(filePath, countNumber, headLength = 44) {
      // headLength: wav文件为44，pcm文件为0
      let version = this.version;
      if (version == "release") return;

      if (countNumber == null) return;
      if (countNumber >= 500) return;
      const fs = wx.getFileSystemManager();
      let needFuse = false;
      if (this.LocationTypeArrayType == "融合") {
        needFuse = true;
      }
      fs.readFile({
        filePath: `${filePath}`,
        encoding: "binary",
        position: headLength + countNumber * 9600, // wav header byte 44
        length: 9600,
        success: (res) => {
          let inputList = [];
          for (let i = 0; i < res.data.length; i++) {
            inputList.push(res.data.charCodeAt(i));
          }
          // console.log(inputList.slice(0))
          this.worker.postMessage({
            code: "inputDataList",
            data: inputList.slice(0),
            locType: this.LocationSceneTypeArrayType,
            chartData: JSON.parse(JSON.stringify(this.chartData.series[0])),
            needFuse: needFuse,
          });
          this.readFile(filePath, countNumber + 1, headLength);
        },
        fail(res) {
          console.log(res);
        },
      });
    },
    postStartRecordTime() {
      this.startTime = new Date().getTime();
      this.recordStartTime = this.startTime;
      // console.log("updateRecordTime");
      // this.worker.postMessage({
      //   code: "updateRecordTime",
      //   recordStartTime: this.recordStartTime,
      // });
    },
  },
  created() {
    uni.$on("updateSettingEvent", (args) => {
      if (args.locType == LocationSceneTypeArrayType2D) {
        this.setting2D = args.setting2D;
        this.chartData["series"][0]["data"] = this.setting2D.coordinate;
        this.updateSetting();
      } else if (args.locType == LocationSceneTypeArrayType1DThreeBeacon) {
        this.setting1 = args.setting1;
        this.setting2 = args.setting2;
        this.chartData["series"][0]["data"][0] = this.setting1.coordinate[0];
        this.chartData["series"][0]["data"][1] = this.setting1.coordinate[1];
        this.chartData["series"][0]["data"][2] = this.setting2.coordinate[1];
        this.updateSetting();
      } else if (args.locType == LocationSceneTypeArrayType1D) {
        this.setting1D = args.setting1D;
        this.chartData["series"][0]["data"] = this.setting1D.coordinate;
        this.updateSetting();
      } else if (args.locType == LocationSceneTypeArrayTypeSuzhou) {
        this.settingSuzhou = args.settingSuzhou;
        this.chartData["series"][0]["data"] = this.settingSuzhou.coordinate;
        this.updateSetting();
      } else if (args.locType == LocationSceneTypeArrayTypeShengBo) {
        this.settingShengBo = args.settingShengBo;
        let coordinates = [];
        for (let i = 0; i < this.settingShengBo["settings"][0].length; i++) {
          let coordinate = this.settingShengBo["settings"][0][i].coordinate;
          console.log("coordinate:", coordinate);
          coordinates.push(...this.settingShengBo["settings"][0][i].coordinate);
        }
        console.log("coordinates:", coordinates);
        this.chartData["series"][0]["data"] = coordinates; // all coordinates

        this.updateSetting();
      } else if (args.locType == LocationSceneTypeArrayTypeCangKu) {
        this.settingCangKu = args.settingCangKu;
        this.commonParameters.alpha = args.alpha;
        let coordinates = [];
        for (let i = 0; i < this.settingCangKu["settings"][0].length; i++) {
          let coordinate = this.settingCangKu["settings"][0][i].coordinate;
          console.log("coordinate:", coordinate);
          coordinates.push(...this.settingCangKu["settings"][0][i].coordinate);
        }
        console.log("coordinates:", coordinates);
        this.chartData["series"][0]["data"] = coordinates; // all coordinates

        this.updateSetting();
      } else if (args.locType == LocationSceneTypeArrayTypeYanjiuyuan) {
        this.settingYanjiuyuan = args.settingYanjiuyuan;
        this.commonParameters.alpha = args.alpha; // TODO 
        let coordinates = [];
        for (let i = 0; i < this.settingYanjiuyuan["settings"][0].length; i++) {
          let coordinate = this.settingYanjiuyuan["settings"][0][i].coordinate;
          console.log("coordinate:", coordinate);
          coordinates.push(...this.settingYanjiuyuan["settings"][0][i].coordinate);
        }
        console.log("coordinates:", coordinates);
        this.chartData["series"][0]["data"] = coordinates; // all coordinates

        this.updateSetting();
      }
    });
  },
};
</script>

<style scoped lang="scss">
.flex {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.recoder-container {
  padding-top: 50rpx;
  flex-direction: column;
  justify-content: center;
  .voice-pre,
  .voice-ing {
    flex-direction: column;
    justify-content: center;
    margin-left: 26rpx;
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0px 4px 14px 0px rgba(2, 193, 96, 0.21);
  }
  .voice-pre {
    > img {
      width: 80rpx;
      height: 80rpx;
    }
  }
  .voice-ing {
    .icon {
      width: 30rpx;
      height: 30rpx;
      background: #fe2b1a;
      border-radius: 7rpx;
    }
    .time {
      padding-top: 6rpx;
      color: #666;
      font-size: 20rpx;
    }
  }
  .voice-complete-play {
    padding-top: 30rpx;
    padding-left: 60rpx;
    .left {
      margin-right: 40rpx;
      padding-left: 16rpx;
      width: 330rpx;
      height: 76rpx;
      line-height: 76rpx;
      background: linear-gradient(
        90deg,
        rgba(10, 205, 139, 1) 0%,
        rgba(2, 193, 96, 1) 100%
      );
      border-radius: 15rpx;
      .operate-icon {
        justify-content: center;
        margin-right: 32rpx;
        width: 60rpx;
        min-width: 60rpx;
        height: 60rpx;
        background-color: #fff;
        border-radius: 50%;
        > img {
          width: 24rpx;
          height: 24rpx;
        }
      }
      .flow {
        justify-content: center;
        width: 120rpx;
        min-width: 120rpx;
        margin-right: 40rpx;
        width: 86rpx;
        height: 30rpx;
        > img {
          width: 100%;
          height: 100%;
        }
      }
      .voice-total-time {
        color: #fff;
        font-size: 28rpx;
      }
    }
    .right-label {
      color: #6a7fa6;
      font-size: 26rpx;
    }
  }
  .fengmap{
    width:200rpx;
    height: 400rpx;
  }
}
.charts-box {
  width: 750rpx;
  height: 750rpx;
}
.settings-button {
}
.buttons-area {
  display: flex;
  flex-direction: column;
  height: 400rpx;
  width: 90%;
  white-space: pre;
  word-break: break-all;
  font-size: 26rpx;
  overflow: scroll;
}

.userid-box {
  // padding-right: 400rpx;
}

//setting样式
.floatbtn {
  background-color: #20b7d1;
  color: #fff;
  width: 100rpx;
  height: 100rpx;
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 99999;
  border-radius: 120rpx 0rpx 0 0rpx;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 15rpx;
}

.menuarea {
  width: 100%;
  height: 100%;
}

.mask {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 88888;
  background-color: #3b414433;
}

.menulist {
  position: fixed;
  right: 0;
  bottom: 100rpx;
  width: 40vw;
  z-index: 99999;
  background-color: rgb(182, 221, 240);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  view {
    padding-left: 20rpx;
    border-bottom: 1px solid #fff;
    height: 100rpx;
    line-height: 100rpx;
  }
}
</style>
