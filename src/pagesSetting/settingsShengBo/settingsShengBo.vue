<template>
  <view class="content">
    <view class="position-group">
      <view class="uni-form-item uni-column">
        <picker
          @change="floorType"
          :range="floorTypeArray"
          :disabled="autoFloorRec == 0"
        >
          <label>楼层：</label>
          <label class="">{{ floor }}</label>
        </picker>
      </view>
      <view class="uni-form-item uni-column">
        <picker @change="autoFloorRecType" :range="autoFloorRecTypeArray">
          <label>楼层自动区分[0为关闭 1为开启]：</label>
          <label class="">{{ autoFloorRec }}</label>
        </picker>
      </view>
      <!-- 零级循环 -->
      <view
        class="settings_zero"
        v-for="(positionlistItem, positionlistIndex) in positionlist"
        :key="positionlistIndex"
      >
        <text>设置{{ positionlistIndex + 1 }}</text>
        <!-- 一级循环 -->
        <view
          class="settings_one"
          v-for="(item, index) in positionlistItem"
          :key="index"
          :class="item.oneliststare ? 'oneshow' : 'onehide'"
        >
          <view
            class="settings-one-label"
            @click="onelist(positionlistIndex, index)"
          >
            <text>{{ item.onename }}</text>
          </view>
          <!-- 二级循环 -->
          <view
            class="settings_two"
            v-for="(item2, index2) in item.positiontwo"
            :key="index2"
            :class="item2.twoliststare ? 'shadeshow' : 'shadehide'"
          >
            <view
              class="settings-two-label"
              @click="twolist(positionlistIndex, index, index2)"
            >
              <text class="paraName">{{ item2.twoname }}</text>
              <text class="parameter">{{ item2.twoparameter }}</text>
            </view>
            <!-- 这里是遮罩层 -->
            <view class="shade">
              <view class="popup">
                <text>{{ item2.twoname }}</text>
                <input
                  type="text"
                  v-if="item2.disable == true"
                  disabled="disablad"
                  @input="_input"
                  :value="item2.twoparameter"
                />
                <input
                  type="text"
                  v-else
                  @input="_input"
                  :value="item2.twoparameter"
                />
                <button @click="cancel(positionlistIndex, index, index2)">
                  取消
                </button>
                <button @click="confirm(positionlistIndex, index, index2)">
                  确认
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ind from "../../pages/index/index.vue";
import { LocationSceneTypeArrayTypeShengBo } from "../../Utils/constant";
export default {
  data() {
    return {
      settingShengBo: null,
      floorTypeArray: ["通用层", "-1层", "1层", "2层"],
      floorTypeIndex: 0,
      floor: "通用层",
      autoFloorRecTypeArray: [0, 1],
      autoFloorRecTypeIndex: 0,
      autoFloorRec: 0,
      positionlist: [
        // positionlist1:
        [
          {
            id: 0,
            onename: "频率范围设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "参考信号起始频率(Hz)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "参考信号终止频率(Hz)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "参考信号长度(s)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 3,
                twoname: "声速(m/s)",
                twoliststare: false,
                twoparameter: 0,
                disable: true,
              },
            ],
          },
          {
            id: 1,
            onename: "基站数量设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "基站数量",
                twoliststare: false,
                twoparameter: 6,
                disable: false,
              },
            ],
          },
          {
            id: 2,
            onename: "基站位置设置:x,y,z(m)",
            oneliststare: false,
            positiontwo: [],
          },
          {
            id: 3,
            onename: "惯导设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "Alpha角度",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "步长",
                twoliststare: false,
                twoparameter: 0.5,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "融合偏移距离限制(m)",
                twoliststare: false,
                twoparameter: 3,
                disable: false,
              },
            ],
          },
          {
            id: 4,
            onename: "声波设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "声波偏移距离限制(m)",
                twoliststare: false,
                twoparameter: 2.5,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "开启C64(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "声波基站高度(m)",
                twoliststare: false,
                twoparameter: 2,
                disable: false,
              },
              {
                twoid: 3,
                twoname: "vMaxTh",
                twoliststare: false,
                twoparameter: 0.5,
                disable: false,
              },
              {
                twoid: 4,
                twoname: "vRatioTh",
                twoliststare: false,
                twoparameter: 0.3,
                disable: false,
              },
              {
                twoid: 5,
                twoname: "pMaxTh",
                twoliststare: false,
                twoparameter: 2047,
                disable: false,
              },
              {
                twoid: 6,
                twoname: "maxRatioTh",
                twoliststare: false,
                twoparameter: 5,
                disable: false,
              },
              {
                twoid: 7,
                twoname: "开启滑动平均(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 8,
                twoname: "开启地图限制(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 9,
                twoname: "开启IMU静止判断(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
            ],
          },
          {
            id: 5,
            onename: "吸附数量设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "吸附数量",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
            ],
          },
          {
            id: 6,
            onename: "吸附位置设置:(x1,y1,x2,y2,l)(m)",
            oneliststare: false,
            positiontwo: [],
          },
        ],
        // positionlist2:
        [
          {
            id: 0,
            onename: "频率范围设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "参考信号起始频率(Hz)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "参考信号终止频率(Hz)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "参考信号长度(s)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 3,
                twoname: "声速(m/s)",
                twoliststare: false,
                twoparameter: 0,
                disable: true,
              },
            ],
          },
          {
            id: 1,
            onename: "基站数量设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "基站数量",
                twoliststare: false,
                twoparameter: 6,
                disable: false,
              },
            ],
          },
          {
            id: 2,
            onename: "基站位置设置:x,y,z(m)",
            oneliststare: false,
            positiontwo: [],
          },
          {
            id: 3,
            onename: "惯导设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "Alpha角度",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "步长",
                twoliststare: false,
                twoparameter: 0.5,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "融合偏移距离限制(m)",
                twoliststare: false,
                twoparameter: 3,
                disable: false,
              },
            ],
          },
          {
            id: 4,
            onename: "声波设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "声波偏移距离限制(m)",
                twoliststare: false,
                twoparameter: 2.5,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "开启C64(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "声波基站高度(m)",
                twoliststare: false,
                twoparameter: 2,
                disable: false,
              },
              {
                twoid: 3,
                twoname: "vMaxTh",
                twoliststare: false,
                twoparameter: 0.5,
                disable: false,
              },
              {
                twoid: 4,
                twoname: "vRatioTh",
                twoliststare: false,
                twoparameter: 0.3,
                disable: false,
              },
              {
                twoid: 5,
                twoname: "pMaxTh",
                twoliststare: false,
                twoparameter: 2047,
                disable: false,
              },
              {
                twoid: 6,
                twoname: "maxRatioTh",
                twoliststare: false,
                twoparameter: 5,
                disable: false,
              },
              {
                twoid: 7,
                twoname: "开启滑动平均(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 8,
                twoname: "开启地图限制(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 9,
                twoname: "开启IMU静止判断(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
            ],
          },
          {
            id: 5,
            onename: "吸附数量设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "吸附数量",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
            ],
          },
          {
            id: 6,
            onename: "吸附位置设置:(x1,y1,x2,y2,l)(m)",
            oneliststare: false,
            positiontwo: [],
          },
        ],
        // positionlist3:
        [
          {
            id: 0,
            onename: "频率范围设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "参考信号起始频率(Hz)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "参考信号终止频率(Hz)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "参考信号长度(s)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 3,
                twoname: "声速(m/s)",
                twoliststare: false,
                twoparameter: 0,
                disable: true,
              },
            ],
          },
          {
            id: 1,
            onename: "基站数量设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "基站数量",
                twoliststare: false,
                twoparameter: 6,
                disable: false,
              },
            ],
          },
          {
            id: 2,
            onename: "基站位置设置:x,y,z(m)",
            oneliststare: false,
            positiontwo: [],
          },
          {
            id: 3,
            onename: "惯导设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "Alpha角度",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "步长",
                twoliststare: false,
                twoparameter: 0.5,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "融合偏移距离限制(m)",
                twoliststare: false,
                twoparameter: 3,
                disable: false,
              },
            ],
          },
          {
            id: 4,
            onename: "声波设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "声波偏移距离限制(m)",
                twoliststare: false,
                twoparameter: 2.5,
                disable: false,
              },
              {
                twoid: 1,
                twoname: "开启C64(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 2,
                twoname: "声波基站高度(m)",
                twoliststare: false,
                twoparameter: 2,
                disable: false,
              },
              {
                twoid: 3,
                twoname: "vMaxTh",
                twoliststare: false,
                twoparameter: 0.5,
                disable: false,
              },
              {
                twoid: 4,
                twoname: "vRatioTh",
                twoliststare: false,
                twoparameter: 0.3,
                disable: false,
              },
              {
                twoid: 5,
                twoname: "pMaxTh",
                twoliststare: false,
                twoparameter: 2047,
                disable: false,
              },
              {
                twoid: 6,
                twoname: "maxRatioTh",
                twoliststare: false,
                twoparameter: 5,
                disable: false,
              },
              {
                twoid: 7,
                twoname: "开启滑动平均(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 8,
                twoname: "开启地图限制(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
              {
                twoid: 9,
                twoname: "开启IMU静止判断(1开启 0关闭)",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
            ],
          },
          {
            id: 5,
            onename: "吸附数量设置",
            oneliststare: false,
            positiontwo: [
              {
                twoid: 0,
                twoname: "吸附数量",
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              },
            ],
          },
          {
            id: 6,
            onename: "吸附位置设置:(x1,y1,x2,y2,l)(m)",
            oneliststare: false,
            positiontwo: [],
          },
        ],
      ],
    };
  },
  onLoad() {
    this.commonInit();
  },
  methods: {
    floorType(e) {
      this.floorTypeIndex = e.target.value;
      this.floor = this.floorTypeArray[this.floorTypeIndex];
      console.log(
        "floorTypeArray:",
        this.floorTypeArray,
        ", floorTypeIndex:",
        this.floorTypeIndex,
        ", this.floor:",
        this.floor
      );
      this.refreshUI();
    },
    autoFloorRecType(e) {
      this.autoFloorRecTypeIndex = e.target.value;
      this.autoFloorRec = this.autoFloorRecTypeArray[
        this.autoFloorRecTypeIndex
      ];
      console.log(
        "autoFloorRecTypeIndex:",
        this.autoFloorRecTypeIndex,
        ", autoFloorRec:",
        this.autoFloorRec
      );

      this.settingShengBo.autoFloorRec = this.autoFloorRec;
      console.log(this.settingShengBo);
      uni.$emit("updateSettingEvent", {
        settingShengBo: this.settingShengBo,
        locType: LocationSceneTypeArrayTypeShengBo,
      });
      uni.setStorageSync("settingShengBo", this.settingShengBo);
      if (this.autoFloorRec == 0) {
        this.floorTypeIndex = 0;
        this.floor = this.floorTypeArray[this.floorTypeIndex];
        this.refreshUI();
      }
    },
    // 一级菜单列表
    onelist(positionlistIndex, index) {
      // 展开收起一级列表 start
      if (
        this.positionlist[positionlistIndex][index]["oneliststare"] == false
      ) {
        this.positionlist[positionlistIndex][index]["oneliststare"] = true;
      } else {
        this.positionlist[positionlistIndex][index]["oneliststare"] = false;
      }
      // 展开收起一级列表 end
    },

    //二级菜单列表
    twolist(positionlistIndex, index, index2) {
      // let positionlist = this.positionlist;
      let positiontwo = this.positionlist[positionlistIndex][index].positiontwo[
        index2
      ]["twoliststare"];
      let disable = this.positionlist[positionlistIndex][index].positiontwo[
        index2
      ]["disable"];

      if (disable == false) {
        if (positiontwo == false) {
          // 模态框的显示
          this.positionlist[positionlistIndex][index].positiontwo[index2][
            "twoliststare"
          ] = true;
          // this.modalstare = true;
        } else {
          // 模态框的隐藏
          this.positionlist[positionlistIndex][index].positiontwo[index2][
            "twoliststare"
          ] = false;
          // this.modalstare = false;
        }
      }
    },

    // 点击取消
    cancel(positionlistIndex, index, index2) {
      this.positionlist[positionlistIndex][index].positiontwo[index2][
        "twoliststare"
      ] = false;
      this.twoparameter = "";
    },
    // 点击确认
    confirm(positionlistIndex, index, index2) {
      // 将input输入的数据同步到界面中进行显示
      let settingFlag = this.fixSetting(
        positionlistIndex,
        index,
        index2,
        this.twoparameter
      );
      if (settingFlag) {
        this.positionlist[positionlistIndex][index].positiontwo[index2][
          "twoparameter"
        ] = this.twoparameter; // _input内赋值twoparameter为输入值
        console.log(this.settingShengBo);
        uni.$emit("updateSettingEvent", {
          settingShengBo: this.settingShengBo,
          locType: LocationSceneTypeArrayTypeShengBo,
        });
        uni.setStorageSync("settingShengBo", this.settingShengBo);
      }

      // 点击确认模态框隐藏
      this.positionlist[positionlistIndex][index].positiontwo[index2][
        "twoliststare"
      ] = false;
      this.refreshUI();
      this.twoparameter = "";
    },
    _input(e) {
      // 将参数传出去，这样在getInput函数中可以通过e去获得必要的参数
      this.twoparameter = e.detail.value;
    },
    commonInit() {
      this.settingShengBo = ind.settingShengBo;
      // console.log("settingShengBo:", this.settingShengBo);
      this.refreshUI();
    },
    refreshUI() {
      for (let i = 0; i < this.positionlist.length; i++) {
        this.refreshUIItem(i);
      }
    },
    refreshUIItem(positionlistIndex) {
      let settingShengBo = uni.getStorageSync(
        "settingShengBo",
        this.settingShengBo
      );
      this.autoFloorRec = settingShengBo.autoFloorRec;
      this.autoFloorRecTypeIndex = this.autoFloorRecTypeArray.indexOf(
        this.autoFloorRec
      );
      console.log(
        "autoFloorRec:",
        this.autoFloorRec,
        ", autoFloorRecTypeIndex:",
        this.autoFloorRecTypeIndex
      );
      let settingShengBoItem =
        settingShengBo["settings"][this.floorTypeIndex][positionlistIndex];

      // 频率范围设置显示
      this.positionlist[positionlistIndex][0].positiontwo[0]["twoparameter"] =
        settingShengBoItem.frequencyStart;
      this.positionlist[positionlistIndex][0].positiontwo[1]["twoparameter"] =
        settingShengBoItem.frequencyEnd;
      this.positionlist[positionlistIndex][0].positiontwo[2]["twoparameter"] =
        settingShengBoItem.durationTime;
      this.positionlist[positionlistIndex][0].positiontwo[3]["twoparameter"] =
        settingShengBoItem.soundSpeed;

      // 基站数量设置
      this.positionlist[positionlistIndex][1].positiontwo[0]["twoparameter"] =
        settingShengBoItem.coordinate.length;

      this.positionlist[positionlistIndex][2].positiontwo = [];
      for (let i = 0; i < settingShengBoItem.coordinate.length; i++) {

        let beaconObj = {
          twoid: i,
          twoname: "基站" + (i + 1),
          twoliststare: false,
          twoparameter: settingShengBoItem.coordinate[i].join(","),
          disable: false,
        };

        this.positionlist[positionlistIndex][2].positiontwo.push(beaconObj);
      }

      // 惯导设置
      this.positionlist[positionlistIndex][3].positiontwo[0]["twoparameter"] =
        settingShengBoItem.imuAlpha;
      this.positionlist[positionlistIndex][3].positiontwo[1]["twoparameter"] =
        settingShengBoItem.imuSteps;
      this.positionlist[positionlistIndex][3].positiontwo[2]["twoparameter"] =
        settingShengBoItem.imuMaxDrift;
      // 声波设置
      this.positionlist[positionlistIndex][4].positiontwo[0]["twoparameter"] =
        settingShengBoItem.acousticMaxDrift;
      this.positionlist[positionlistIndex][4].positiontwo[1]["twoparameter"] =
        settingShengBoItem.acousticC64Flag;
      this.positionlist[positionlistIndex][4].positiontwo[2]["twoparameter"] =
        settingShengBoItem.acousticHeight;
      this.positionlist[positionlistIndex][4].positiontwo[3]["twoparameter"] =
        settingShengBoItem.vMaxTh;
      this.positionlist[positionlistIndex][4].positiontwo[4]["twoparameter"] =
        settingShengBoItem.vRatioTh;
      this.positionlist[positionlistIndex][4].positiontwo[5]["twoparameter"] =
        settingShengBoItem.pMaxTh;
      this.positionlist[positionlistIndex][4].positiontwo[6]["twoparameter"] =
        settingShengBoItem.maxRatioTh;
      this.positionlist[positionlistIndex][4].positiontwo[7]["twoparameter"] =
        settingShengBoItem.acousticSmoothFlag;
      this.positionlist[positionlistIndex][4].positiontwo[8]["twoparameter"] =
        settingShengBoItem.acousticMapLimitFlag;
      this.positionlist[positionlistIndex][4].positiontwo[9]["twoparameter"] =
        settingShengBoItem.acousticImuStaticFlag;

      // 吸附数量设置
      this.positionlist[positionlistIndex][5].positiontwo[0]["twoparameter"] =
        settingShengBoItem.closeCoordinate.length;

      this.positionlist[positionlistIndex][6].positiontwo = [];
      for (let i = 0; i < settingShengBoItem.closeCoordinate.length; i++) {

        let closeCoordinateObj = {
          twoid: i,
          twoname: "吸附" + (i + 1),
          twoliststare: false,
          twoparameter: settingShengBoItem.closeCoordinate[i].join(","),
          disable: false,
        };

        this.positionlist[positionlistIndex][6].positiontwo.push(
          closeCoordinateObj
        );
      }
    },
    fixSetting(positionlistIndex, index, index2, twoparameter) {
      // console.log("twoparameter:", twoparameter);
      if (twoparameter == "" || twoparameter == undefined) {
        return false;
      }
      // console.log(positionlistIndex, this.settingShengBo);
      // 频率范围设置显示
      if (index == 0) {
        if (index2 == 0) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].frequencyStart = twoparameter;
        }
        if (index2 == 1) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].frequencyEnd = twoparameter;
        }
        if (index2 == 2) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].durationTime = twoparameter;
        }
        if (index2 == 3) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].soundSpeed = twoparameter;
        }
      }
      // 基站数量设置
      if (index == 1) {
        if (index2 == 0) {
          if (twoparameter >= 4 && twoparameter <= 6) {
            this.beaconNumber = twoparameter;
            this.positionlist[positionlistIndex][2].positiontwo = [];
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].coordinate = [];
            for (let i = 0; i < this.beaconNumber; i++) {
              let beaconObj = {
                twoid: i,
                twoname: "基站" + (i + 1),
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              };

              this.positionlist[positionlistIndex][2].positiontwo.push(
                beaconObj
              );
              this.settingShengBo["settings"][this.floorTypeIndex][
                positionlistIndex
              ].coordinate.push([0, 0]);
            }
          } else {
            return false;
          }
        }
      }
      // 基站位置设置
      if (index == 2) {
        let beacon_arr = twoparameter.split(",");
        if (
          index2 >= 0 &&
          index2 <
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].coordinate.length
        ) {
          if (beacon_arr.length > 2) {
            console.log("请输入正确的二维坐标点，如： 1,2");
            return false;
          } else {
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].coordinate[index2][0] = parseFloat(beacon_arr[0]);
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].coordinate[index2][1] = parseFloat(beacon_arr[1]);
          }
        }
      }
      // 惯导设置
      if (index == 3) {
        if (index2 == 0) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].imuAlpha = parseFloat(twoparameter);
        }
        if (index2 == 1) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].imuSteps = parseFloat(twoparameter);
        }
        if (index2 == 2) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].imuMaxDrift = parseFloat(twoparameter);
        }
      }
      // 声波设置
      if (index == 4) {
        if (index2 == 0) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].acousticMaxDrift = parseFloat(twoparameter);
        }
        if (index2 == 1) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].acousticC64Flag = parseFloat(twoparameter);
        }
        if (index2 == 2) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].acousticHeight = parseFloat(twoparameter);
        }
        if (index2 == 3) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].vMaxTh = parseFloat(twoparameter);
        }
        if (index2 == 4) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].vRatioTh = parseFloat(twoparameter);
        }
        if (index2 == 5) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].pMaxTh = parseFloat(twoparameter);
        }
        if (index2 == 6) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].maxRatioTh = parseFloat(twoparameter);
        }
        if (index2 == 7) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].acousticSmoothFlag = parseFloat(twoparameter);
        }
        if (index2 == 8) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].acousticMapLimitFlag = parseFloat(twoparameter);
        }
        if (index2 == 9) {
          this.settingShengBo["settings"][this.floorTypeIndex][
            positionlistIndex
          ].acousticImuStaticFlag = parseFloat(twoparameter);
        }
      }
      // 吸附数量设置
      if (index == 5) {
        if (index2 == 0) {
          if (twoparameter >= 0 && twoparameter <= 6) {
            let closeCoordinateNumber = twoparameter;
            this.positionlist[positionlistIndex][6].positiontwo = [];
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].closeCoordinate = [];
            for (let i = 0; i < closeCoordinateNumber; i++) {
              let closeCoordinateObj = {
                twoid: i,
                twoname: "吸附" + (i + 1),
                twoliststare: false,
                twoparameter: 0,
                disable: false,
              };

              this.positionlist[positionlistIndex][6].positiontwo.push(
                closeCoordinateObj
              );
              this.settingShengBo["settings"][this.floorTypeIndex][
                positionlistIndex
              ].closeCoordinate.push([0, 0, 0, 0, -1]);
            }
          } else {
            return false;
          }
        }
      }
      // 吸附位置设置
      if (index == 6) {
        let closeCoordinateArr = twoparameter.split(",");
        if (
          index2 >= 0 &&
          index2 <
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].closeCoordinate.length
        ) {
          if (closeCoordinateArr.length != 5) {
            console.log("请输入正确的吸附位置，如： 0, 6.892, 12.5, 6.892, 1");
            return false;
          } else {
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].closeCoordinate[index2][0] = parseFloat(closeCoordinateArr[0]);
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].closeCoordinate[index2][1] = parseFloat(closeCoordinateArr[1]);
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].closeCoordinate[index2][2] = parseFloat(closeCoordinateArr[2]);
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].closeCoordinate[index2][3] = parseFloat(closeCoordinateArr[3]);
            this.settingShengBo["settings"][this.floorTypeIndex][
              positionlistIndex
            ].closeCoordinate[index2][4] = parseFloat(closeCoordinateArr[4]);
          }
        }
      }
      return true;
    },
  },
};
</script>

<style scoped lang="scss">
page {
  background: #fff;
}
.position-group {
  width: 100%;
  height: auto;
}
/* 一级 */
.settings_zero {
  width: 100%;
  height: auto;
}
/* 一级 */
.settings_one {
  width: 100%;
  height: auto;
}
.settings-one-label {
  width: 100%;
  height: 110rpx;
  line-height: 110rpx;
  background: #fff;
  box-sizing: border-box;
  padding: 0px 3%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px #eaeaea solid;
  text {
    font-size: 15px;
    color: #2ebbfe;
  }
}

/* 二级 */
.settings_two {
  width: 100%;
  height: auto;
  transition: all 0.5s;
  //遮罩层
  .shade {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.1);
    //模态框
    .popup {
      width: 500rpx;
      height: 300rpx;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #ffffff;

      padding: 20rpx;
      text {
        font-size: 24rpx;
      }
      input {
        margin: 20rpx auto;
        border-bottom: 1px solid #000;
      }
      button {
        margin: 30rpx;
        width: 25%;
        height: 50rpx;
        font-size: 20rpx;
        color: #000;
        float: left;
      }
    }
  }
}
.settings-two-label {
  width: 100%;
  height: 110rpx;
  line-height: 110rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0px 3%;
  border-bottom: 1px #eee solid;
  .paraName {
    font-size: 12px;
    color: #333;
  }
  .parameter {
    font-size: 12px;
    color: #333;
  }
}

/* 一级菜单展开收起效果 start */
.oneshow {
  .settings_two {
    display: block;
  }
}

.onehide {
  .settings_two {
    display: none;
  }
}

/* 模态框展开收起效果 end */
.shadeshow {
  .shade {
    display: block;
  }
}

.shadehide {
  .shade {
    display: none;
  }
}
</style>
