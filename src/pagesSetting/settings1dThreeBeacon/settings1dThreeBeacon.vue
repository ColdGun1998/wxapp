<template>
  <view class="content">
    <view class="position-group">
      <!-- 一级循环 -->
      <view
        class="settings_one"
        v-for="(item, index) in positionlist"
        :key="index"
        :class="item.oneliststare ? 'oneshow' : 'onehide'"
      >
        <view class="settings-one-label" @click="onelist(index)">
          <text>{{ item.onename }}</text>
        </view>
        <!-- 二级循环 -->
        <view
          class="settings_two"
          v-for="(item2, index2) in item.positiontwo"
          :key="index2"
          :class="item2.twoliststare ? 'shadeshow' : 'shadehide'"
        >
          <view class="settings-two-label" @click="twolist(index, index2)">
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
              <button @click="cancel(index, index2)">取消</button>
              <button @click="confirm(index, index2)">确认</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ind from "../../pages/index/index.vue";
import { LocationSceneTypeArrayType1DThreeBeacon } from "../../Utils/constant";
export default {
  data() {
    return {
      setting1: null,
      setting2: null,
      positionSele: true,
      positionlist: [
        {
          id: 0,
          onename: "频率范围设置",
          oneliststare: false,
          positiontwo: [
            {
              twoid: 0,
              twoname: "基站组1参考信号起始频率(Hz)",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
            {
              twoid: 1,
              twoname: "基站组1参考信号终止频率(Hz)",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
            {
              twoid: 2,
              twoname: "基站组2参考信号起始频率(Hz)",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
            {
              twoid: 3,
              twoname: "基站组2参考信号终止频率(Hz)",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
            {
              twoid: 4,
              twoname: "参考信号长度(s)",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
            {
              twoid: 5,
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
              twoparameter: 3,
              disable: true,
            },
          ],
        },
        {
          id: 2,
          onename: "基站位置设置:x,y,z(m)",
          oneliststare: false,
          positiontwo: [
            {
              twoid: 0,
              twoname: "基站1",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
            {
              twoid: 1,
              twoname: "基站2",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
            {
              twoid: 2,
              twoname: "基站3",
              twoliststare: false,
              twoparameter: 0,
              disable: false,
            },
          ],
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
          ],
        },
      ],
    };
  },
  onLoad() {
    this.commonInit();
  },
  methods: {
    //一级菜单列表
    onelist(index) {
      let positionlist = this.positionlist;
      // 展开收起一级列表 start
      if (positionlist[index]["oneliststare"] == false) {
        positionlist[index]["oneliststare"] = true;
      } else {
        positionlist[index]["oneliststare"] = false;
      }
      // 展开收起一级列表 end
    },

    //二级菜单列表
    twolist(index, index2) {
      // let positionlist = this.positionlist;
      let positiontwo = this.positionlist[index].positiontwo[index2][
        "twoliststare"
      ];
      let disable = this.positionlist[index].positiontwo[index2]["disable"];

      if (disable == false) {
        if (positiontwo == false) {
          //模态框的显示
          this.positionlist[index].positiontwo[index2]["twoliststare"] = true;
          // this.modalstare = true;
        } else {
          //模态框的隐藏
          this.positionlist[index].positiontwo[index2]["twoliststare"] = false;
          // this.modalstare = false;
        }
      }
    },

    //点击取消
    cancel(index, index2) {
      this.positionlist[index].positiontwo[index2]["twoliststare"] = false;
    },
    //点击确认
    confirm(index, index2) {
      //将input输入的数据同步到界面中进行显示
      this.fixSetting(index, index2, this.twoparameter);
      this.positionlist[index].positiontwo[index2][
        "twoparameter"
      ] = this.twoparameter; // _input内赋值twoparameter为输入值
      // console.log(this.setting2D);
      uni.$emit("updateSettingEvent", {
        setting1: this.setting1,
        setting2: this.setting2,
        locType: LocationSceneTypeArrayType1DThreeBeacon,
      });
      //点击确认模态框隐藏
      this.positionlist[index].positiontwo[index2]["twoliststare"] = false;
      uni.setStorageSync("setting1", this.setting1);
      uni.setStorageSync("setting2", this.setting2);
    },
    _input(e) {
      //将参数传出去，这样在getInput函数中可以通过e去获得必要的参数
      this.twoparameter = e.detail.value;
    },
    commonInit() {
      this.setting1 = ind.setting1;
      this.setting2 = ind.setting2;
      this.refreshUI();
    },
    refreshUI() {
      let setting1 = uni.getStorageSync("setting1", this.setting1);
      let setting2 = uni.getStorageSync("setting2", this.setting2);
      // let setting1 = this.setting1;
      // let setting2 = this.setting2;

      // 频率范围设置显示
      this.positionlist[0].positiontwo[0]["twoparameter"] =
        setting1.frequencyStart;
      this.positionlist[0].positiontwo[1]["twoparameter"] =
        setting1.frequencyEnd;
      this.positionlist[0].positiontwo[2]["twoparameter"] =
        setting2.frequencyStart;
      this.positionlist[0].positiontwo[3]["twoparameter"] =
        setting2.frequencyEnd;
      this.positionlist[0].positiontwo[4]["twoparameter"] =
        setting1.durationTime;
      this.positionlist[0].positiontwo[5]["twoparameter"] = setting1.soundSpeed;

      // 基站数量设置
      this.positionlist[1].positiontwo[0]["twoparameter"] = 3;

      // 基站位置设置显示
      this.positionlist[2].positiontwo[0]["twoparameter"] =
        setting1.coordinate[0];
      this.positionlist[2].positiontwo[1]["twoparameter"] =
        setting1.coordinate[1];
      this.positionlist[2].positiontwo[2]["twoparameter"] =
        setting2.coordinate[1];
      // 惯导设置
      this.positionlist[3].positiontwo[0]["twoparameter"] = setting1.imuAlpha;
    },
    fixSetting(index, index2, twoparameter) {
      // 频率范围设置显示
      if (index == 0) {
        if (index2 == 0) {
          this.setting1.frequencyStart = twoparameter;
        }
        if (index2 == 1) {
          this.setting1.frequencyEnd = twoparameter;
        }
        if (index2 == 2) {
          this.setting2.frequencyStart = twoparameter;
        }
        if (index2 == 3) {
          this.setting2.frequencyEnd = twoparameter;
        }
        if (index2 == 4) {
          this.setting1.durationTime = twoparameter;
        }
        if (index2 == 5) {
          this.setting1.soundSpeed = twoparameter;
        }
      }
      // 基站位置设置显示
      if (index == 2) {
        let beacon_arr = twoparameter.split(",");
        if (index2 == 0) {
          if (beacon_arr.length > 2) {
            console.log("请输入正确的二维坐标点，如： 1,2");
          } else {
            this.setting1.coordinate[0][0] = parseFloat(beacon_arr[0]);
            this.setting1.coordinate[0][1] = parseFloat(beacon_arr[1]);
          }
        } else if (index2 == 1) {
          if (beacon_arr.length > 2) {
            console.log("请输入正确的二维坐标点，如： 1,2");
          } else {
            this.setting1.coordinate[1][0] = parseFloat(beacon_arr[0]);
            this.setting1.coordinate[1][1] = parseFloat(beacon_arr[1]);

            this.setting2.coordinate[0][0] = parseFloat(beacon_arr[0]);
            this.setting2.coordinate[0][1] = parseFloat(beacon_arr[1]);
          }
        } else if (index2 == 2) {
          if (beacon_arr.length > 2) {
            console.log("请输入正确的二维坐标点，如： 1,2");
          } else {
            this.setting2.coordinate[1][0] = parseFloat(beacon_arr[0]);
            this.setting2.coordinate[1][1] = parseFloat(beacon_arr[1]);
          }
        }
      }
      // 惯导设置
      if (index == 3) {
        if (index2 == 0) {
          this.setting1.imuAlpha = parseFloat(twoparameter);
          this.setting2.imuAlpha = parseFloat(twoparameter);
        }
      }

      this.setting1.totalLength =
        this.setting1.coordinate[1][0] - this.setting1.coordinate[0][0];
      this.setting2.totalLength =
        this.setting2.coordinate[1][0] - this.setting2.coordinate[0][0];
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
