<template>
  <div class="wrap">
    <ul class="sidebar">
      <li v-for="(item, index) in infoList" :class="[select === item.id? 'active':'default']" :key="item.id" @click="changeTab(item)">
        <div :class="[item.name, 'img']"></div>
        <div class="text">{{item.text}}</div>
      </li>
    </ul>
    <div class="detail">
      <!-- 修改头像 -->
      <div v-show="select===1">
        <Head></Head>
      </div>
      <!-- 个人信息 -->
      <div v-show="select===2">
        <Info></Info>
      </div>
      <!-- 修改密码 -->
      <div v-show="select===3">
        <Pwd></Pwd>
      </div>
      <!-- 我的绩效 -->
      <div v-show="select===4">
        <Kpi></Kpi>
      </div>
    </div>
  </div>
</template>

<script>
import Head from './sub/head'
import Info from './sub/info'
import Pwd from './sub/pwd'
import Kpi from './sub/kpi'

const HEAD = 1
// const INFO = 2
// const PWD = 3
// const KPI = 4

export default {
  data() {
    return {
      // 默认选中
      select: HEAD,
      infoList: [
        {
          id: 1,
          name: "head",
          text: "修改头像"
        },
        {
          id: 2,
          name: "info",
          text: "个人信息"
        },
        {
          id: 3,
          name: "pwd",
          text: "修改密码"
        },
        {
          id: 4,
          name: "kpi",
          text: "我的绩效"
        }
      ]
    };
  },
  components: {
    Head,
    Info,
    Pwd,
    Kpi
  },
  methods: {
    // 改变选项卡
    changeTab(item) {
      this.select = item.id
    }
  }
};
</script>
<style lang='scss' rel="stylesheet/scss" scoped>
.wrap {
  display: flex;
  padding-top: 40px;
}
.sidebar {
  width: 150px;
  height: 380px;
  padding-left: 35px;
  border-right: 1px solid $border;
  background-color: $bg;
  .active {
    border-right: 2px solid $red;
    .text{
      color: $red;
    }
    .head {
      background: url("./head_on.png");
    }
    .info {
      background: url("./info_on.png");
    }
    .pwd {
      background: url("./pwd_on.png");
    }
    .kpi {
      background: url("./kpi_on.png");
    }
  }
  .default {
    .head {
      background: url("./head.png");
    }
    .info {
      background: url("./info.png");
    }
    .pwd {
      background: url("./pwd.png");
    }
    .kpi {
      background: url("./kpi.png");
    }
  }
  li {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-right: 10px;
    cursor: pointer;
    .img {
      width: 25px;
      height: 25px;
      margin-right: 10px;
    }
  }
}
.detail{
  flex: 1;
}
</style>