<template>
  <div class="wrap">
    <div class="side-bar">
      <div class="search-box">
        <input type="text" v-model="keywords" placeholder="请输入您要搜索的内容" />
        <img src="./img/delete.png" width="18px" height="18px" @click="clearText" />
        <div class="btn" @click="getHistory">查询</div>
      </div>
      <div class="bar-list">
        <div class="bar" v-for="(bar, barIndex) in barList" :key="bar.id">
          <div class="head" @click="showList(bar)">
            <div :class="[bar.show ? 'selected': '', 'type']">
              <img src="./img/arrow_r.png" />
              <span>{{bar.name}}</span>
            </div>
            <div class="number">{{bar.number}}</div>
          </div>
          <transition name="slide">
            <ul class="con" v-show="bar.show">
              <template v-if="bar.subList.length > 0">
                <li :class="[sub.isSelected ? 'selected': '']" v-for="(sub, subIndex) in bar.subList" :key="sub.id" @click="loadHistory(sub)">
                  <span class="name" v-if="sub.sesid">会话:{{sub.sesid}} {{sub.nickname || "未知会话"}}</span>
                  <span
                    class="name"
                    v-else
                  >{{sub.friendname || sub.privatename || sub.teamname || "未知会话"}}</span>
                  <div class="right">
                    <div class="number">{{sub.c}}</div>
                    <img src="./img/arrow_r.png" />
                  </div>
                </li>
              </template>
              <div v-else class="noData">暂无内容</div>
            </ul>
          </transition>
        </div>
      </div>
    </div>
    <div class="container">
      <ul class="content">
        <li v-for="(item, index) in contentList" :key="item.msgid">
          <div class="title">
            <div class="time">{{item.timeline | format}}</div>
            <div class="name">{{item.fromname}}</div>
          </div>
          <div class="con" style="word-wrap:break-word" v-html="showMsgDataHandler(item)"></div>
        </li>
      </ul>
    </div>
    <layer-content ref="layer"></layer-content>
  </div>
</template>

<script>
import {
  historyList,
  sessionHistory,
  teamHistory,
  friendHistory,
  privateHistory
} from 'api/http/sessionChat'
import { copy, copy2, faceImgMap, isJson, formatDate } from 'common/js/util'
import { msgDataHandler } from 'common/js/business'

export default {
  data() {
    return {
      // 搜索内容
      keywords: '',
      // content列表
      contentList: [],
      // bar列表
      barList: [
        {
          id: 1,
          name: '咨询历史',
          number: 5,
          show: false,
          subList: []
        },
        {
          id: 2,
          name: '群组',
          number: 5,
          show: false,
          subList: []
        },
        {
          id: 3,
          name: '同伴',
          number: 5,
          show: false,
          subList: []
        },
        {
          id: 4,
          name: '私聊',
          number: 5,
          show: false,
          subList: []
        }
      ]
    }
  },
  created() {
    // 获取历史列表
    this.getHistory()
  },
  methods: {
    // 获取历史tab列表
    getHistory() {
      this.contentList = []
      historyList({ keywords: this.keywords }).then(res => {
        if (res.data.returncode == 0) {
          this.addItem(res.data.sessionList, 0)
          this.addItem(res.data.teamList, 1)
          this.addItem(res.data.friendList, 2)
          this.addItem(res.data.privateList, 3)
        } else {
          this.$refs.layer.show(res.data.message)
        }
    })
    .catch(res => {
        this.$refs.layer.show(res)
      })
    },
    // 增加tab子列表
    addItem(list, index) {
      this.barList[index].subList = []
      let id = 0
      list.forEach((e, i, arr) => {
        id++
        e.id = id
        e.isSelected = false
        this.barList[index].subList.push(e)
        this.barList[index].number = list.length || 0
      })
    },
    // 加载历史消息
    loadHistory(item) {
      item.keywords = this.keywords
      // 选中样式
      this.barList.forEach((tab) => {
        tab.subList.forEach((sub) => {
          sub.isSelected = false
        })
      })
      item.isSelected = true
      console.log(item)
      // 请求消息数据
      if (item.sesid) {
        this.getSessionHistory(item)
      }
      if (item.friendid) {
        this.getFriendHistory(item)
      }
      if (item.privateid) {
        this.getPrivateHistory(item)
      }
      if (item.teamid) {
        this.getTeamHistory(item)
      }
    },
    // 会话历史消息
    getSessionHistory(data) {
      sessionHistory(data)
        .then(res => {
          if (res.data.returncode == '0') {
            // console.log(res)
            this.contentList = res.data.list
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 群历史消息
    getTeamHistory(data) {
      teamHistory(data)
        .then(res => {
          // console.log(res)
          if (res.data.returncode == '0') {
            this.contentList = res.data.list
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 同伴历史消息
    getFriendHistory(data) {
      friendHistory(data)
        .then(res => {
          // console.log(res)
          if (res.data.returncode == '0') {
            this.contentList = res.data.list
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 私聊历史消息
    getPrivateHistory(data) {
      privateHistory(data)
        .then(res => {
          if (res.data.returncode == '0') {
            // 安卓消息格式处理
            res.data.list.forEach((e, i, arr) => {
              let isjson = isJson(e.msgbody)
              //   安卓发的是json格式 {msgtext, teamid, teamname}
              if (isjson) {
                let msgbody = JSON.parse(e.msgbody)
                e.msgbody = msgbody.msgtext
              }
            })
            this.contentList = res.data.list
          } else {
            this.$refs.layer.show(res.data.message)
          }
        })
        .catch(res => {
          this.$refs.layer.show(res)
        })
    },
    // 处理消息内容
    showMsgDataHandler(data) {
      // console.log(data)
      let result = msgDataHandler(data)
      // console.log(result)
      return result
    },
    // 清除搜索内容
    clearText() {
      this.contentList = []
      this.keywords = ''
    },
    showList(item) {
      item.show = !item.show
    }
  },
  filters: {
    format(date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  }
}
</script>
<style lang='scss' rel="stylesheet/scss" scoped>
.wrap {
  display: flex;
  height: 100%;
}
.side-bar {
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 100%;
  border: 1px solid $border;
  border-right: 1px solid $border;
  background-color: $blank;
  .search-box {
    padding: 20px 0 20px 20px;
    border-bottom: 1px solid $border;
    input {
      width: 160px;
      height: 30px;
      font-size: 12px;
      padding: 2px;
      border-radius: 4px;
      border: 1px solid $border;
    }
    img {
      position: absolute;
      margin-left: -25px;
      margin-top: 6px;
      cursor: pointer;
    }
    .btn {
      display: inline-block;
      width: 56px;
      height: 28px;
      background: $red;
      text-align: center;
      line-height: 28px;
      color: $blank;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      opacity: 0.8;
      cursor: pointer;
      &:hover {
        opacity: 1;
      }
    }
  }
}
.bar-list {
  flex: 1;
  overflow: scroll;
  .bar {
    cursor: pointer;
    .head {
      width: 100%;
      height: 35px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: bold;
      padding-left: 10px;
      padding-right: 10px;
      border-bottom: 1px solid $border;
      &:hover {
        background-color: $listHover;
      }
      .type {
        display: flex;
        align-items: center;
        img {
          width: 15px;
          height: 15px;
          margin-right: 2px;
          -webkit-animation: rotateBack 0.5s infinite;
          -webkit-animation-iteration-count: 1;
          -webkit-animation-fill-mode: forwards;
        }
      }
      .selected {
        span {
          color: $primary;
        }
        img {
          -webkit-animation: rotateGo 0.5s infinite;
          -webkit-animation-iteration-count: 1;
          -webkit-animation-fill-mode: forwards;
        }
      }
      .number {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        color: #fff;
        background-color: $red;
        text-align: center;
        line-height: 25px;
      }
    }
    .con {
      .noData {
        width: 100%;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 14px;
        cursor: default;
      }
      .selected {
         background-color: $listHover !important;
      }
      li {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px 0 20px;
        background-color: $blank;
        &:hover {
          background-color: $listLightHover;
        }
        .name {
          font-size: 12px;
        }
        .right {
          display: flex;
          align-items: center;
          .number {
            color: $green;
            margin-right: 6px;
          }
          img {
            width: 15px;
            height: 15px;
          }
        }
      }
    }
  }
}
.container {
  height: 650px;
  overflow: auto;
  flex: 1;
  .content {
    padding: 20px;
    li {
      background-color: #fff;
      padding: 20px 10px;
      margin-bottom: 10px;
      .title {
        display: flex;
        align-items: center;
        font-size: 12px;
        margin-bottom: 10px;
        font-weight: bold;
        .name {
          color: $primary;
          margin-left: 10px;
        }
      }
      .con {
        font-size: 12px;
      }
    }
  }
}

.slide-enter,
.slide-leave-active {
  opacity: 0;
}
.slide-leave-active,
.slide-enter-active {
  transition: all 0.2s;
}
@-webkit-keyframes rotateGo {
  from {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }

  to {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }
}

@-webkit-keyframes rotateBack {
  from {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  to {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
}
</style>